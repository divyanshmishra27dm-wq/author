import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Smartphone, CheckCircle2 } from 'lucide-react';
import { CourseData } from '../types/course';
import { sampleBankDay3Course } from '../utils/sampleBankDay3';
import { getApiUrl, APP_PASSWORD } from '../utils/apiConfig';

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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const isZip = !!file.name.match(/\.(zip)$/i);
    const isPptx = !!file.name.match(/\.(pptx)$/i);

    if (!isZip && !isPptx) {
      setError('Please upload a valid PowerPoint presentation (.pptx) or SCORM package (.zip) file.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);
    setStatusMessage('Connecting and starting upload...');

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const endpoint = isZip ? getApiUrl('/api/upload_scorm') : getApiUrl('/api/convert');

    let stageInterval: any = null;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.min(95, Math.round((event.loaded / event.total) * 90));
        setUploadProgress(pct);
        const loadedMB = (event.loaded / (1024 * 1024)).toFixed(1);
        const totalMB = (event.total / (1024 * 1024)).toFixed(1);
        const fileTypeLabel = isZip ? 'SCORM package' : 'presentation';
        setStatusMessage(`Uploading ${fileTypeLabel}: ${loadedMB} MB / ${totalMB} MB (${pct}%)...`);
      }
    };

    xhr.upload.onload = () => {
      setUploadProgress(92);
      setStatusMessage('Extracting slide layouts, media assets, and tables...');
      const messages = [
        'Analyzing deck structure & segmenting chapters...',
        'Engaging AI transformation engine for quizzes & drills...',
        'Compiling responsive mobile SCORM 2004 interactive package...'
      ];
      let msgIdx = 0;
      stageInterval = setInterval(() => {
        if (msgIdx < messages.length) {
          setStatusMessage(messages[msgIdx]);
          setUploadProgress((prev) => Math.min(98, (prev || 92) + 2));
          msgIdx++;
        }
      }, 3500);
    };

    xhr.open('POST', endpoint);
    xhr.setRequestHeader('X-Access-Key', APP_PASSWORD);
    xhr.timeout = 300000; // 5 minutes timeout

    xhr.ontimeout = () => {
      if (stageInterval) clearInterval(stageInterval);
      setError('Upload timed out. Please check your connection or file size.');
      setIsProcessing(false);
      setUploadProgress(null);
    };

    xhr.onload = () => {
      if (stageInterval) clearInterval(stageInterval);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setStatusMessage(`✓ Successfully loaded ${data.total_chapters} micro-learning chapters with interactive quizzes and SCORM 2004!`);

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
            setUploadProgress(null);
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
          } else {
            setError(data.error || 'Failed to convert presentation');
            setIsProcessing(false);
            setUploadProgress(null);
          }
        } catch {
          setError('Invalid response from server. Please retry.');
          setIsProcessing(false);
          setUploadProgress(null);
        }
      } else {
        let serverErrorMsg = `Server error (${xhr.status})`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData && errData.error) serverErrorMsg = errData.error;
        } catch { }
        setError(serverErrorMsg);
        setIsProcessing(false);
        setUploadProgress(null);
      }
    };

    xhr.onerror = () => {
      if (stageInterval) clearInterval(stageInterval);
      setError('Network connection error or server reset during presentation upload.');
      setIsProcessing(false);
      setUploadProgress(null);
    };

    xhr.send(formData);
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
          accept=".pptx,.zip"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isProcessing}
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-3 border border-blue-500/20">
          <Upload className="h-7 w-7" />
        </div>

        <h4 className="text-sm font-bold text-white text-center">
          {isProcessing ? 'Processing Course File...' : 'Drop your PowerPoint (.pptx) or SCORM Package (.zip) here'}
        </h4>
        <p className="text-xs text-slate-400 text-center mt-1 max-w-sm">
          Supports PPTX presentations and existing SCORM 2004 ZIP packages with embedded videos, audio voiceovers, and interactive drills.
        </p>

        {isProcessing && (
          <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-xs">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            <span className="text-xs text-blue-400 font-semibold text-center">{statusMessage}</span>
            {uploadProgress !== null && (
              <div className="w-full bg-slate-800 rounded-full h-2 mt-1 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
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
          <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
          <span>SCORM 2004 4th Edition LMS Tracking</span>
        </div>
      </div>
    </div>
  );
};
