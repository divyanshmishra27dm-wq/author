/**
 * HDFC Academy Day 2 — Mobile-First SCORM 2004 Interactive Engine
 */
(function () {
  const urlParams = (typeof window !== 'undefined' && window.location)
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams('');
  const courseParam = (urlParams.get('course') || '').toLowerCase();
  const isDay3 = courseParam === 'day3';
  const isLesson1 = courseParam === 'lesson1' || courseParam === 'lesson_1';

  // Resolve course chapters: specific course param > direct window.COURSE_CHAPTERS > courseData fallbacks
  let rawChapters = [];
  if (isLesson1 && window.COURSE_CHAPTERS_LESSON1) {
    rawChapters = window.COURSE_CHAPTERS_LESSON1;
  } else if (isDay3 && window.COURSE_CHAPTERS_DAY3) {
    rawChapters = window.COURSE_CHAPTERS_DAY3;
  } else {
    rawChapters = window.COURSE_CHAPTERS || window.COURSE_CHAPTERS_DAY2 || window.COURSE_CHAPTERS_DAY3 || window.COURSE_CHAPTERS_LESSON1 || [];
  }

  const COURSE_CHAPTERS = Array.isArray(rawChapters) ? rawChapters : [];

  if (!COURSE_CHAPTERS.length) {
    console.error('Course data not found!');
    const mainEl = document.getElementById('mainContent');
    if (mainEl) {
      mainEl.innerHTML = '<div style="padding:40px;text-align:center;color:#002D5A;"><h2>Course modules loading...</h2><p>Please refresh the page if this persists.</p></div>';
    }
    return;
  }

  if (isLesson1) {
    document.title = "HDFC Academy · Lesson 1: Importance of CASA";
    const kicker = document.querySelector('.drawer-kicker');
    if (kicker) kicker.textContent = "LESSON 1 CURRICULUM";
    const brandTitle = document.getElementById('headerTitle');
    if (brandTitle) brandTitle.textContent = "Lesson 1: Importance of CASA";
  } else if (isDay3) {
    document.title = "HDFC Academy · Day 3: Know Your Product — CASA & Savings Mastery";
    const kicker = document.querySelector('.drawer-kicker');
    if (kicker) kicker.textContent = "DAY 3 CURRICULUM";
  }

  const scormApi = (typeof window !== 'undefined' && window.SCORM2004)
    ? window.SCORM2004
    : (typeof SCORM2004 !== 'undefined' ? SCORM2004 : {
      init: () => true,
      loadState: () => null,
      saveState: () => { },
      finish: () => { },
      isConnected: () => false
    });

  try {
    scormApi.init();
  } catch (initErr) {
    console.warn('SCORM init warning:', initErr);
  }

  const saved = (function () {
    try {
      return scormApi.loadState() || {};
    } catch (e) {
      return {};
    }
  })();

  // CRITICAL SANITIZATION: Never allow saved.currentChapter to exceed valid chapter bounds!
  let initialChapter = 0;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const chParam = urlParams.get('ch');
    if (chParam !== null && !isNaN(Number(chParam))) {
      const chNum = parseInt(chParam, 10);
      if (chNum >= 0 && chNum < COURSE_CHAPTERS.length) {
        initialChapter = chNum;
      }
    } else if (typeof saved.currentChapter === 'number' && saved.currentChapter >= 0 && saved.currentChapter < COURSE_CHAPTERS.length) {
      initialChapter = saved.currentChapter;
    }
  } catch (e) {
    if (typeof saved.currentChapter === 'number' && saved.currentChapter >= 0 && saved.currentChapter < COURSE_CHAPTERS.length) {
      initialChapter = saved.currentChapter;
    }
  }

  let initialVisited = [initialChapter];
  if (Array.isArray(saved.visited)) {
    initialVisited = saved.visited.filter(i => typeof i === 'number' && i >= 0 && i < COURSE_CHAPTERS.length);
    if (!initialVisited.includes(initialChapter)) initialVisited.push(initialChapter);
  }

  const state = {
    currentChapter: initialChapter,
    visited: initialVisited,
    answers: (saved.answers && typeof saved.answers === 'object') ? saved.answers : {},
    notes: typeof saved.notes === 'string' ? saved.notes : '',
    videoPreviews: (saved.videoPreviews && typeof saved.videoPreviews === 'object') ? saved.videoPreviews : {},
    completed: !!saved.completed
  };

  const els = {
    main: document.getElementById('mainContent'),
    headerTitle: document.getElementById('headerTitle'),
    scorePill: document.getElementById('scorePill'),
    progressFill: document.getElementById('progressFill'),
    stepIndicator: document.getElementById('stepIndicator'),
    lmsBadge: document.getElementById('lmsBadge'),
    bottomTag: document.getElementById('bottomChapterTag'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    nextLabel: document.getElementById('nextBtnLabel'),
    menuBtn: document.getElementById('menuBtn'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawer: document.getElementById('navDrawer'),
    backdrop: document.getElementById('drawerBackdrop'),
    moduleList: document.getElementById('moduleList'),
    drawerCompleted: document.getElementById('drawerCompleted'),
    drawerScore: document.getElementById('drawerScore'),
    finishCourseBtn: document.getElementById('finishCourseBtn'),
    quickIndexBtn: document.getElementById('quickIndexBtn')
  };

  els.lmsBadge.textContent = scormApi.isConnected() ? 'LMS SCORM 2004 Connected' : 'SCORM 2004 Ready';

  function computeScore() {
    let total = 0;
    let correct = 0;
    COURSE_CHAPTERS.forEach(ch => {
      (ch.blocks || []).forEach(b => {
        if (!b) return;
        if (b.type === 'quiz_mcq') {
          if (Array.isArray(b.questions)) {
            b.questions.forEach((q, qi) => {
              total++;
              const key = `${b.id}_q${qi}`;
              if (state.answers[key] === q.correct) correct++;
            });
          } else if (Array.isArray(b.options)) {
            total++;
            const key = `${b.id}_q0`;
            if (state.answers[key] === b.correct) correct++;
          }
        } else if (b.type === 'quiz_blanks') {
          (b.items || []).forEach((it, bi) => {
            total++;
            const key = `${b.id}_b${bi}`;
            const val = (state.answers[key] || '').trim().toLowerCase();
            if (val === (it.answer || '').trim().toLowerCase()) correct++;
          });
        } else if (b.type === 'quiz_match') {
          (b.pairs || []).forEach((p, pi) => {
            total++;
            const key = `${b.id}_m${pi}`;
            if (state.answers[key] === p.answer) correct++;
          });
        } else if (b.type === 'kyc_sorter') {
          (b.docs || []).forEach((d, di) => {
            total++;
            const key = `${b.id}_s${di}`;
            if (state.answers[key] === d.valid) correct++;
          });
        }
      });
    });
    return { total, correct, pct: total ? Math.round((correct / total) * 100) : 0 };
  }

  function persist() {
    if (!state.visited.includes(state.currentChapter)) {
      state.visited.push(state.currentChapter);
    }
    const { pct } = computeScore();
    const progressMeasure = state.visited.length / COURSE_CHAPTERS.length;
    if (progressMeasure >= 1 && !state.completed) {
      state.completed = true;
    }
    scormApi.saveState({
      currentChapter: state.currentChapter,
      visited: state.visited,
      answers: state.answers,
      notes: state.notes,
      videoPreviews: state.videoPreviews,
      completed: state.completed,
      progressMeasure,
      scoreScaled: pct / 100
    });
    updateChrome();
  }

  function updateChrome() {
    if (state.currentChapter < 0) state.currentChapter = 0;
    if (state.currentChapter >= COURSE_CHAPTERS.length) state.currentChapter = Math.max(0, COURSE_CHAPTERS.length - 1);
    const ch = COURSE_CHAPTERS[state.currentChapter] || { shortTitle: 'Module', num: '01' };
    const { pct } = computeScore();
    const visitedCount = state.visited.length;
    const progPct = state.completed ? 100 : Math.round((visitedCount / COURSE_CHAPTERS.length) * 100);

    if (els.headerTitle) els.headerTitle.textContent = ch.shortTitle || 'Module';
    if (els.scorePill) els.scorePill.textContent = `${pct}%`;
    if (els.progressFill) els.progressFill.style.width = `${progPct}%`;
    if (els.stepIndicator) {
      els.stepIndicator.textContent = state.completed
        ? `Status: Completed ✓ · All ${COURSE_CHAPTERS.length} Chapters Visited`
        : `Chapter ${state.currentChapter + 1} of ${COURSE_CHAPTERS.length} · ${visitedCount} Visited`;
    }
    if (els.lmsBadge) {
      if (state.completed) {
        els.lmsBadge.textContent = '✓ SCORM: Completed';
        els.lmsBadge.style.color = '#34d399';
        els.lmsBadge.style.borderColor = '#10b981';
      } else {
        els.lmsBadge.textContent = scormApi.isConnected() ? 'LMS SCORM 2004 Connected' : 'SCORM 2004 Ready';
        els.lmsBadge.style.color = '';
        els.lmsBadge.style.borderColor = '';
      }
    }
    if (els.bottomTag) els.bottomTag.textContent = `${String(state.currentChapter + 1).padStart(2, '0')} / ${COURSE_CHAPTERS.length}`;
    if (els.drawerCompleted) els.drawerCompleted.textContent = `${visitedCount}/${COURSE_CHAPTERS.length}`;
    if (els.drawerScore) els.drawerScore.textContent = `${pct}%`;

    const drawerTitleEl = document.querySelector('.drawer-title');
    if (drawerTitleEl) {
      drawerTitleEl.textContent = `All ${COURSE_CHAPTERS.length} Chapters`;
    }
    const statBoxes = document.querySelectorAll('.drawer-stats .stat-box');
    if (statBoxes && statBoxes.length >= 3) {
      const vidCount = COURSE_CHAPTERS.reduce((cnt, c) => cnt + ((c.blocks || []).filter(b => b.type === 'video_placeholder').length), 0);
      const vidVal = statBoxes[2].querySelector('.stat-val');
      if (vidVal) vidVal.textContent = String(vidCount);
    }

    if (els.prevBtn) els.prevBtn.disabled = state.currentChapter === 0;
    if (els.nextLabel) {
      if (state.currentChapter === COURSE_CHAPTERS.length - 1) {
        els.nextLabel.textContent = 'Finish ✓';
      } else {
        els.nextLabel.textContent = 'Next →';
      }
    }
    renderDrawerList();
  }

  function renderDrawerList() {
    els.moduleList.innerHTML = COURSE_CHAPTERS.map((ch, idx) => {
      const isDone = state.visited.includes(idx);
      const isActive = idx === state.currentChapter;
      return `
        <button class="mod-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}" data-idx="${idx}">
          <span class="mod-num">${isDone && !isActive ? '✓' : ch.num}</span>
          <span class="mod-meta">
            <span class="mod-name">${ch.shortTitle}</span>
            <span class="mod-sub">${ch.title}</span>
          </span>
        </button>
      `;
    }).join('');

    els.moduleList.querySelectorAll('.mod-item').forEach(btn => {
      btn.addEventListener('click', () => {
        goToChapter(Number(btn.dataset.idx));
        closeDrawer();
      });
    });
  }

  function renderVideoStage(url, poster) {
    if (!url) {
      return `
        <div class="play-medallion">▶</div>
        <div class="video-placeholder-text">Video Player</div>
        <div class="video-placeholder-sub">Embedded media will display here</div>
      `;
    }
    const clean = url.trim();
    if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(clean)) {
      const posterAttr = poster ? `poster="${escapeHtml(poster)}"` : '';
      return `<video src="${escapeHtml(clean)}" ${posterAttr} controls playsinline preload="metadata" style="width:100%;max-height:480px;border-radius:12px;background:#000;display:block;margin:0 auto;box-shadow:0 6px 20px rgba(0,0,0,0.25);"></video>`;
    }
    return `<iframe src="${escapeHtml(clean)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:380px;border-radius:12px;border:none;"></iframe>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAudioBar(audioUrl, audioTitle) {
    if (!audioUrl || !String(audioUrl).trim()) return '';
    const label = audioTitle || 'Audio Narration';
    const cleanUrl = escapeHtml(String(audioUrl).trim());
    return `
      <div class="card-speaker-corner">
        <button type="button" class="card-audio-speaker-btn" data-audio-src="${cleanUrl}" data-title="${escapeHtml(label)}" title="${escapeHtml(label)} (Tap to Play/Pause)" aria-label="Play audio narration">
          <svg class="speaker-svg speaker-idle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <svg class="speaker-svg speaker-playing" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1"></rect>
            <rect x="14" y="5" width="4" height="14" rx="1"></rect>
          </svg>
        </button>
        <audio class="card-hidden-audio" preload="none" src="${cleanUrl}"></audio>
      </div>
    `;
  }

  function openExternalLink(e, url) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!url || url === '#' || url === 'https://') return;
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        try {
          if (window.top && window.top !== window) {
            window.top.open(url, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = url;
          }
        } catch (tErr) {
          window.location.href = url;
        }
      }
    } catch (err) {
      try {
        if (window.top && window.top !== window) {
          window.top.open(url, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = url;
        }
      } catch (tErr) {
        window.location.href = url;
      }
    }
  }
  window.openExternalLink = openExternalLink;

  function renderBoxes(boxes, gridCols) {
    if (!boxes || !boxes.length) return '';
    const colClass = gridCols ? `box-grid-${gridCols}` : (boxes.length === 2 ? 'box-grid-2' : (boxes.length === 3 ? 'box-grid-3' : (boxes.length >= 4 ? 'box-grid-4' : 'box-grid')));
    return `
      <div class="${colClass}">
        ${boxes.map((bx) => {
      const iconHtml = bx.icon ? `<div class="box-icon-wrap"><img src="${escapeHtml(bx.icon)}" alt="" loading="lazy" /></div>` : '';
      const badgeHtml = bx.badge ? `<span class="box-badge ${bx.badgeColor || ''}">${escapeHtml(bx.badge)}</span>` : '';
      const bulletsHtml = bx.bullets && bx.bullets.length ? `<ul class="rich-list" style="margin-top:8px;">${bx.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';
      const collHtml = bx.details ? `
            <details class="acc-item" style="margin-top:8px;">
              <summary>${bx.detailsLabel || 'View Details'}</summary>
              <div class="acc-body">${bx.details}</div>
            </details>
          ` : '';
      const cls = `box-card ${bx.highlight ? 'highlight' : ''} ${bx.gold ? 'gold-accent' : ''} ${bx.green ? 'green-accent' : ''}`;
      return `
            <div class="${cls}">
              <div class="box-header">
                ${iconHtml}
                <div>
                  ${badgeHtml}
                  <h3 class="box-title">${bx.title}</h3>
                </div>
              </div>
              <div class="box-body">
                ${bx.desc ? `<p>${bx.desc}</p>` : ''}
                ${bx.content || ''}
                ${bulletsHtml}
                ${collHtml}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;
  }

  function renderCollapsibles(collapsibles) {
    if (!collapsibles || !collapsibles.length) return '';
    return `
      <div class="collapsible-group" style="margin:14px 0;">
        ${collapsibles.map((c) => {
      const iconHtml = c.icon ? `<span class="box-summary-icon"><img src="${escapeHtml(c.icon)}" alt="" loading="lazy" /></span>` : '';
      const badgeHtml = c.badge ? `<span class="box-badge ${c.badgeColor || ''}" style="margin-right:6px;">${escapeHtml(c.badge)}</span>` : '';
      const isOpen = c.isOpen ? 'open' : '';
      return `
            <details class="box-collapsible" ${isOpen}>
              <summary>
                <div class="box-summary-left">
                  ${iconHtml}
                  <div>
                    ${badgeHtml}
                    <span>${c.title}</span>
                  </div>
                </div>
                <div class="box-chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </summary>
              <div class="box-collapse-content">
                ${c.content || ''}
                ${c.bullets && c.bullets.length ? `<ul class="rich-list">${c.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
              </div>
            </details>
          `;
    }).join('')}
      </div>
    `;
  }

  function renderTable(table) {
    if (!table || !table.rows) return '';
    const headers = table.headers || [];
    const rows = table.rows || [];
    return `
      <div class="table-wrap">
        <table class="data-table">
          ${headers.length ? `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` : ''}
          <tbody>
            ${rows.map(r => `<tr>${r.map((c, ci) => `<td class="${ci === 0 ? 'highlight-cell' : ''}">${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderStats(stats) {
    if (!stats || !stats.length) return '';
    return `
      <div class="stat-grid">
        ${stats.map(st => `
          <div class="stat-tile">
            <div class="stat-tile-val">${escapeHtml(st.value || '')}</div>
            <div class="stat-tile-lbl">${escapeHtml(st.label || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderBlock(block) {
    const audioHtml = renderAudioBar(block.audioUrl, block.audioTitle);

    if (block.type === 'section_hero') {
      const calloutHtml = block.callout
        ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>`
        : '';
      return `
        <div class="section-hero-card">
          ${block.tag ? `<div class="section-hero-eyebrow">${escapeHtml(block.tag)}</div>` : ''}
          ${audioHtml}
          <h2 class="section-hero-title">${block.heading || block.title || ''}</h2>
          ${block.body ? `<div class="section-hero-sub">${block.body}</div>` : ''}
          ${calloutHtml}
        </div>
      `;
    }

    if (block.type === 'url_redirect') {
      const targetUrl = block.url || '#';
      const displayText = block.urlText || block.heading || targetUrl;
      const safeTarget = escapeHtml(targetUrl);
      const safeText = escapeHtml(displayText);
      return `
        <section class="url-redirect-slide" onclick="openExternalLink(event, '${safeTarget}')">
          ${block.tag ? `<span class="card-tag blue">${escapeHtml(block.tag)}</span>` : '<span class="card-tag blue">External Resource</span>'}
          ${audioHtml}
          <div class="url-redirect-content">
            <div class="url-icon-wrap">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <a href="${safeTarget}" target="_blank" rel="noopener noreferrer" class="url-main-link" onclick="openExternalLink(event, '${safeTarget}')">
              ${safeText}
            </a>
            <div class="url-address-label">${safeTarget}</div>
            <a href="${safeTarget}" target="_blank" rel="noopener noreferrer" class="url-action-btn" onclick="openExternalLink(event, '${safeTarget}')">
              <span>Open Link</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <p class="url-redirect-hint">Tap anywhere to open link in a new window</p>
          </div>
        </section>
      `;
    }

    if (block.type === 'image') {
      return `
        <figure class="visual-card">
          ${audioHtml}
          <img src="${block.src}" alt="${escapeHtml(block.alt)}" loading="lazy" />
          ${block.caption ? `<figcaption class="visual-caption">📊 ${block.caption}</figcaption>` : ''}
        </figure>
      `;
    }

    if (block.type === 'think') {
      return `
        <section class="card">
          <span class="card-tag amber">Reflect &amp; Think</span>
          ${audioHtml}
          <h2>${block.title}</h2>
          <p><strong>${block.prompt}</strong></p>
          <details class="acc-item" style="margin-top:10px;">
            <summary>Tap to Reveal Key Mentor Takeaway</summary>
            <div class="acc-body">${block.hint}</div>
          </details>
        </section>
      `;
    }

    if (block.type === 'boxes' || block.type === 'card_grid' || block.type === 'box_grid') {
      const imageHtml = block.imageSrc
        ? `<div class="card-hero-image-wrap"><img src="${escapeHtml(block.imageSrc)}" alt="" class="card-hero-image" loading="lazy" /></div>`
        : '';
      const calloutHtml = block.callout
        ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>`
        : '';
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          ${audioHtml}
          <h2>${block.heading || block.title || ''}</h2>
          ${imageHtml}
          ${block.body || ''}
          ${renderBoxes(block.boxes, block.boxGridCols)}
          ${calloutHtml}
        </section>
      `;
    }

    if (block.type === 'table') {
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          ${audioHtml}
          <h2>${block.heading || block.title || ''}</h2>
          ${block.body || ''}
          ${renderTable({ headers: block.headers, rows: block.rows })}
          ${block.callout ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>` : ''}
        </section>
      `;
    }

    if (block.type === 'collapsible_boxes') {
      const imageHtml = block.imageSrc
        ? `<div class="card-hero-image-wrap"><img src="${escapeHtml(block.imageSrc)}" alt="" class="card-hero-image" loading="lazy" /></div>`
        : '';
      const calloutHtml = block.callout
        ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>`
        : '';
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          ${audioHtml}
          <h2>${block.heading}</h2>
          ${imageHtml}
          ${block.body || ''}
          ${renderCollapsibles(block.collapsibles || block.items)}
          ${calloutHtml}
        </section>
      `;
    }

    if (block.type === 'card') {
      const imageHtml = block.imageSrc
        ? `<div class="card-hero-image-wrap"><img src="${escapeHtml(block.imageSrc)}" alt="" class="card-hero-image" loading="lazy" /></div>`
        : '';
      const bulletsHtml = block.bullets
        ? `<ul class="rich-list ${block.listTone || ''}">${block.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
        : '';
      const statsHtml = block.stats ? renderStats(block.stats) : '';
      const boxesHtml = block.boxes ? renderBoxes(block.boxes, block.boxGridCols) : '';
      const collapsiblesHtml = block.collapsibles ? renderCollapsibles(block.collapsibles) : '';
      const tableHtml = block.table ? renderTable(block.table) : '';
      const calloutHtml = block.callout
        ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>`
        : '';
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          ${audioHtml}
          <h2>${block.heading}</h2>
          ${imageHtml}
          ${block.body || ''}
          ${statsHtml}
          ${bulletsHtml}
          ${boxesHtml}
          ${collapsiblesHtml}
          ${tableHtml}
          ${calloutHtml}
        </section>
      `;
    }

    if (block.type === 'stats' || block.type === 'stat_grid') {
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag gold">${block.tag}</span>` : '<span class="card-tag gold">Key Metrics</span>'}
          ${audioHtml}
          <h2>${block.heading || block.title || 'Key Metrics & Data'}</h2>
          ${block.body || ''}
          ${renderStats(block.stats || block.items)}
          ${block.callout ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>` : ''}
        </section>
      `;
    }

    if (block.type === 'accordion') {
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          ${audioHtml}
          <h2>${block.heading}</h2>
          <div class="acc-group">
            ${block.items.map((it, idx) => `
              <details class="acc-item" ${idx === 0 ? 'open' : ''}>
                <summary>${it.title}</summary>
                <div class="acc-body">${it.content}</div>
              </details>
            `).join('')}
          </div>
        </section>
      `;
    }

    if (block.type === 'video_placeholder') {
      const activeUrl = state.videoPreviews[block.id] || block.embedUrl || '';
      const posterUrl = block.poster || block.posterUrl || block.imageSrc || '';
      const watchForHtml = block.watchFor && block.watchFor.length
        ? `<div class="video-watch-box">
            <div class="video-watch-title">Key Learning Focus in This Video</div>
            <ul>${block.watchFor.map(w => `<li>${w}</li>`).join('')}</ul>
          </div>`
        : '';
      const toolsHtml = !block.embedUrl
        ? `<div class="video-embed-tools">
            <input type="text" class="video-url-input" id="input_${block.id}" value="${escapeHtml(activeUrl)}" placeholder="Paste .mp4 path or YouTube/Vimeo/LMS embed URL..." />
            <button type="button" class="video-load-btn" data-vid-id="${block.id}">Embed / Preview</button>
          </div>`
        : '';
      return `
        <section class="video-embed-card" id="wrap_${block.id}">
          <div class="video-header">
            <span class="video-badge">${block.badge || 'VIDEO LEARNING'}</span>
            ${block.duration ? `<span class="video-dur">⏱ ${block.duration}</span>` : ''}
          </div>
          <h2 class="video-title">${block.title}</h2>
          <div class="video-stage" id="stage_${block.id}">
            ${renderVideoStage(activeUrl, posterUrl)}
          </div>
          ${watchForHtml}
          ${toolsHtml}
        </section>
      `;
    }

    if (block.type === 'quiz_mcq') {
      const qList = Array.isArray(block.questions)
        ? block.questions
        : (block.options ? [{ q: block.question || block.title || 'Knowledge Check', options: block.options, correct: block.correct, explanation: block.explanation }] : []);
      const title = block.title || block.heading || 'Interactive Knowledge Check';
      return `
        <section class="quiz-card" id="${block.id || 'quiz'}">
          <div class="quiz-header">
            <span class="quiz-badge">INTERACTIVE CHECK</span>
          </div>
          ${audioHtml}
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${escapeHtml(title)}</h2>
          ${qList.map((q, qi) => {
            const key = `${block.id}_q${qi}`;
            const chosen = state.answers[key];
            const answered = chosen !== undefined;
            return `
              <div class="q-block">
                <div class="q-text">${escapeHtml(q.q || q.question || '')}</div>
                <div class="opt-list">
                  ${(q.options || []).map((opt, oi) => {
                    let cls = 'opt-btn';
                    if (answered) {
                      if (oi === q.correct) cls += ' correct';
                      else if (oi === chosen) cls += ' wrong';
                    }
                    return `<button type="button" class="${cls}" data-qid="${block.id}" data-qi="${qi}" data-oi="${oi}">${escapeHtml(opt)}</button>`;
                  }).join('')}
                </div>
                ${answered ? `<div class="q-feedback ${chosen === q.correct ? 'ok' : 'err'}">${chosen === q.correct ? '✓ Correct! ' : '✕ Review: '}${escapeHtml(q.explanation || '')}</div>` : ''}
              </div>
            `;
          }).join('')}
        </section>
      `;
    }

    if (block.type === 'quiz_blanks') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header"><span class="quiz-badge">FILL IN THE BLANKS</span></div>
          ${audioHtml}
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          <div class="word-bank">
            ${block.wordBank.map(w => `<span class="word-chip">${w}</span>`).join('')}
          </div>
          ${block.items.map((it, bi) => {
        const key = `${block.id}_b${bi}`;
        const val = state.answers[key] || '';
        const checked = state.answers[`${block.id}_checked`];
        const isOk = val.trim().toLowerCase() === it.answer.trim().toLowerCase();
        return `
              <div class="blank-row">
                <label style="font-size:14px;font-weight:600;">${it.prompt}</label>
                <select class="blank-input ${checked ? (isOk ? 'ok' : 'err') : ''}" data-bid="${block.id}" data-bi="${bi}">
                  <option value="">-- Select Answer from Word Bank --</option>
                  ${block.wordBank.map(opt => `<option value="${escapeHtml(opt)}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                ${checked && !isOk ? `<div class="q-feedback err">Correct answer: <strong>${it.answer}</strong></div>` : ''}
              </div>
            `;
      }).join('')}
          <button type="button" class="action-btn check-blanks-btn" data-bid="${block.id}">Check Answers</button>
        </section>
      `;
    }

    if (block.type === 'quiz_match') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header"><span class="quiz-badge">MATCH THE PAIR</span></div>
          ${audioHtml}
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          ${block.pairs.map((p, pi) => {
        const key = `${block.id}_m${pi}`;
        const val = state.answers[key] || '';
        const checked = state.answers[`${block.id}_checked`];
        const isOk = val === p.answer;
        return `
              <div class="match-row">
                <div style="font-size:14px;font-weight:700;color:var(--hdfc-navy);">${p.left}</div>
                <select class="match-select ${checked ? (isOk ? 'ok' : 'err') : ''}" data-mid="${block.id}" data-pi="${pi}">
                  <option value="">-- Choose Best Match --</option>
                  ${block.options.map(opt => `<option value="${escapeHtml(opt)}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                ${checked && !isOk ? `<div class="q-feedback err">Best match: <strong>${p.answer}</strong></div>` : ''}
              </div>
            `;
      }).join('')}
          <button type="button" class="action-btn check-match-btn" data-mid="${block.id}">Verify Matches</button>
        </section>
      `;
    }

    if (block.type === 'kyc_sorter') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header"><span class="quiz-badge">KYC DOCUMENT SORTER</span></div>
          ${audioHtml}
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          <p style="font-size:14px;margin-bottom:10px;">${block.instruction}</p>
          ${block.docs.map((d, di) => {
        const key = `${block.id}_s${di}`;
        const chosen = state.answers[key];
        const answered = chosen !== undefined;
        const isCorrect = chosen === d.valid;
        const trueLabel = block.trueLabel || (block.id && block.id.includes('kyc') ? '✓ Valid Address OVD' : '✓ Valid / Best Practice');
        const falseLabel = block.falseLabel || (block.id && block.id.includes('kyc') ? '✕ Not Address OVD' : '✕ Risk / Non-Compliant');
        return `
              <div class="sorter-item">
                <div class="sorter-doc">${d.name}</div>
                <div class="sorter-btns">
                  <button type="button" class="sort-choice ${answered && chosen === true ? (isCorrect ? 'selected-ok' : 'selected-err') : ''}" data-sid="${block.id}" data-di="${di}" data-val="true">${trueLabel}</button>
                  <button type="button" class="sort-choice ${answered && chosen === false ? (isCorrect ? 'selected-ok' : 'selected-err') : ''}" data-sid="${block.id}" data-di="${di}" data-val="false">${falseLabel}</button>
                </div>
                ${answered ? `<div class="q-feedback ${isCorrect ? 'ok' : 'err'}">${isCorrect ? '✓ Spot on! ' : '✕ Note: '}${d.note}</div>` : ''}
              </div>
            `;
      }).join('')}
        </section>
      `;
    }

    if (block.type === 'flashcards') {
      return `
        <section class="card">
          <span class="card-tag green">Interactive Self-Test Cards</span>
          <h2>${block.title}</h2>
          <p style="font-size:13.5px;color:var(--muted);">${block.instruction || 'Tap any card below to flip and reveal the key knowledge takeaway:'}</p>
          <div class="flip-grid">
            ${block.cards.map((c, ci) => `
              <div class="flip-card-container" data-fc-idx="${ci}">
                <div class="flip-card-inner">
                  <div class="flip-card-front">
                    <div>
                      <span class="box-badge gold">Tap to Flip 🔄</span>
                      <div class="flip-q-title">${c.q}</div>
                    </div>
                    <div class="flip-hint"><span>💡 Tap to flip answer</span></div>
                  </div>
                  <div class="flip-card-back">
                    <div>
                      <span class="box-badge green">Key Takeaway ✓</span>
                      <div class="flip-a-text" style="margin-top:8px;">${c.a}</div>
                    </div>
                    <div style="font-size:11px;color:#64748B;text-align:right;">Tap again to flip back</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    if (block.type === 'action_commitment') {
      return `
        <section class="card">
          <span class="card-tag red">Personal Action Plan</span>
          <h2>${block.title}</h2>
          <p>${block.prompt}</p>
          <textarea id="actionNotes" class="notepad-area" placeholder="Example: Product — Current Account + Merchant QR. Q1: How do you currently accept customer UPI/card payments? ...">${escapeHtml(state.notes)}</textarea>
          <button type="button" id="saveNotesBtn" class="action-btn" style="background:var(--green);">Save Action Plan &amp; Complete Day 2 ✓</button>
        </section>
      `;
    }

    return '';
  }

  function renderChapter(preserveScroll = false) {
    try {
      const savedScrollY = (preserveScroll && typeof window !== 'undefined') ? (window.scrollY || window.pageYOffset || 0) : 0;
      // Pause any currently playing audio before rendering
      document.querySelectorAll('audio').forEach(a => {
        try { if (!a.paused) a.pause(); } catch (e) { }
      });

      if (state.currentChapter < 0) state.currentChapter = 0;
      if (state.currentChapter >= COURSE_CHAPTERS.length) state.currentChapter = Math.max(0, COURSE_CHAPTERS.length - 1);
      const ch = COURSE_CHAPTERS[state.currentChapter];
      if (!ch) return;

      const blocksHtml = (ch.blocks || []).map(b => {
        try {
          return renderBlock(b);
        } catch (bErr) {
          console.warn('Block render error:', b, bErr);
          return `<section class="card"><h2>${escapeHtml(b.heading || b.title || 'Topic Card')}</h2>${b.body || ''}</section>`;
        }
      }).join('');

      const isPureUrlSlide = ch.blocks && ch.blocks.length === 1 && ch.blocks[0].type === 'url_redirect';
      if (els.main) {
        if (isPureUrlSlide) {
          const uBlock = ch.blocks[0];
          const targetUrl = uBlock.url || '#';
          const displayText = uBlock.urlText || uBlock.heading || ch.title || targetUrl;
          const safeTarget = escapeHtml(targetUrl);
          const safeText = escapeHtml(displayText);
          const audioHtml = renderAudioBar(uBlock.audioUrl, uBlock.audioTitle);
          els.main.innerHTML = `
            <div class="chapter-hero" style="margin-bottom:12px;">
              <span class="hero-kicker">CHAPTER ${state.currentChapter + 1} OF ${COURSE_CHAPTERS.length} · ${ch.num || (state.currentChapter + 1)}</span>
              <h1 class="hero-title">${escapeHtml(ch.title || displayText)}</h1>
            </div>
            <div class="url-fullpage-redirect" onclick="openExternalLink(event, '${safeTarget}')">
              ${audioHtml}
              <div class="url-redirect-content">
                <div class="url-icon-wrap">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
                <div class="url-redirect-badge">External Resource</div>
                <a href="${safeTarget}" target="_blank" rel="noopener noreferrer" class="url-main-link" onclick="openExternalLink(event, '${safeTarget}')">
                  ${safeText}
                </a>
                <div class="url-address-label">${safeTarget}</div>
                <a href="${safeTarget}" target="_blank" rel="noopener noreferrer" class="url-action-btn" onclick="openExternalLink(event, '${safeTarget}')">
                  <span>Visit Website / Resource</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
                <p class="url-redirect-hint">Tap anywhere on this page to open link in a new window</p>
              </div>
            </div>
          `;
        } else {
          // If the first block of the chapter is a section_hero that matches the chapter title,
          // render the unified chapter hero with its subtitle and callout to prevent duplicate stacked banners
          const firstBlock = ch.blocks && ch.blocks[0];
          const isFirstSectionHero = firstBlock && (firstBlock.type === 'section_hero' || (firstBlock.heading && firstBlock.heading.trim().toLowerCase() === (ch.title || '').trim().toLowerCase()));

          let heroKicker = `CHAPTER ${state.currentChapter + 1} OF ${COURSE_CHAPTERS.length} · ${ch.num || (state.currentChapter + 1)}`;
          if (firstBlock && firstBlock.tag) {
            heroKicker = `${heroKicker} · ${escapeHtml(firstBlock.tag)}`;
          }

          let heroSub = ch.subtitle || (firstBlock && firstBlock.body ? firstBlock.body : '');
          let heroCalloutHtml = '';
          if (isFirstSectionHero && firstBlock.callout) {
            heroCalloutHtml = `<div class="callout ${firstBlock.callout.type || ''}">${firstBlock.callout.text}</div>`;
          }

          const renderedBlocksHtml = (ch.blocks || []).slice(isFirstSectionHero ? 1 : 0).map(b => {
            try {
              return renderBlock(b);
            } catch (bErr) {
              console.warn('Block render error:', b, bErr);
              return `<section class="card"><h2>${escapeHtml(b.heading || b.title || 'Topic Card')}</h2>${b.body || ''}</section>`;
            }
          }).join('');

          els.main.innerHTML = `
            <div class="chapter-hero">
              <span class="hero-kicker">${heroKicker}</span>
              <h1 class="hero-title">${ch.title || ''}</h1>
              ${heroSub ? `<p class="hero-desc">${heroSub}</p>` : ''}
              ${heroCalloutHtml}
            </div>
            ${renderedBlocksHtml}
          `;
        }
        bindDynamicEvents();
      }
      try {
        if (preserveScroll) {
          window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (scrollErr) { }
    } catch (e) {
      console.error('Fatal renderChapter error:', e);
      if (els.main) {
        els.main.innerHTML = `<section class="card"><h2>${escapeHtml(document.title || 'Course')}</h2><p>Course content loaded.</p></section>`;
      }
    }
  }

  function bindDynamicEvents() {
    // Video Embed Preview Loader
    els.main.querySelectorAll('.video-load-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const vidId = btn.dataset.vidId;
        const input = document.getElementById(`input_${vidId}`);
        const stage = document.getElementById(`stage_${vidId}`);
        const url = input.value.trim();
        state.videoPreviews[vidId] = url;
        stage.innerHTML = renderVideoStage(url);
        persist();
      });
    });

    // MCQ - In-place DOM update without full page re-render
    els.main.querySelectorAll('.opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.qid;
        const qi = Number(btn.dataset.qi);
        const oi = Number(btn.dataset.oi);
        const key = `${qid}_q${qi}`;
        state.answers[key] = oi;
        persist();

        // Update in-place without rebuilding the DOM
        const qBlock = btn.closest('.q-block');
        if (qBlock) {
          const ch = COURSE_CHAPTERS[state.currentChapter];
          const block = (ch && ch.blocks) ? ch.blocks.find(b => b.id === qid) : null;
          let qObj = null;
          if (block) {
            if (Array.isArray(block.questions)) qObj = block.questions[qi];
            else if (qi === 0 && block.options) qObj = { options: block.options, correct: block.correct, explanation: block.explanation };
          }
          const correctIdx = qObj ? qObj.correct : undefined;
          const explanation = qObj ? (qObj.explanation || '') : '';

          qBlock.querySelectorAll('.opt-btn').forEach(b => {
            const bOi = Number(b.dataset.oi);
            b.classList.remove('correct', 'wrong');
            if (bOi === correctIdx) b.classList.add('correct');
            else if (bOi === oi) b.classList.add('wrong');
          });

          let fb = qBlock.querySelector('.q-feedback');
          if (!fb) {
            fb = document.createElement('div');
            qBlock.appendChild(fb);
          }
          const isCorrect = (oi === correctIdx);
          fb.className = `q-feedback ${isCorrect ? 'ok' : 'err'}`;
          fb.innerHTML = `${isCorrect ? '✓ Correct! ' : '✕ Review: '}${escapeHtml(explanation)}`;
        }
      });
    });

    // Blanks - In-place DOM update without full page re-render
    els.main.querySelectorAll('.blank-input').forEach(sel => {
      sel.addEventListener('change', () => {
        state.answers[`${sel.dataset.bid}_b${sel.dataset.bi}`] = sel.value;
        persist();
      });
    });
    els.main.querySelectorAll('.check-blanks-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bid = btn.dataset.bid;
        state.answers[`${bid}_checked`] = true;
        persist();

        const card = btn.closest('.quiz-card');
        if (card) {
          const ch = COURSE_CHAPTERS[state.currentChapter];
          const block = (ch && ch.blocks) ? ch.blocks.find(b => b.id === bid) : null;
          const items = (block && block.items) ? block.items : [];

          card.querySelectorAll('.blank-row').forEach((row, bi) => {
            const sel = row.querySelector('.blank-input');
            const item = items[bi];
            if (sel && item) {
              const val = (sel.value || '').trim().toLowerCase();
              const isOk = val === (item.answer || '').trim().toLowerCase();
              sel.classList.remove('ok', 'err');
              sel.classList.add(isOk ? 'ok' : 'err');

              let fb = row.querySelector('.q-feedback');
              if (!isOk) {
                if (!fb) {
                  fb = document.createElement('div');
                  row.appendChild(fb);
                }
                fb.className = 'q-feedback err';
                fb.innerHTML = `Correct answer: <strong>${escapeHtml(item.answer)}</strong>`;
              } else if (fb) {
                fb.remove();
              }
            }
          });
        }
      });
    });

    // Match - In-place DOM update without full page re-render
    els.main.querySelectorAll('.match-select').forEach(sel => {
      sel.addEventListener('change', () => {
        state.answers[`${sel.dataset.mid}_m${sel.dataset.pi}`] = sel.value;
        persist();
      });
    });
    els.main.querySelectorAll('.check-match-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mid = btn.dataset.mid;
        state.answers[`${mid}_checked`] = true;
        persist();

        const card = btn.closest('.quiz-card');
        if (card) {
          const ch = COURSE_CHAPTERS[state.currentChapter];
          const block = (ch && ch.blocks) ? ch.blocks.find(b => b.id === mid) : null;
          const pairs = (block && block.pairs) ? block.pairs : [];

          card.querySelectorAll('.match-row').forEach((row, pi) => {
            const sel = row.querySelector('.match-select');
            const pair = pairs[pi];
            if (sel && pair) {
              const isOk = (sel.value === pair.answer);
              sel.classList.remove('ok', 'err');
              sel.classList.add(isOk ? 'ok' : 'err');

              let fb = row.querySelector('.q-feedback');
              if (!isOk) {
                if (!fb) {
                  fb = document.createElement('div');
                  row.appendChild(fb);
                }
                fb.className = 'q-feedback err';
                fb.innerHTML = `Best match: <strong>${escapeHtml(pair.answer)}</strong>`;
              } else if (fb) {
                fb.remove();
              }
            }
          });
        }
      });
    });

    // KYC Sorter - In-place DOM update without full page re-render
    els.main.querySelectorAll('.sort-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.sid;
        const di = Number(btn.dataset.di);
        const val = (btn.dataset.val === 'true');
        state.answers[`${sid}_s${di}`] = val;
        persist();

        const item = btn.closest('.sorter-item');
        if (item) {
          const ch = COURSE_CHAPTERS[state.currentChapter];
          const block = (ch && ch.blocks) ? ch.blocks.find(b => b.id === sid) : null;
          const doc = (block && block.docs) ? block.docs[di] : null;
          const isCorrect = doc ? (val === doc.valid) : false;

          item.querySelectorAll('.sort-choice').forEach(b => {
            b.classList.remove('selected-ok', 'selected-err');
            const bVal = (b.dataset.val === 'true');
            if (bVal === val) {
              b.classList.add(isCorrect ? 'selected-ok' : 'selected-err');
            }
          });

          let fb = item.querySelector('.q-feedback');
          if (!fb) {
            fb = document.createElement('div');
            item.appendChild(fb);
          }
          fb.className = `q-feedback ${isCorrect ? 'ok' : 'err'}`;
          fb.textContent = `${isCorrect ? '✓ Spot on! ' : '✕ Note: '}${doc ? doc.note : ''}`;
        }
      });
    });

    // 3D Flip Cards
    els.main.querySelectorAll('.flip-card-container').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });

    // Card Audio Top-Right Speaker Buttons
    els.main.querySelectorAll('.card-audio-speaker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const corner = btn.closest('.card-speaker-corner');
        const audio = corner ? corner.querySelector('audio') : null;
        if (!audio) return;

        if (audio.paused) {
          // Pause all other audio playing across the course
          document.querySelectorAll('audio').forEach(a => {
            if (a !== audio && !a.paused) {
              a.pause();
              a.currentTime = 0;
            }
          });
          document.querySelectorAll('.card-audio-speaker-btn.is-playing').forEach(b => {
            b.classList.remove('is-playing');
            b.setAttribute('title', b.getAttribute('data-title') || 'Play Voiceover');
          });

          audio.play().then(() => {
            btn.classList.add('is-playing');
            btn.setAttribute('title', 'Playing Narration (Tap to Pause)');
          }).catch(err => {
            console.warn('Audio playback error:', err);
          });

          audio.onended = () => {
            btn.classList.remove('is-playing');
            btn.setAttribute('title', btn.getAttribute('data-title') || 'Play Voiceover');
          };
          audio.onpause = () => {
            btn.classList.remove('is-playing');
            btn.setAttribute('title', btn.getAttribute('data-title') || 'Play Voiceover');
          };
        } else {
          audio.pause();
          btn.classList.remove('is-playing');
          btn.setAttribute('title', btn.getAttribute('data-title') || 'Play Voiceover');
        }
      });
    });

    // Action Commitment Save
    const notesEl = document.getElementById('actionNotes');
    const saveBtn = document.getElementById('saveNotesBtn');
    if (notesEl && saveBtn) {
      saveBtn.addEventListener('click', () => {
        state.notes = notesEl.value;
        state.completed = true;
        persist();
        saveBtn.textContent = 'Saved & Marked Completed in LMS ✓';
      });
    }
  }

  function goToChapter(idx) {
    if (idx < 0 || idx >= COURSE_CHAPTERS.length) return;
    state.currentChapter = idx;
    persist();
    renderChapter();
  }

  function openDrawer() {
    els.drawer.classList.add('open');
    els.drawer.setAttribute('aria-hidden', 'false');
    els.backdrop.classList.remove('hidden');
  }

  function closeDrawer() {
    els.drawer.classList.remove('open');
    els.drawer.setAttribute('aria-hidden', 'true');
    els.backdrop.classList.add('hidden');
  }

  els.menuBtn.addEventListener('click', openDrawer);
  els.quickIndexBtn.addEventListener('click', openDrawer);
  els.closeDrawerBtn.addEventListener('click', closeDrawer);
  els.backdrop.addEventListener('click', closeDrawer);

  function showCompletionBanner(scorePct) {
    let banner = document.getElementById('scormCompletionBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'scormCompletionBanner';
      banner.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:99999;background:#064e3b;color:#ecfdf5;border:1.5px solid #10b981;border-radius:12px;padding:12px 20px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:10px;box-shadow:0 12px 30px rgba(0,0,0,0.4);font-family:sans-serif;max-width:90%;text-align:center;transition:opacity 0.3s ease;';
      document.body.appendChild(banner);
    }
    banner.innerHTML = '<span style="font-size:18px;color:#34d399;">✓</span><span>Module Completed (' + scorePct + '%) — SCORM 2004 Status: COMPLETED. Returning to Home...</span>';
    banner.style.display = 'flex';
    banner.style.opacity = '1';
    setTimeout(() => {
      if (banner) {
        banner.style.opacity = '0';
        setTimeout(() => { banner.style.display = 'none'; }, 300);
      }
    }, 3500);
  }

  function handleCompleteCourse() {
    state.completed = true;
    for (let i = 0; i < COURSE_CHAPTERS.length; i++) {
      if (!state.visited.includes(i)) state.visited.push(i);
    }
    const { pct } = computeScore();
    scormApi.saveState({
      currentChapter: 0,
      visited: state.visited,
      answers: state.answers,
      notes: state.notes,
      videoPreviews: state.videoPreviews,
      completed: true,
      progressMeasure: 1.0,
      scoreScaled: pct / 100
    });
    scormApi.setValue('cmi.completion_status', 'completed');
    scormApi.setValue('cmi.success_status', pct >= 60 ? 'passed' : 'completed');
    scormApi.setValue('cmi.progress_measure', '1.00');
    scormApi.setValue('cmi.location', '0');
    scormApi.commit();

    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'SCORM_COMPLETION',
          status: 'completed',
          successStatus: pct >= 60 ? 'passed' : 'completed',
          score: pct
        }, '*');
      }
    } catch(e) {}

    showCompletionBanner(pct);
    closeDrawer();
    goToChapter(0);
  }

  els.prevBtn.addEventListener('click', () => goToChapter(state.currentChapter - 1));
  els.nextBtn.addEventListener('click', () => {
    if (state.currentChapter < COURSE_CHAPTERS.length - 1) {
      goToChapter(state.currentChapter + 1);
    } else {
      handleCompleteCourse();
    }
  });

  els.finishCourseBtn.addEventListener('click', () => {
    handleCompleteCourse();
  });

  window.addEventListener('beforeunload', () => {
    persist();
  });

  window.goToChapter = goToChapter;
  window.COURSE_CHAPTERS = COURSE_CHAPTERS;

  persist();
  renderChapter();
})();