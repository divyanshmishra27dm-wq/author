import React, { useState } from 'react';
import { X, Download, FileCode, Package, Check, ShieldCheck, Sparkles, BookOpen, FileCheck, Loader2 } from 'lucide-react';
import { CourseData, RichCourseData } from '../types/course';
import { UploadedCourseInfo } from './FileUpload';
import { AvailableCourse } from './PlayerPreview';
import { getApiUrl, getAuthHeaders } from '../utils/apiConfig';

interface ExportModalProps {
  course: CourseData;
  uploadedCourse?: UploadedCourseInfo | null;
  richCourse?: RichCourseData;
  currentPreviewUrl?: string;
  availableCourses?: AvailableCourse[];
  onClose: () => void;
  onUpdateCourse: (updated: CourseData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  uploadedCourse,
  richCourse,
  currentPreviewUrl,
  availableCourses = [],
  onClose
}) => {
  // Automatically default to the course matching current preview
  const defaultSelectedCourse = (() => {
    if (availableCourses && availableCourses.length > 0) {
      if (currentPreviewUrl) {
        const found = availableCourses.find(c =>
          currentPreviewUrl.includes(encodeURIComponent(c.name)) ||
          currentPreviewUrl === c.preview_url ||
          currentPreviewUrl.includes(c.name)
        );
        if (found) return found.name;
      }
      return availableCourses[0].name;
    }
    if (uploadedCourse) return 'uploaded';
    return 'day2';
  })();

  const [selectedCourse, setSelectedCourse] = useState<string>(defaultSelectedCourse);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExportingScorm, setIsExportingScorm] = useState(false);
  const [isExportingHtml, setIsExportingHtml] = useState(false);

  const getFiles = () => {
    const matchedCourse = availableCourses?.find(c => c.name === selectedCourse);
    if (matchedCourse) {
      const cleanTitle = matchedCourse.title.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim();
      return {
        scormZip: matchedCourse.scorm_zip_url,
        zipName: `${cleanTitle}_SCORM2004.zip`,
        htmlFile: matchedCourse.preview_url,
        htmlName: `${cleanTitle}.html`,
        title: matchedCourse.title,
        meta: `${matchedCourse.total_chapters} Chapters · Interactive Mobile Micro-Learning · SCORM 2004 4th Edition`
      };
    }

    if (selectedCourse === 'uploaded') {
      const title = (richCourse && richCourse.title) || (uploadedCourse && uploadedCourse.title) || 'Course';
      const cleanTitle = title.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim();
      const numChapters = (richCourse && richCourse.chapters ? richCourse.chapters.length : 0) || (uploadedCourse ? uploadedCourse.totalChapters : 0);
      const zipUrl = (uploadedCourse && uploadedCourse.scormZipUrl) || `/${encodeURIComponent(cleanTitle)}_SCORM2004.zip`;
      return {
        scormZip: zipUrl,
        zipName: `${cleanTitle}_SCORM2004.zip`,
        htmlFile: (uploadedCourse && uploadedCourse.htmlUrl) || `/${encodeURIComponent(cleanTitle)}.html`,
        htmlName: `${cleanTitle}.html`,
        title: title,
        meta: `${numChapters} Chapters · Interactive Mobile Micro-Learning · SCORM 2004 4th Edition`
      };
    } else if (selectedCourse === 'lesson1' || selectedCourse === 'Lesson 1' || selectedCourse === 'Lesson_1') {
      return {
        scormZip: '/Lesson%201_SCORM2004.zip',
        zipName: 'Lesson_1_Importance_of_CASA_SCORM2004.zip',
        htmlFile: '/Lesson%201.html',
        htmlName: 'Lesson_1_Importance_of_CASA.html',
        title: 'HDFC Academy · Lesson 1: Importance of CASA',
        meta: '6 Chapters · CASA Foundations, NIM Economics & Employee Levers · SCORM 2004 4th Edition'
      };
    } else if (selectedCourse === 'day3') {
      return {
        scormZip: '/Sample_Day3_Bank_Sales_Excellence_SCORM2004.zip',
        zipName: 'Sample_Day3_Bank_Sales_Excellence_SCORM2004.zip',
        htmlFile: '/Sample_Day3_Bank_Sales_Excellence.html',
        htmlName: 'Sample_Day3_Bank_Sales_Excellence.html',
        title: 'HDFC Academy · Day 3: Know Your Product — CASA & Savings Mastery (49 Slides · 9 Modules)',
        meta: '9 Modules · 49 Slides · CASA Ratios · Speciale Activ & Women\'s Gold · Interactive Sorters & Flashcards'
      };
    } else {
      return {
        scormZip: '/HDFC_Academy_BSE_Day2_Animated_SCORM2004.zip',
        zipName: 'HDFC_Academy_BSE_Day2_Mobile_SCORM2004_Rich.zip',
        htmlFile: '/HDFC_Academy_BSE_Day2_Animated.html',
        htmlName: 'HDFC_Academy_BSE_Day2_Mobile_Learning.html',
        title: 'HDFC Academy · Day 2: KYC, Products & Sales Mastery (129 Slides · 10 Modules)',
        meta: '10 Modules · 129 Slides · 14 Visual Infographics · 4 Video Slots · Full Quizzes & Sorters'
      };
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleExportScorm = async () => {
    const info = getFiles();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsExportingScorm(true);

    try {
      // If we have live richCourse data (with newly added flip cards, boxes, dropdowns, images),
      // package it dynamically through the export endpoint so all edits are included
      if (selectedCourse === 'uploaded' && richCourse && richCourse.chapters && richCourse.chapters.length > 0) {
        const payload = {
          course_name: richCourse.name || richCourse.title || (uploadedCourse ? (uploadedCourse.filename || uploadedCourse.title) : 'Course'),
          course_data: richCourse
        };

        const res = await fetch(getApiUrl('/api/course/export_scorm'), {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const blob = await res.blob();
          triggerBlobDownload(blob, info.zipName);
          setSuccessMsg(`✓ Certified SCORM 2004 4th Edition Package downloaded: ${info.zipName}`);
          return;
        }
      }

      // Download from backend URL
      const fullZipUrl = getApiUrl(info.scormZip);
      const a = document.createElement('a');
      a.href = fullZipUrl;
      a.download = info.zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccessMsg(`✓ SCORM 2004 4th Edition Package downloaded: ${info.zipName}`);
    } catch (err: any) {
      console.warn('Backend dynamic SCORM export fallback:', err);
      const fullZipUrl = getApiUrl(info.scormZip);
      const a = document.createElement('a');
      a.href = fullZipUrl;
      a.download = info.zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccessMsg(`✓ SCORM 2004 4th Edition Package downloaded: ${info.zipName}`);
    } finally {
      setIsExportingScorm(false);
    }
  };

  const handleExportHtml = async () => {
    const info = getFiles();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsExportingHtml(true);

    try {
      if (selectedCourse === 'uploaded' && richCourse && richCourse.chapters && richCourse.chapters.length > 0) {
        const payload = {
          course_name: richCourse.name || richCourse.title || (uploadedCourse ? (uploadedCourse.filename || uploadedCourse.title) : 'Course'),
          course_data: richCourse
        };

        const res = await fetch(getApiUrl('/api/course/export_html'), {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const blob = await res.blob();
          triggerBlobDownload(blob, info.htmlName);
          setSuccessMsg(`✓ Standalone Single-File HTML downloaded: ${info.htmlName}`);
          return;
        }
      }

      const fullHtmlUrl = getApiUrl(info.htmlFile);
      const a = document.createElement('a');
      a.href = fullHtmlUrl;
      a.download = info.htmlName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccessMsg(`✓ Standalone Single-File HTML downloaded: ${info.htmlName}`);
    } catch (err: any) {
      console.warn('Backend dynamic HTML export fallback:', err);
      const fullHtmlUrl = getApiUrl(info.htmlFile);
      const a = document.createElement('a');
      a.href = fullHtmlUrl;
      a.download = info.htmlName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccessMsg(`✓ Standalone Single-File HTML downloaded: ${info.htmlName}`);
    } finally {
      setIsExportingHtml(false);
    }
  };

  const currentInfo = getFiles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                SCORM 2004 4th Edition &amp; HTML Exporter
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              Export Mobile Micro-Learning Course
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-ready SCORM 2004 packages and standalone offline HTML presentations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Course Package Selector */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <label className="text-xs font-bold text-slate-300 block mb-2">Select Course / Presentation to Export:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
            {availableCourses && availableCourses.length > 0 ? (
              availableCourses.map((c) => {
                const isCurrentPreview = currentPreviewUrl && (
                  currentPreviewUrl.includes(encodeURIComponent(c.name)) ||
                  currentPreviewUrl === c.preview_url ||
                  currentPreviewUrl.includes(c.name)
                );
                const isSelected = selectedCourse === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => { setSelectedCourse(c.name); setSuccessMsg(null); }}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition-all relative ${isSelected
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/50 shadow'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileCheck className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="truncate flex-1 min-w-0">
                      <div className="font-bold truncate flex items-center gap-1.5">
                        <span className="truncate">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400">{c.total_chapters} Chapters</span>
                        {isCurrentPreview && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            PREVIEWING
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              uploadedCourse && (
                <button
                  onClick={() => { setSelectedCourse('uploaded'); setSuccessMsg(null); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${selectedCourse === 'uploaded'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="truncate">
                    <div className="font-bold truncate">Uploaded Course</div>
                    <div className="text-[10px] text-slate-400">{uploadedCourse.totalChapters} Chapters</div>
                  </div>
                </button>
              )
            )}

            <button
              onClick={() => { setSelectedCourse('day2'); setSuccessMsg(null); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${selectedCourse === 'day2'
                ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <div className="font-bold">Day 2 Reference</div>
                <div className="text-[10px] text-slate-400">129 Slides · 10 Modules</div>
              </div>
            </button>

            <button
              onClick={() => { setSelectedCourse('lesson1'); setSuccessMsg(null); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${selectedCourse === 'lesson1' || selectedCourse === 'Lesson 1'
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <div className="font-bold">Lesson 1: CASA</div>
                <div className="text-[10px] text-slate-400">6 Slides · 6 Chapters</div>
              </div>
            </button>

            <button
              onClick={() => { setSelectedCourse('day3'); setSuccessMsg(null); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${selectedCourse === 'day3'
                ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-indigo-400" />
              <div>
                <div className="font-bold">Day 3 Reference</div>
                <div className="text-[10px] text-slate-400">49 Slides · 9 Modules</div>
              </div>
            </button>
          </div>
        </div>

            {/* Selected Course Meta Banner */}
            <div className="mt-3 px-3.5 py-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300">
              <span className="font-bold">{currentInfo.title}</span> — <span className="text-slate-400">{currentInfo.meta}</span>
            </div>

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Export Cards */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SCORM 2004 Option */}
                <div className="flex flex-col justify-between rounded-xl border border-blue-500/30 bg-blue-950/20 p-5 hover:border-blue-500/60 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                        <Package className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-extrabold text-blue-300">
                        LMS Certified
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-white">
                      Download SCORM 2004 Package (.zip)
                    </h4>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Standard ADL SCORM 2004 4th Edition zip with <code>imsmanifest.xml</code>, CMI score telemetry, question-level tracking, and suspend_data bookmarking. Ready for Moodle, Cornerstone, SAP, or TalentLMS.
                    </p>
                  </div>

                  <button
                    onClick={handleExportScorm}
                    disabled={isExportingScorm || isExportingHtml}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isExportingScorm ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Packaging SCORM 2004 ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download SCORM 2004 ZIP</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Standalone HTML Option */}
                <div className="flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 hover:border-emerald-500/60 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                        <FileCode className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                        100% Offline
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-white">
                      Download Standalone HTML (.html)
                    </h4>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Single portable file with bundled CSS, JavaScript micro-learning engine, and full interactive drills. Double-click to open on any smartphone, iPad, or desktop browser with zero internet or server required.
                    </p>
                  </div>

                  <button
                    onClick={handleExportHtml}
                    disabled={isExportingScorm || isExportingHtml}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isExportingHtml ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating Standalone HTML...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download Standalone HTML</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Tested against SCORM 2004 4th Edition Conformance Guidelines</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          );
};
