# SlideCraft: PPT to Interactive SCORM 2004 & Mobile-First HTML Converter

> Transform PowerPoint presentations (`.pptx`) into interactive, mobile-reimagined e-learning experiences, standalone HTML files, and fully compliant **SCORM 2004 4th Edition** packages.

---

## 🌟 Key Features

### 1. 📱 Mobile-First Re-imagination (No Rigid 16:9 Slides)
Traditional PPT-to-HTML converters render rigid 16:9 canvas/SVG slides that letterbox with massive black bars on smartphones, forcing learners to pinch and zoom tiny text.
- **Micro-Learning Feed / Story Architecture**: Content automatically re-chunks into fluid, vertical bite-sized cards.
- **Adaptive Typography & Layout**: High-contrast, scannable cards with touch-friendly 48px+ tap targets.
- **Touch Gesture Navigation**: Swipe left/right or tap bottom floating action bar.
- **Built-in Speech Synthesis**: Tap the Audio button to listen to any slide hands-free.

### 2. ⚡ Rich Interactive E-Learning Activities
- **Multiple Choice Questions (MCQ)**: Single & multi-select questions with instant feedback, custom explanations, and score tracking.
- **Drag & Drop Matching**: Match concepts to categories with mouse dragging on desktop and **tap-to-place fallback on mobile touchscreens**.
- **Interactive Flashcards (Flip Cards)**: 3D interactive flip cards for definitions and formulas.
- **1-Click Smart Transformation**: Auto-generate MCQs and Drag & Drop activities directly from existing slide bullet points.

### 3. 🎓 SCORM 2004 4th Edition Compliant Export
- Generates a valid `.zip` package containing:
  - `imsmanifest.xml`: Valid SCORM 2004 metadata, organizations, item trees, and sequencing rules (`<imsss:minNormalizedMeasure>0.8</imsss:minNormalizedMeasure>`).
  - `scormFunctions.js`: Robust API wrapper that automatically discovers `API_1484_11` across parent frames, openers, and top windows.
  - CMI Tracking: Automatically reports `cmi.completion_status`, `cmi.success_status`, `cmi.score.raw`, `cmi.score.scaled`, `cmi.session_time`, `cmi.location`, and bookmarks.
- Tested and ready for **Moodle, SCORM Cloud, Canvas, Blackboard, SAP SuccessFactors, Docebo, and Cornerstone**.

### 4. 🌐 Standalone Single-File HTML Export
- All CSS, JavaScript, interactive engines, audio readers, and Base64-encoded images are compiled into a **single `.html` file**.
- Zero external web server dependencies; opens offline on any device or can be shared via email or intranet.

### 5. 🔍 Live SCORM LMS Inspector Console
- Test your course inside the built-in simulator with a live SCORM CMI event logger before exporting to your production LMS.

---

## 🚀 Quick Start

### Running the Web Studio GUI
```bash
# 1. Install dependencies (already pre-installed)
npm install

# 2. Start the local Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Headless CLI Conversion
You can convert presentations directly from the command line:
```bash
# Convert a PPTX file to standalone HTML and SCORM 2004 zip
npm run convert sample_presentation.pptx

# Or specify custom output file paths:
node cli/pptx2scorm.js presentation.pptx --html output.html --scorm my-course-scorm2004.zip
```

---

## 🛠 Project Structure

```
├── cli/
│   └── pptx2scorm.js          # Standalone CLI converter for Node.js
├── src/
│   ├── types/
│   │   └── course.ts          # TypeScript interfaces for slides, blocks, and SCORM settings
│   ├── utils/
│   │   ├── pptxParser.ts      # OpenXML PPTX extractor (shapes, text, media, tables)
│   │   ├── playerTemplate.ts  # Responsive mobile-first player engine & runtime
│   │   ├── scormPackager.ts   # SCORM 2004 manifest and zip packager
│   │   ├── htmlExporter.ts    # Standalone single-file HTML compiler
│   │   ├── interactiveGenerator.ts # MCQ, Drag & Drop, and Flashcard generators
│   │   └── sampleCourses.ts   # Built-in demo banking & cybersecurity course
│   ├── components/
│   │   ├── Header.tsx         # Navigation, export actions, and viewport switcher
│   │   ├── PlayerPreview.tsx  # Dual preview (Smartphone simulator & Desktop view)
│   │   ├── CourseEditor.tsx   # Slide organizer & interactive activity builder
│   │   ├── FileUpload.tsx     # Drag-and-drop PPTX file importer
│   │   └── ExportModal.tsx    # SCORM 2004 & HTML download dialog
│   ├── App.tsx                # Main application controller
│   └── main.tsx               # React root entry point
├── sample_presentation.pptx   # Sample PPTX for immediate testing
└── vite.config.ts             # Vite configuration with Tailwind CSS
```

---

## 📱 Mobile Re-imagination Comparison

| Feature | Traditional PPT Converter | SlideCraft Re-imagined Converter |
| :--- | :--- | :--- |
| **Aspect Ratio** | Fixed 16:9 box (huge black letterbox bars on mobile) | **100% Fluid Micro-learning Cards** |
| **Readability** | 8px–10px unreadable microscopic text | **16px+ adaptive high-contrast typography** |
| **Touch Controls** | Clumsy tiny buttons | **Large thumb-friendly tap targets & swipe gestures** |
| **Interactivity** | Static read-only slides | **Live MCQs, Drag & Drop matching, Flashcards** |
| **Accessibility** | Visual only | **Speech synthesis (slide audio narration)** |
| **LMS Reporting** | Basic completion or none | **Full SCORM 2004 4th Edition CMI Telemetry** |

---

## 🧪 Testing Your SCORM 2004 Package
1. Export the `.zip` file from the app (or run `npm run convert <file>.pptx`).
2. Go to [SCORM Cloud](https://cloud.scorm.com) (free sandbox).
3. Upload the generated zip file.
4. Launch the course: navigate through slides, answer the quiz questions, and observe `cmi.completion_status = completed` and `cmi.success_status = passed` with your recorded score.

