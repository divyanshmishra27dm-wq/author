import { CourseData } from '../types/course';

export function generatePlayerHtml(course: CourseData, isScorm: boolean = false): string {
  const courseJson = JSON.stringify(course).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${escapeHtml(course.title)} - Presentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  ${isScorm ? '<script src="scormFunctions.js"></script>' : ''}
  <style>
    :root {
      --bg-canvas: #eef2f5;
      --bg-card: #ffffff;
      --border-color: #cbd5e1;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --accent-light: #eff6ff;
      --font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

    html, body {
      width: 100%;
      height: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: var(--font-family);
      background-color: var(--bg-canvas);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
    }

    #player-wrapper {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    /* Top Progress Bar */
    .top-progress-bar {
      height: 4px;
      width: 100%;
      background: rgba(0, 0, 0, 0.08);
      position: relative;
      z-index: 100;
    }
    .top-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #10b981);
      width: 0%;
      transition: width 0.3s ease;
    }

    /* Content Row */
    .content-row {
      flex: 1;
      display: flex;
      flex-direction: row;
      overflow: hidden;
      position: relative;
      min-height: 0;
    }

    /* B2B Collapsible Facilitator & Speaker Notes Panel */
    .notes-panel {
      width: 0;
      min-width: 0;
      background-color: var(--bg-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      z-index: 80;
    }

    .notes-panel.open {
      width: 300px;
      min-width: 300px;
    }

    .notes-panel-header {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      font-weight: 700;
      color: var(--text-main);
      font-size: 0.88rem;
      letter-spacing: 0.02em;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .notes-panel-header .badge {
      font-size: 0.72rem;
      padding: 2px 8px;
      background: var(--accent-light);
      color: var(--accent);
      border-radius: 12px;
      font-weight: 700;
    }

    .notes-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      font-size: 0.86rem;
      line-height: 1.65;
      color: var(--text-muted);
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Slide Viewport */
    .slide-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow: hidden;
      min-width: 0;
      position: relative;
    }

    /* 100% Exact 16:9 Presentation Canvas Container */
    #interactive-slide-container {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .slide-canvas-box {
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 16 / 9;
      position: relative;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
      border-radius: 6px;
      overflow: hidden;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
    }

    /* Positioned Elements Slide Canvas (Vector fallback) */
    .slide-canvas {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .positioned-box {
      position: absolute;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .pos-title-text {
      font-size: clamp(1.2rem, 2.5vw, 2.2rem);
      font-weight: 800;
      color: #0f172a;
    }
    .pos-subtitle-text {
      font-size: clamp(0.85rem, 1.4vw, 1.2rem);
      font-weight: 600;
      color: #475569;
      margin-top: 4px;
    }
    .pos-body-text {
      font-size: clamp(0.72rem, 1.1vw, 1rem);
      color: #334155;
      line-height: 1.45;
    }

    /* Mobile Re-imagination Feed */
    .mobile-feed-container {
      display: none;
      width: 100%;
      max-width: 600px;
      padding: 16px 12px 80px 12px;
      overflow-y: auto;
      flex-direction: column;
      gap: 14px;
    }

    .mobile-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 768px) {
      .slide-viewport {
        padding: 8px;
        display: block;
        overflow-y: auto;
      }
      #interactive-slide-container {
        display: none;
      }
      .mobile-feed-container {
        display: flex;
        margin: 0 auto;
      }
      .notes-panel {
        position: fixed;
        bottom: 52px;
        left: 0;
        right: 0;
        width: 100% !important;
        min-width: 100% !important;
        height: 0;
        border-right: none;
        border-top: 1px solid var(--border-color);
        transition: height 0.3s ease;
      }
      .notes-panel.open {
        height: 250px;
      }
      .menu-toggle-btn span { display: none; }
    }

    /* B2B Bottom Control Bar */
    .control-bar {
      height: 52px;
      background-color: #e2e8f0;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 90;
      user-select: none;
      flex-shrink: 0;
    }

    .menu-toggle-btn {
      background-color: #ffffff;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: inherit;
    }
    .menu-toggle-btn.active {
      background-color: var(--accent-light);
      border-color: var(--accent);
      color: var(--accent);
    }

    .nav-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: var(--border-color);
      padding: 3px 8px;
      border-radius: 20px;
    }

    .nav-btn {
      background-color: #ffffff;
      border: none;
      color: var(--text-main);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.15s ease;
    }
    .nav-btn:hover:not(:disabled) { transform: scale(1.05); }
    .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .nav-btn svg { width: 16px; height: 16px; fill: currentColor; }

    .slide-indicator {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
      background: #ffffff;
      padding: 4px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      font-variant-numeric: tabular-nums;
    }

    .control-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tool-btn {
      background-color: #ffffff;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      width: 34px;
      height: 34px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tool-btn.active { background-color: var(--accent-light); border-color: var(--accent); color: var(--accent); }
    .tool-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; }
  </style>
</head>
<body>
  <div id="player-wrapper">
    <div class="top-progress-bar">
      <div id="progressBar" class="top-progress-fill"></div>
    </div>

    <!-- Content Row -->
    <div class="content-row">
      <!-- Collapsible Facilitator Notes Panel -->
      <div class="notes-panel" id="notes-panel">
        <div class="notes-panel-header">
          <span>Slide Note</span>
          <span class="badge" id="notesBadge">Slide 1</span>
        </div>
        <div class="notes-panel-body" id="notesBody">
          <span style="color:var(--text-muted);font-style:italic;">No facilitator notes for this slide.</span>
        </div>
      </div>

      <!-- Main Slide Viewport -->
      <div class="slide-viewport">
        <!-- Desktop 16:9 Slide Canvas -->
        <div id="interactive-slide-container">
          <div class="slide-canvas-box" id="slideCanvasBox">
            <!-- Exact 100% slide image or positioned elements rendered here -->
          </div>
        </div>

        <!-- Mobile Feed -->
        <div class="mobile-feed-container" id="mobileFeedContainer">
          <!-- Fluid responsive cards rendered here -->
        </div>
      </div>
    </div>

    <!-- Bottom Control Bar -->
    <div class="control-bar">
      <button class="menu-toggle-btn" id="menuToggleBtn" onclick="toggleNotes()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <span>Notes</span>
      </button>

      <div class="nav-pill">
        <button class="nav-btn" id="prevBtn" onclick="prevSlide()" title="Previous Slide">
          <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>

        <button class="nav-btn" id="playPauseBtn" onclick="toggleAutoPlay()" title="Play / Pause Auto-Advance">
          <svg id="playIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <svg id="pauseIcon" viewBox="0 0 24 24" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <div class="slide-indicator" id="slideIndicator">
          Slide 1 / ${course.slides.length}
        </div>

        <button class="nav-btn" id="nextBtn" onclick="nextSlide()" title="Next Slide">
          <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>

      <div class="control-right">
        <button class="tool-btn" id="audioBtn" onclick="toggleAudio()" title="Read Facilitator Notes Aloud">
          <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>
        <button class="tool-btn" onclick="toggleFullscreen()" title="Fullscreen">
          <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
      </div>
    </div>
  </div>

  <script>
    const course = ${courseJson};
    let currentIndex = 0;
    let isAutoPlaying = false;
    let autoPlayTimer = null;
    let isSpeaking = false;

    const isScorm = ${isScorm ? 'true' : 'false'};
    if (isScorm && typeof window.scormInitialize === 'function') {
      window.scormInitialize();
    }

    function toggleNotes() {
      const panel = document.getElementById('notes-panel');
      const btn = document.getElementById('menuToggleBtn');
      panel.classList.toggle('open');
      btn.classList.toggle('active', panel.classList.contains('open'));
    }

    function renderSlide(index) {
      if (index < 0 || index >= course.slides.length) return;
      currentIndex = index;

      const progressPercent = ((index + 1) / course.slides.length) * 100;
      document.getElementById('progressBar').style.width = progressPercent + '%';

      document.getElementById('slideIndicator').textContent = 'Slide ' + (index + 1) + ' / ' + course.slides.length;
      document.getElementById('prevBtn').disabled = (index === 0);
      document.getElementById('notesBadge').textContent = 'Slide ' + (index + 1);

      const slide = course.slides[index];

      // Facilitator Notes
      const notesBody = document.getElementById('notesBody');
      if (slide.notes && slide.notes.trim()) {
        notesBody.textContent = slide.notes;
      } else {
        notesBody.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">No facilitator notes for this slide.</span>';
      }

      // ==========================================
      // 1. RENDER DESKTOP 16:9 SLIDE CANVAS
      // ==========================================
      const box = document.getElementById('slideCanvasBox');
      let canvasHtml = '';

      if (slide.bgImageUrl || slide.image) {
        // Pixel-perfect 1080p exact PowerPoint slide image!
        const imgSrc = slide.bgImageUrl || slide.image;
        canvasHtml = '<img class="slide-img" src="' + imgSrc + '" alt="Slide ' + (index + 1) + '">';
      } else if (slide.positionedElements && slide.positionedElements.length > 0) {
        canvasHtml = '<div class="slide-canvas">';
        slide.positionedElements.forEach(el => {
          let style = 'left:' + el.leftPct + '%;top:' + el.topPct + '%;width:' + el.widthPct + '%;height:' + el.heightPct + '%;';
          if (el.bgColor) style += 'background-color:' + el.bgColor + ';padding:8px 12px;border-radius:6px;';
          canvasHtml += '<div class="positioned-box" style="' + style + '">';
          if (el.type === 'image' && el.imageUrl) {
            canvasHtml += '<img src="' + el.imageUrl + '" style="width:100%;height:100%;object-fit:contain;display:block;">';
          } else if (el.type === 'text' && el.paragraphs) {
            el.paragraphs.forEach((p, pIdx) => {
              let pClass = el.isTitle && pIdx === 0 ? 'pos-title-text' : (el.isTitle ? 'pos-subtitle-text' : 'pos-body-text');
              let pStyle = (p.isBold ? 'font-weight:700;' : '') + (p.color ? 'color:' + p.color + ';' : '');
              canvasHtml += '<div class="' + pClass + '" style="' + pStyle + '">' + escapeHtml(p.text) + '</div>';
            });
          }
          canvasHtml += '</div>';
        });
        canvasHtml += '</div>';
      } else {
        canvasHtml = '<div style="padding:40px;text-align:center;"><h2>' + escapeHtml(slide.title) + '</h2></div>';
      }

      box.innerHTML = canvasHtml;

      // ==========================================
      // 2. RENDER MOBILE FEED
      // ==========================================
      const mobileFeed = document.getElementById('mobileFeedContainer');
      let mobileHtml = '<div class="mobile-card">';
      if (slide.bgImageUrl || slide.image) {
        const imgSrc = slide.bgImageUrl || slide.image;
        mobileHtml += '<div style="width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);background:#fff;">' +
          '<img src="' + imgSrc + '" style="width:100%;height:100%;object-fit:contain;display:block;">' +
          '</div>';
      } else {
        mobileHtml += '<h2 style="font-size:1.3rem;font-weight:800;margin-bottom:8px;">' + escapeHtml(slide.title) + '</h2>';
      }

      if (slide.notes && slide.notes.trim()) {
        mobileHtml += '<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:10px;font-size:0.86rem;color:var(--text-muted);border:1px solid #e2e8f0;">' +
          '<strong style="color:var(--text-main);display:block;margin-bottom:4px;">Facilitator Notes:</strong>' +
          escapeHtml(slide.notes) +
          '</div>';
      }
      mobileHtml += '</div>';
      mobileFeed.innerHTML = mobileHtml;

      // SCORM update
      if (isScorm && typeof window.scormSetValue === 'function') {
        window.scormSetValue('cmi.location', 'slide_' + (index + 1));
        if (index === course.slides.length - 1) {
          window.scormSetValue('cmi.completion_status', 'completed');
          window.scormSetValue('cmi.success_status', 'passed');
        }
        window.scormCommit();
      }
    }

    window.nextSlide = function() {
      if (isSpeaking) window.speechSynthesis.cancel();
      if (currentIndex < course.slides.length - 1) renderSlide(currentIndex + 1);
      else alert('Presentation completed!');
    };

    window.prevSlide = function() {
      if (isSpeaking) window.speechSynthesis.cancel();
      if (currentIndex > 0) renderSlide(currentIndex - 1);
    };

    window.toggleAutoPlay = function() {
      isAutoPlaying = !isAutoPlaying;
      const playIcon = document.getElementById('playIcon');
      const pauseIcon = document.getElementById('pauseIcon');
      if (isAutoPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        autoPlayTimer = setInterval(() => {
          if (currentIndex < course.slides.length - 1) nextSlide();
          else toggleAutoPlay();
        }, 5000);
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        clearInterval(autoPlayTimer);
      }
    };

    window.toggleAudio = function() {
      if (!('speechSynthesis' in window)) return;
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        document.getElementById('audioBtn').classList.remove('active');
        return;
      }
      const slide = course.slides[currentIndex];
      const textToRead = slide.notes || slide.title || ('Slide ' + (currentIndex + 1));
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => {
        isSpeaking = false;
        document.getElementById('audioBtn').classList.remove('active');
      };
      isSpeaking = true;
      document.getElementById('audioBtn').classList.add('active');
      window.speechSynthesis.speak(utterance);
    };

    window.toggleFullscreen = function() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    };

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'm') toggleNotes();
    });

    let touchStartX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    document.addEventListener('touchend', e => {
      if (touchStartX - e.changedTouches[0].screenX > 60) nextSlide();
      else if (e.changedTouches[0].screenX - touchStartX > 60) prevSlide();
    }, { passive: true });

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    renderSlide(0);
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
