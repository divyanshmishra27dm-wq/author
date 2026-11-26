import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Monitor, RotateCcw, Activity, ChevronDown, ChevronUp, Sparkles, BookOpen, FileCheck } from 'lucide-react';
import { CourseData, ViewportMode } from '../types/course';
import { UploadedCourseInfo } from './FileUpload';
import { BACKEND_URL } from '../utils/apiConfig';

export interface AvailableCourse {
  name: string;
  title: string;
  total_chapters: number;
  preview_url: string;
  scorm_zip_url: string;
  mtime?: number;
}

interface PlayerPreviewProps {
  course: CourseData;
  uploadedCourse?: UploadedCourseInfo | null;
  currentPreviewUrl: string;
  onSelectPreviewUrl: (url: string) => void;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  onOpenEditor: () => void;
  availableCourses?: AvailableCourse[];
}

interface ScormLogEntry {
  timestamp: string;
  action: string;
  element: string;
  value: string;
}

export const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  course,
  uploadedCourse,
  currentPreviewUrl,
  onSelectPreviewUrl,
  viewportMode,
  onViewportChange,
  availableCourses = []
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [scormLogs, setScormLogs] = useState<ScormLogEntry[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [scormState, setScormState] = useState({
    completionStatus: 'unknown',
    successStatus: 'unknown',
    scoreRaw: '0',
    scoreScaled: '0.00',
    location: 'Chapter 1'
  });

  const safePreviewUrl = currentPreviewUrl
    ? currentPreviewUrl.replace(/[:]/g, '_')
    : (uploadedCourse?.previewUrl || '');
  const cleanPath = safePreviewUrl.split('?')[0].replace(/^\//, '');
  const existingQuery = safePreviewUrl.includes('?') ? safePreviewUrl.split('?')[1] : '';
  const safeFilename = encodeURIComponent(decodeURIComponent(cleanPath));
  const queryParams = new URLSearchParams(existingQuery);
  queryParams.set('_t', String(reloadKey || Date.now()));
  if (reloadKey > 0) {
    queryParams.set('_r', String(reloadKey));
  }
  const qStr = queryParams.toString();
  const basePath = BACKEND_URL ? `${BACKEND_URL}/` : '/';
  const fullIframeSrc = `${basePath}${safeFilename}${qStr ? '?' + qStr : `?t=${reloadKey}`}`;

  useEffect(() => {
    setReloadKey(Date.now());
  }, [uploadedCourse, currentPreviewUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      try {
        const win = iframe.contentWindow as any;
        if (!win) return;

        // If iframe mistakenly loaded SPA host index, log warning without hijacking current course
        if (win.document && win.document.getElementById('root') && !win.document.querySelector('.app-shell')) {
          console.warn('Iframe loaded SPA host index instead of course HTML:', fullIframeSrc);
          return;
        }

        // Provide standard SCORM 2004 4th Edition API to iframe
        win.API_1484_11 = {
          Initialize: () => {
            logScorm('Initialize', 'API_1484_11.Initialize', '""');
            setScormState(prev => ({ ...prev, completionStatus: 'incomplete' }));
            return 'true';
          },
          Terminate: () => {
            logScorm('Terminate', 'API_1484_11.Terminate', '""');
            return 'true';
          },
          GetValue: (elem: string) => {
            if (elem === 'cmi.completion_status') return scormState.completionStatus;
            if (elem === 'cmi.score.raw') return scormState.scoreRaw;
            return '';
          },
          SetValue: (elem: string, val: string) => {
            logScorm('SetValue', elem, val);
            setScormState(prev => {
              const updated = { ...prev };
              if (elem === 'cmi.completion_status') updated.completionStatus = val;
              if (elem === 'cmi.success_status') updated.successStatus = val;
              if (elem === 'cmi.score.raw') updated.scoreRaw = val;
              if (elem === 'cmi.score.scaled') updated.scoreScaled = val;
              if (elem === 'cmi.location') updated.location = val;
              return updated;
            });
            return 'true';
          },
          Commit: () => 'true',
          GetLastError: () => '0',
          GetErrorString: () => 'No error',
          GetDiagnostic: () => 'OK'
        };
      } catch (e) {
        console.warn('Could not inject mock SCORM API:', e);
      }
    };

    iframe.addEventListener('load', handleIframeLoad);
    return () => { iframe.removeEventListener('load', handleIframeLoad); };
  }, [reloadKey, currentPreviewUrl]);

  const logScorm = (action: string, element: string, value: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setScormLogs(prev => [
      { timestamp: timeStr, action, element, value },
      ...prev.slice(0, 24)
    ]);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)] p-3 sm:p-5 bg-slate-950">
      {/* Top Toolbar: Viewport & Course Switcher */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
        {/* Module Switcher - Dynamically populated from available converted courses */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400">Course Preview:</span>
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 flex-wrap gap-1">
            {availableCourses && availableCourses.length > 0 ? (
              availableCourses.map((c) => {
                const isSelected = safePreviewUrl.includes(encodeURIComponent(c.name)) || safePreviewUrl === c.preview_url || safePreviewUrl.includes(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => onSelectPreviewUrl(c.preview_url)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isSelected
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>{c.title} ({c.total_chapters} Chapters)</span>
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-slate-400 px-3 py-1">
                {uploadedCourse?.title ? `${uploadedCourse.title} (${uploadedCourse.totalChapters} Chapters)` : 'No course loaded'}
              </span>
            )}
          </div>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => onViewportChange('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewportMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              onClick={() => onViewportChange('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewportMode === 'desktop'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop / Tablet</span>
            </button>
          </div>

          <button
            onClick={() => { setReloadKey(k => k + 1); setScormLogs([]); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart</span>
          </button>

          <button
            onClick={() => setInspectorOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${inspectorOpen
              ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
              : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>SCORM 2004 Inspector</span>
            {inspectorOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* SCORM Inspector Drawer */}
      {inspectorOpen && (
        <div className="w-full max-w-6xl mb-4 rounded-xl border border-emerald-500/30 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                SCORM 2004 4th Edition LMS Telemetry
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Live CMI Telemetry (Synchronized with learner interactions)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">cmi.completion_status</div>
              <div className={`text-xs font-bold mt-0.5 ${scormState.completionStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {scormState.completionStatus}
              </div>
            </div>
            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">cmi.success_status</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{scormState.successStatus}</div>
            </div>
            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">cmi.score.raw</div>
              <div className="text-xs font-bold text-blue-400 mt-0.5">{scormState.scoreRaw}%</div>
            </div>
            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">cmi.location</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{scormState.location}</div>
            </div>
          </div>

          <div className="max-h-28 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800 p-2 text-[11px] font-mono">
            {scormLogs.length === 0 ? (
              <div className="text-slate-500 py-1 text-center">
                Waiting for LMS interaction... (Navigate chapters, open accordions, or answer quizzes)
              </div>
            ) : (
              scormLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5 text-slate-300">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className="font-bold text-blue-400">{log.action}</span>
                  <span className="text-emerald-400">{log.element}</span>
                  <span className="text-slate-400">=</span>
                  <span className="text-amber-300 truncate max-w-xs">{log.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Preview Container */}
      {viewportMode === 'mobile' ? (
        <div className="flex flex-col items-center">
          <div className="mobile-device-frame relative shadow-2xl">
            <div className="mobile-notch">
              <div className="mobile-camera" />
            </div>
            <iframe
              key={`${currentPreviewUrl}_${reloadKey}`}
              ref={iframeRef}
              src={fullIframeSrc}
              title="Mobile Responsive Course Player"
              className="w-full h-full border-none pt-2"
              sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-popups-to-escape-sandbox allow-forms"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/40 px-4 py-1 text-xs text-blue-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Mobile Re-imagination: Fluid micro-learning cards, sticky header, drawer navigation &amp; interactive quizzes.</span>
          </div>
        </div>
      ) : (
        /* Full Desktop Frame */
        <div className="w-full max-w-4xl h-[780px] rounded-2xl border border-slate-800 bg-[#f3f6fa] shadow-2xl overflow-hidden flex flex-col">
          <iframe
            key={`${currentPreviewUrl}_${reloadKey}_desk`}
            ref={iframeRef}
            src={fullIframeSrc}
            title="Desktop Presentation Deck Player"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-popups-to-escape-sandbox allow-forms"
          />
        </div>
      )}
    </div>
  );
};
