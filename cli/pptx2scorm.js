#!/usr/bin/env node

/**
 * SlideCraft CLI - PPTX to SCORM 2004 & Mobile-First HTML Converter
 * Command line utility to convert PPTX presentations to standalone HTML and SCORM 2004 packages.
 */

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

// DOM Parser fallback for Node.js
function parseXmlString(xmlString) {
  // Simple regex-based extractor for Node CLI fallback without external xmldom dependency
  return {
    getElementsByTagName: function(tagName) {
      const results = [];
      const tagRegex = new RegExp('<' + tagName + '([^>]*)>([\\s\\S]*?)<\\/' + tagName + '>', 'g');
      const selfClosingRegex = new RegExp('<' + tagName + '([^>]*)\\/>', 'g');
      
      let match;
      while ((match = tagRegex.exec(xmlString)) !== null) {
        results.push(createNode(match[1], match[2]));
      }
      while ((match = selfClosingRegex.exec(xmlString)) !== null) {
        results.push(createNode(match[1], ''));
      }
      return results;
    }
  };
}

function createNode(attrString, innerContent) {
  return {
    textContent: innerContent.replace(/<[^>]+>/g, ''),
    getAttribute: function(name) {
      const match = new RegExp(name + '="([^"]*)"').exec(attrString);
      return match ? match[1] : null;
    },
    getElementsByTagName: function(name) {
      return parseXmlString(innerContent).getElementsByTagName(name);
    }
  };
}

async function convertPptx(inputFile, options = {}) {
  const fileBuffer = fs.readFileSync(inputFile);
  const zip = await JSZip.loadAsync(fileBuffer);

  const courseTitle = path.basename(inputFile, path.extname(inputFile));
  const slides = [];

  // Find slide files
  const slideFiles = [];
  zip.forEach((relPath) => {
    if (relPath.match(/ppt\/slides\/slide\d+\.xml$/)) {
      slideFiles.push(relPath);
    }
  });

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0], 10);
    const numB = parseInt(b.match(/\d+/)[0], 10);
    return numA - numB;
  });

  for (let idx = 0; idx < slideFiles.length; idx++) {
    const slideXml = await zip.file(slideFiles[idx]).async('text');
    const doc = parseXmlString(slideXml);

    const textElements = doc.getElementsByTagName('a:t');
    const texts = textElements.map(el => el.textContent.trim()).filter(Boolean);

    const title = texts.length > 0 ? texts[0] : `Concept ${idx + 1}`;
    const blocks = [];

    const bulletItems = [];
    for (let t = 1; t < texts.length; t++) {
      const txt = texts[t];
      if (txt.startsWith('•') || txt.startsWith('-') || /^\d+\./.test(txt)) {
        bulletItems.push(txt.replace(/^[•\-\*]\s*/, ''));
      } else if (txt.toLowerCase().startsWith('tip:') || txt.toLowerCase().startsWith('note:')) {
        blocks.push({
          id: `blk-${t}`,
          type: 'callout',
          text: txt,
          calloutType: 'tip'
        });
      } else {
        blocks.push({
          id: `blk-${t}`,
          type: 'paragraph',
          text: txt
        });
      }
    }

    if (bulletItems.length > 0) {
      blocks.push({
        id: `blk-bullets-${idx}`,
        type: 'bullet-list',
        items: bulletItems
      });
    }

    // Auto-generate interactive quiz if bullet items exist
    let quiz = undefined;
    if (bulletItems.length >= 2) {
      quiz = {
        id: `quiz-${idx}`,
        prompt: `Based on "${title}", which principle is highlighted?`,
        options: [
          { id: 'opt-1', text: bulletItems[0], isCorrect: true, feedback: 'Correct!' },
          { id: 'opt-2', text: 'Bypass controls for rapid delivery', isCorrect: false, feedback: 'Incorrect.' },
          { id: 'opt-3', text: 'Rely on outdated legacy systems', isCorrect: false, feedback: 'Incorrect.' }
        ],
        explanation: `Core guideline: ${bulletItems[0]}`
      };
    }

    slides.push({
      id: `slide-${idx + 1}`,
      slideNumber: idx + 1,
      title,
      blocks,
      quiz
    });
  }

  const courseData = {
    title: courseTitle,
    subtitle: 'Interactive Micro-learning Course',
    slides,
    theme: {
      primaryColor: '#6366f1',
      primaryLight: '#e0e7ff',
      accentColor: '#10b981',
      backgroundColor: '#090d16',
      cardBackground: '#131b2e',
      textColor: '#f8fafc',
      textMuted: '#94a3b8'
    },
    scormSettings: {
      version: '2004 4th Edition',
      identifier: `COURSE_${Date.now()}`,
      title: courseTitle,
      passingScore: 80
    }
  };

  // Generate Standalone HTML
  const htmlContent = generateCliHtml(courseData, false);
  const outputHtml = options.html || `${courseTitle}.html`;
  fs.writeFileSync(outputHtml, htmlContent, 'utf-8');
  console.log(`✓ Standalone HTML exported: ${outputHtml}`);

  // Generate SCORM 2004 Package
  const scormZip = new JSZip();
  const manifest = generateCliManifest(courseData);
  const scormWrapper = generateCliScormWrapper();
  const scormHtml = generateCliHtml(courseData, true);

  scormZip.file('imsmanifest.xml', manifest);
  scormZip.file('scormFunctions.js', scormWrapper);
  scormZip.file('index.html', scormHtml);

  const outputScorm = options.scorm || `${courseTitle}-scorm2004.zip`;
  const zipBuffer = await scormZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outputScorm, zipBuffer);
  console.log(`✓ SCORM 2004 4th Edition zip exported: ${outputScorm}`);
}

function generateCliManifest(course) {
  const id = course.scormSettings.identifier;
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${id}" version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="ORG_${id}">
    <organization identifier="ORG_${id}">
      <title>${course.title}</title>
      <item identifier="ITEM_${id}" identifierref="RES_${id}">
        <title>${course.title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_${id}" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html" />
      <file href="scormFunctions.js" />
    </resource>
  </resources>
</manifest>`;
}

function generateCliScormWrapper() {
  return `var SCORM2004 = {
  api: null,
  findAPI: function(win) {
    var attempts = 0;
    while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
      attempts++;
      if (attempts > 500) return null;
      win = win.parent;
    }
    return win.API_1484_11;
  },
  getAPI: function() {
    if (this.api == null) {
      if ((window.parent != null) && (window.parent != window)) this.api = this.findAPI(window.parent);
      if (this.api == null && window.opener != null) this.api = this.findAPI(window.opener);
      if (this.api == null && window.API_1484_11 != null) this.api = window.API_1484_11;
    }
    return this.api;
  },
  initialize: function() {
    var a = this.getAPI();
    return a ? a.Initialize("") : "false";
  },
  setValue: function(k, v) {
    var a = this.getAPI();
    return a ? a.SetValue(k, v.toString()) : "false";
  },
  commit: function() {
    var a = this.getAPI();
    return a ? a.Commit("") : "false";
  },
  terminate: function() {
    var a = this.getAPI();
    return a ? a.Terminate("") : "false";
  }
};
window.scormInitialize = function() { return SCORM2004.initialize(); };
window.scormSetValue = function(k, v) { return SCORM2004.setValue(k, v); };
window.scormCommit = function() { return SCORM2004.commit(); };
window.scormTerminate = function() { return SCORM2004.terminate(); };
`;
}

function generateCliHtml(course, isScorm) {
  // Re-use core styling & template
  const courseJson = JSON.stringify(course);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${course.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  ${isScorm ? '<script src="scormFunctions.js"></script>' : ''}
  <style>
    :root { --primary: #6366f1; --accent: #10b981; --bg: #090d16; --card-bg: #131b2e; --text: #f8fafc; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; line-height: 1.6; }
    .wrapper { max-width: 760px; margin: 0 auto; padding: 20px 16px 100px 16px; }
    .top-bar { position: sticky; top: 0; background: rgba(9,13,22,0.9); backdrop-filter: blur(10px); padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; z-index: 50; }
    .progress-bar { height: 4px; background: rgba(255,255,255,0.1); width: 100%; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); width: 0%; transition: width 0.3s; }
    .slide-card { background: var(--card-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 12px; }
    .bullet-card { display: flex; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; margin-bottom: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 8px; }
    .quiz-box { background: rgba(30,41,59,0.5); border: 1px solid rgba(99,102,241,0.3); border-radius: 14px; padding: 18px; margin-top: 20px; }
    .opt-btn { width: 100%; text-align: left; padding: 12px 14px; margin-top: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; cursor: pointer; font-size: 0.95rem; }
    .opt-btn.correct { background: rgba(16,185,129,0.2); border-color: #10b981; }
    .opt-btn.wrong { background: rgba(239,68,68,0.2); border-color: #ef4444; }
    .nav-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(9,13,22,0.95); backdrop-filter: blur(12px); border-top: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; display: flex; justify-content: space-between; max-width: 760px; margin: 0 auto; z-index: 50; }
    .btn { padding: 10px 20px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .btn-next { background: var(--primary); color: #fff; }
    .btn-prev { background: rgba(255,255,255,0.1); color: #fff; }
  </style>
</head>
<body>
  <div class="top-bar">
    <strong style="font-size:0.9rem;">${course.title}</strong>
    <span id="counter" style="font-size:0.8rem;color:#94a3b8;">1 / ${course.slides.length}</span>
  </div>
  <div class="progress-bar"><div id="pFill" class="progress-fill"></div></div>
  <div class="wrapper" id="content"></div>
  <div class="nav-bar">
    <button class="btn btn-prev" id="prev" onclick="go(-1)">Back</button>
    <button class="btn btn-next" id="next" onclick="go(1)">Next</button>
  </div>
  <script>
    const course = ${courseJson};
    let cur = 0;
    if (${isScorm ? 'true' : 'false'} && window.scormInitialize) window.scormInitialize();
    function render(idx) {
      cur = idx;
      document.getElementById('counter').innerText = (idx + 1) + ' / ' + course.slides.length;
      document.getElementById('pFill').style.width = (((idx + 1) / course.slides.length) * 100) + '%';
      document.getElementById('prev').disabled = idx === 0;
      const s = course.slides[idx];
      let h = '<div class="slide-card">';
      h += '<h1>' + s.title + '</h1>';
      if (s.blocks) {
        s.blocks.forEach(b => {
          if (b.type === 'paragraph') h += '<p style="margin-bottom:12px;color:#cbd5e1;">' + b.text + '</p>';
          if (b.type === 'callout') h += '<div style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);padding:12px;border-radius:10px;margin-bottom:12px;color:#93c5fd;">' + b.text + '</div>';
          if (b.type === 'bullet-list' && b.items) {
            b.items.forEach(it => { h += '<div class="bullet-card"><div class="dot"></div><div>' + it + '</div></div>'; });
          }
        });
      }
      if (s.quiz) {
        h += '<div class="quiz-box"><strong style="color:#818cf8;display:block;margin-bottom:8px;">Knowledge Check:</strong><p style="margin-bottom:10px;">' + s.quiz.prompt + '</p>';
        s.quiz.options.forEach((opt, oIdx) => {
          h += '<button class="opt-btn" onclick="answer(' + idx + ',' + oIdx + ', this, ' + opt.isCorrect + ')">' + opt.text + '</button>';
        });
        h += '<div id="fb" style="display:none;margin-top:10px;padding:10px;border-radius:8px;font-size:0.9rem;"></div></div>';
      }
      h += '</div>';
      document.getElementById('content').innerHTML = h;
    }
    function answer(sIdx, oIdx, btn, isCorr) {
      const parent = btn.parentElement;
      parent.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
      btn.classList.add(isCorr ? 'correct' : 'wrong');
      const fb = document.getElementById('fb');
      fb.style.display = 'block';
      fb.style.background = isCorr ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';
      fb.style.color = isCorr ? '#a7f3d0' : '#fca5a5';
      fb.innerText = isCorr ? 'Correct!' : 'Incorrect.';
      if (window.scormSetValue) {
        window.scormSetValue('cmi.score.raw', isCorr ? '100' : '0');
        window.scormCommit();
      }
    }
    function go(d) {
      const n = cur + d;
      if (n >= 0 && n < course.slides.length) render(n);
      else if (n >= course.slides.length) {
        if (window.scormSetValue) {
          window.scormSetValue('cmi.completion_status', 'completed');
          window.scormCommit();
        }
        alert('Course Completed!');
      }
    }
    render(0);
  </script>
</body>
</html>`;
}

// CLI args processing
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
SlideCraft CLI - PPTX to SCORM 2004 & Mobile-First HTML Converter

Usage:
  node cli/pptx2scorm.js <path-to-file.pptx> [options]

Options:
  --html <path>     Output path for standalone HTML file (default: <filename>.html)
  --scorm <path>    Output path for SCORM 2004 zip file (default: <filename>-scorm2004.zip)

Example:
  node cli/pptx2scorm.js sample_presentation.pptx
  `);
  process.exit(0);
}

const inputFile = args[0];
let htmlOutput = null;
let scormOutput = null;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--html' && args[i + 1]) {
    htmlOutput = args[++i];
  } else if (args[i] === '--scorm' && args[i + 1]) {
    scormOutput = args[++i];
  }
}

convertPptx(inputFile, { html: htmlOutput, scorm: scormOutput }).catch(err => {
  console.error('Error during conversion:', err);
  process.exit(1);
});

