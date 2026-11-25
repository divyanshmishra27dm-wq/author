import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Sparkles, Smartphone, Layers, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { CourseData, CourseSlide } from '../types/course';
import { sampleBankDay3Course } from '../utils/sampleBankDay3';
import { getApiUrl } from '../utils/apiConfig';

export interface UploadedCourseInfo {
  title: string;
  totalChapters: number;
  previewUrl: string;
  htmlUrl: string;
  scormZipUrl: string;
  filename?: string;
  courseData?: any;
}

interface FileUploadProps {
  onCourseLoaded: (course: CourseData, info?: UploadedCourseInfo) => void;
  onClose?: () => void;
  onLoadSample: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onCourseLoaded,
  onClose,
  onLoadSample
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.name.match(/\.(pptx)$/i)) {
      setError('Please upload a valid PowerPoint presentation (.pptx) file.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setStatusMessage('Analyzing slides and building mobile micro-learning curriculum...');

      const formData = new FormData();
      formData.append('file', file);

      let res: Response | null = null;
      try {
        res = await fetch(getApiUrl('/api/convert'), {
          method: 'POST',
          body: formData
        });
      } catch (e) {
        console.warn('Proxy /api/convert failed, attempting fallback to port 8000:', e);
      }

      if (!res || !res.ok) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          try {
            res = await fetch('http://127.0.0.1:8000/api/convert', {
              method: 'POST',
              body: formData
            });
          } catch (directErr) {
            console.error('Direct convert call to 8000 failed:', directErr);
          }
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatusMessage(`✓ Successfully generated ${data.total_chapters} micro-learning chapters with interactive quizzes and SCORM 2004!`);

          const courseTitle = data.title || file.name.replace(/\.[^/.]+$/, '');
          const courseData: CourseData = {
            title: courseTitle,
            subtitle: data.course_data?.subtitle || courseTitle,
            description: `Mobile-first interactive course with ${data.total_chapters} chapters, quizzes, and SCORM 2004 telemetry.`,
            theme: sampleBankDay3Course.theme,
            scormSettings: {
              ...sampleBankDay3Course.scormSettings,
              title: courseTitle,
              identifier: courseTitle.replace(/[^a-zA-Z0-9_-]/g, '_')
            },
            slides: (data.course_data?.chapters || []).map((ch: any, idx: number) => ({
              id: ch.id || `slide-${idx + 1}`,
              title: ch.title || ch.shortTitle || `Chapter ${idx + 1}`,
              content: ch.subtitle || '',
              type: 'content'
            }))
          };

          const filename = data.course_name || file.name.replace(/\.[^/.]+$/, '');
          setIsProcessing(false);
          onCourseLoaded(courseData, {
            title: courseTitle,
            filename: filename,
            totalChapters: data.total_chapters || 1,
            previewUrl: data.preview_url,
            htmlUrl: data.html_url,
            scormZipUrl: data.scorm_zip_url,
            courseData: data.course_data
          });
          if (onClose) onClose();
          return;
        }
      }

          throw new Error('Failed to convert presentation');
        } catch (err: any) {
          console.error('Conversion error:', err);
          setError(err.message || 'Error processing PowerPoint file. Please verify backend is running.');
          setIsProcessing(false);
        }
      };

      const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
      };

      const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
      };

      const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      };

      return (
        <div className="flex flex-col gap-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${isDragging
              ? 'border-blue-500 bg-blue-950/30 scale-[0.99]'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pptx"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isProcessing}
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-3 border border-blue-500/20">
              <Upload className="h-7 w-7" />
            </div>

            <h4 className="text-sm font-bold text-white text-center">
              {isProcessing ? 'Processing Course Architecture...' : 'Drop your PowerPoint (.pptx) file here'}
            </h4>
            <p className="text-xs text-slate-400 text-center mt-1 max-w-sm">
              Supports enterprise decks (e.g. <code>HDFC_Academy_BSE_Day2_Animated.pptx</code>, <code>Sample_Day3_Bank_Sales_Excellence.pptx</code>).
            </p>

            {isProcessing && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                <span className="text-xs text-blue-400 font-semibold">{statusMessage}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <Smartphone className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Mobile Re-imagined (No tiny slides)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>MCQs, Blanks &amp; Sorter Drills</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>SCORM 2004 4th Edition LMS Tracking</span>
            </div>
          </div>
        </div>
      );
    };
