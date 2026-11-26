import React from 'react';
import { Layers, Download, Sparkles, Smartphone, Monitor, Upload, ShieldCheck, BookOpen, Lock } from 'lucide-react';
import { CourseData, ViewportMode } from '../types/course';
import { UploadedCourseInfo } from './FileUpload';

interface HeaderProps {
  course: CourseData;
  uploadedCourse?: UploadedCourseInfo | null;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  onOpenExport: () => void;
  onUploadClick: () => void;
  onLoadSample: () => void;
  activeTab: 'preview' | 'editor';
  onTabChange: (tab: 'preview' | 'editor') => void;
  onLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  course,
  uploadedCourse,
  viewportMode,
  onViewportChange,
  onOpenExport,
  onUploadClick,
  activeTab,
  onTabChange,
  onLock
}) => {
  const displayTitle = uploadedCourse ? uploadedCourse.title : course.title;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 shadow-md shadow-blue-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                PPTX to SCORM 2004 Converter
              </span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-400 border border-blue-500/30">
                SCORM 2004 4th Ed.
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 hidden md:inline-flex">
                Mobile Micro-Learning
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[340px]">
              {displayTitle}
            </p>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => onTabChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Interactive Preview</span>
          </button>
          <button
            onClick={() => onTabChange('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Course Architecture</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => onViewportChange('mobile')}
                title="Mobile Viewport (Responsive Micro-learning Cards)"
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${viewportMode === 'mobile'
                    ? 'bg-slate-800 text-blue-400 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewportChange('desktop')}
                title="Desktop / Tablet Viewport"
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${viewportMode === 'desktop'
                    ? 'bg-slate-800 text-blue-400 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload PPTX</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-emerald-500 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export SCORM / HTML</span>
          </button>

          {onLock && (
            <button
              onClick={onLock}
              title="Lock Studio (Require Password)"
              className="flex items-center gap-1 p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors ml-1"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
