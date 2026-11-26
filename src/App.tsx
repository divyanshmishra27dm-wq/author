import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PlayerPreview, AvailableCourse } from './components/PlayerPreview';
import { CourseEditor } from './components/CourseEditor';
import { FileUpload, UploadedCourseInfo } from './components/FileUpload';
import { ExportModal } from './components/ExportModal';
import { AuthGate } from './components/AuthGate';
import { CourseData, ViewportMode, RichCourseData } from './types/course';
import { sampleBankDay3Course } from './utils/sampleBankDay3';
import { getApiUrl, getAuthHeaders } from './utils/apiConfig';

function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.replace(/[:]/g, '_');
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('app_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [course, setCourse] = useState<CourseData>(sampleBankDay3Course);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);

  // Uploaded presentation state
  const [uploadedCourse, setUploadedCourse] = useState<UploadedCourseInfo | null>(() => {
    try {
      const saved = localStorage.getItem('last_uploaded_course');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.previewUrl) {
          return {
            ...parsed,
            previewUrl: sanitizeUrl(parsed.previewUrl)
          };
        }
      }
    } catch (e) { }
    return null;
  });

  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('last_preview_url');
      if (saved) {
        return sanitizeUrl(saved);
      }
    } catch (e) { }
    return '';
  });

  // Dynamic Rich Course Data (Direct 1:1 with SCORM 2004 Engine chapters & blocks)
  const [richCourse, setRichCourse] = useState<RichCourseData>({
    title: '',
    name: '',
    chapters: []
  });

  // Fetch course chapters on mount or course switch
  const fetchCourseData = async (courseIdentifier?: string) => {
    if (!courseIdentifier) return;
    try {
      let cleanReq = decodeURIComponent(courseIdentifier).split('?')[0];
      cleanReq = cleanReq.replace(/^.*\//, ''); // strip leading directory
      cleanReq = cleanReq.replace(/\.html$/i, ''); // strip .html extension
      cleanReq = cleanReq.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim();
      if (!cleanReq) return;

      let res: Response;
      try {
        res = await fetch(getApiUrl(`/api/course?name=${encodeURIComponent(cleanReq)}`), {
          headers: getAuthHeaders()
        });
      } catch (e) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          res = await fetch(`http://127.0.0.1:8000/api/course?name=${encodeURIComponent(cleanReq)}`, {
            headers: getAuthHeaders()
          });
        } else {
          throw e;
        }
      }
      if (!res.ok && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          res = await fetch(`http://127.0.0.1:8000/api/course?name=${encodeURIComponent(cleanReq)}`, {
            headers: getAuthHeaders()
          });
        } catch { }
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.chapters && data.chapters.length > 0) {
          setRichCourse({
            title: data.title || courseIdentifier,
            name: data.name || cleanReq,
            chapters: data.chapters
          });
          const safeUrl = sanitizeUrl(data.preview_url);
          setCurrentPreviewUrl(prev => {
            if (prev && (prev.includes(encodeURIComponent(data.name || cleanReq)) || prev === safeUrl)) {
              return prev;
            }
            return safeUrl;
          });
          setUploadedCourse(prev => ({
            ...(prev || {}),
            title: data.title || prev?.title || courseIdentifier,
            filename: data.name || cleanReq,
            totalChapters: data.chapters.length,
            previewUrl: safeUrl,
            htmlUrl: safeUrl,
            scormZipUrl: `/${encodeURIComponent(data.name || cleanReq)}_SCORM2004.zip`
          }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch course chapters:', e);
    }
  };

  const loadCourses = async () => {
    try {
      let res: Response;
      try {
        res = await fetch(getApiUrl('/api/courses'), { headers: getAuthHeaders() });
      } catch {
        res = await fetch('http://127.0.0.1:8000/api/courses', { headers: getAuthHeaders() });
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setAvailableCourses(data.courses);
          const existing = data.courses.find((c: AvailableCourse) =>
            (currentPreviewUrl && (c.preview_url === currentPreviewUrl || currentPreviewUrl.includes(encodeURIComponent(c.name)))) ||
            (uploadedCourse && c.name === uploadedCourse.filename)
          );
          const active = existing || data.courses[0];
          if (!currentPreviewUrl || !existing) {
            const safeUrl = sanitizeUrl(active.preview_url);
            setCurrentPreviewUrl(safeUrl);
            setUploadedCourse({
              title: active.title,
              filename: active.name,
              totalChapters: active.total_chapters,
              previewUrl: safeUrl,
              htmlUrl: safeUrl,
              scormZipUrl: active.scorm_zip_url
            });
            fetchCourseData(active.name);
          } else {
            fetchCourseData(existing.name);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load courses:', e);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCourseLoaded = async (newCourse: CourseData, info?: UploadedCourseInfo) => {
    setCourse(newCourse);
    if (info) {
      const cleanUrl = sanitizeUrl(info.previewUrl);
      const safeInfo = {
        ...info,
        previewUrl: cleanUrl
      };
      setUploadedCourse(safeInfo);
      setCurrentPreviewUrl(cleanUrl);
      if (info.courseData && info.courseData.chapters && info.courseData.chapters.length > 0) {
        setRichCourse({
          title: info.title,
          name: info.filename || info.title,
          chapters: info.courseData.chapters
        });
      } else {
        fetchCourseData(info.filename || info.previewUrl || info.title);
      }
      try {
        localStorage.setItem('last_uploaded_course', JSON.stringify(safeInfo));
        localStorage.setItem('last_preview_url', cleanUrl);
      } catch (e) { }
    }
    await loadCourses();
    setShowUploadModal(false);
    setActiveTab('preview');
  };

  const handleSelectPreviewUrl = (url: string) => {
    const clean = sanitizeUrl(url);
    setCurrentPreviewUrl(clean);
    try {
      localStorage.setItem('last_preview_url', clean);
    } catch (e) { }
    const match = availableCourses.find(c => c.preview_url === url || c.preview_url === clean || clean.includes(encodeURIComponent(c.name)));
    if (match) {
      const info: UploadedCourseInfo = {
        title: match.title,
        filename: match.name,
        totalChapters: match.total_chapters,
        previewUrl: match.preview_url,
        htmlUrl: match.preview_url,
        scormZipUrl: match.scorm_zip_url
      };
      setUploadedCourse(info);
      try {
        localStorage.setItem('last_uploaded_course', JSON.stringify(info));
      } catch (e) { }
      fetchCourseData(match.name);
    } else {
      fetchCourseData(clean);
    }
  };

  const handleLoadSample = () => {
    setCourse(sampleBankDay3Course);
    handleSelectPreviewUrl('/scorm_player/index.html?course=day3');
    fetchCourseData('Sample_Day3_Bank_Sales_Excellence');
    setActiveTab('preview');
  };

  // Live Sync edited Course Architecture back to Standalone HTML & SCORM ZIP
  const handleSyncPreview = async (targetChapterIndex?: number) => {
    try {
      setIsSyncing(true);
      const courseName = richCourse.name || uploadedCourse?.filename || uploadedCourse?.title || 'Course';
      const cleanName = courseName.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim() || 'Sample_Course';

      let res: Response | null = null;
      try {
        res = await fetch(getApiUrl('/api/course/update'), {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            course_name: cleanName,
            course_data: {
              title: richCourse.title,
              chapters: richCourse.chapters
            }
          })
        });
      } catch (e) {
        console.warn('Proxy to /api/course/update failed, will try direct 8000 fallback:', e);
      }

      if (!res || !res.ok) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          try {
            res = await fetch('http://127.0.0.1:8000/api/course/update', {
              method: 'POST',
              headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify({
                course_name: cleanName,
                course_data: {
                  title: richCourse.title,
                  chapters: richCourse.chapters
                }
              })
            });
          } catch (directErr) {
            console.error('Direct fetch to 8000 also failed:', directErr);
          }
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success) {
          let cleanUrl = sanitizeUrl(data.preview_url);
          if (typeof targetChapterIndex === 'number') {
            cleanUrl += `&ch=${targetChapterIndex}`;
          }
          setCurrentPreviewUrl(cleanUrl);
          const updated: UploadedCourseInfo = {
            title: data.title || richCourse.title,
            totalChapters: data.total_chapters || richCourse.chapters.length,
            previewUrl: cleanUrl,
            htmlUrl: data.html_url,
            scormZipUrl: data.scorm_zip_url
          };
          setUploadedCourse(updated);
          try {
            localStorage.setItem('last_uploaded_course', JSON.stringify(updated));
            localStorage.setItem('last_preview_url', cleanUrl);
          } catch (e) { }
        }
      }
    } catch (e) {
      console.error('Error syncing course updates:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePreviewSlide = async (slideIndex: number) => {
    await handleSyncPreview(slideIndex);
    setActiveTab('preview');
  };

  const handleLock = () => {
    localStorage.removeItem('app_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        course={course}
        uploadedCourse={uploadedCourse}
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        onOpenExport={() => setShowExportModal(true)}
        onUploadClick={() => setShowUploadModal(true)}
        onLoadSample={handleLoadSample}
        activeTab={activeTab}
        onLock={handleLock}
        onTabChange={async (tab) => {
          if (tab === 'preview' && activeTab === 'editor') {
            await handleSyncPreview();
          }
          setActiveTab(tab);
          if (tab === 'editor' && richCourse.chapters.length === 0) {
            fetchCourseData(uploadedCourse?.filename || uploadedCourse?.title);
          }
        }}
      />

      {/* Main Body */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'preview' ? (
          <PlayerPreview
            course={course}
            uploadedCourse={uploadedCourse}
            currentPreviewUrl={currentPreviewUrl}
            onSelectPreviewUrl={handleSelectPreviewUrl}
            availableCourses={availableCourses}
            viewportMode={viewportMode}
            onViewportChange={setViewportMode}
            onOpenEditor={() => {
              setActiveTab('editor');
              if (richCourse.chapters.length === 0) {
                fetchCourseData(uploadedCourse?.filename || uploadedCourse?.title);
              }
            }}
          />
        ) : (
          <CourseEditor
            richCourse={richCourse}
            onUpdateRichCourse={setRichCourse}
            onSyncPreview={handleSyncPreview}
            onPreviewSlide={handlePreviewSlide}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Upload PowerPoint File</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <FileUpload
                onCourseLoaded={handleCourseLoaded}
                onClose={() => setShowUploadModal(false)}
                onLoadSample={handleLoadSample}
              />
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          course={course}
          uploadedCourse={uploadedCourse}
          richCourse={richCourse}
          onClose={() => setShowExportModal(false)}
          onUpdateCourse={setCourse}
        />
      )}
    </div>
  );
}

export default App;
