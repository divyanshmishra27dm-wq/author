import React, { useState } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, CheckCircle2,
  Sparkles, Layers, FileText, Sliders, AlertCircle, Video,
  List, Eye, Save, RefreshCw, Copy, BookOpen, Check,
  ChevronDown, ChevronUp, MessageSquare, ExternalLink, ShieldCheck,
  Volume2, Upload, Headphones, RotateCw, LayoutGrid, Image as ImageIcon,
  X, CheckSquare
} from 'lucide-react';
import {
  RichCourseData,
  CourseChapter,
  ChapterBlock,
  MCQQuestionItem,
  KYCSorterDoc,
  BlanksItem,
  MatchPairItem,
  AccordionItem,
  BoxItem,
  CollapsibleItem,
  FlashcardItemEntry
} from '../types/course';
import { getApiUrl, getAuthHeaders } from '../utils/apiConfig';

interface SectionImageControlProps {
  imageSrc?: string;
  alt?: string;
  caption?: string;
  onUpdateImage: (updates: { src?: string; imageSrc?: string; imageUrl?: string; alt?: string; caption?: string }) => void;
  onUploadFile: (file: File) => void;
  isUploading?: boolean;
  title?: string;
}

function getSafeDisplaySrc(src?: string): string {
  if (!src) return '';
  const s = String(src).trim();
  if (s.startsWith('data:') || s.startsWith('blob:')) return s;
  const path = s.startsWith('http') ? s : getApiUrl(s.startsWith('/') ? s : `/${s}`);
  try {
    return encodeURI(decodeURI(path));
  } catch {
    return path.replace(/ /g, '%20');
  }
}

const SectionImageControl: React.FC<SectionImageControlProps> = ({
  imageSrc,
  alt = '',
  caption = '',
  onUpdateImage,
  onUploadFile,
  isUploading = false,
  title = 'Section Visual / Placed Image'
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlVal, setUrlVal] = useState(imageSrc || '');

  const hasImage = Boolean(imageSrc && String(imageSrc).trim().length > 0);

  return (
    <div className={`rounded-xl border p-3.5 transition-all ${hasImage
      ? 'border-pink-500/40 bg-gradient-to-r from-pink-950/40 via-slate-900/80 to-slate-900 border-l-4 border-l-pink-500 shadow-md shadow-pink-950/20'
      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
      }`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${hasImage ? 'bg-pink-500/20 text-pink-300' : 'bg-slate-800 text-slate-400'}`}>
            <ImageIcon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200">
            {title}
          </span>
          {hasImage ? (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Image Placed &amp; Visible
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 italic">
              Optional image for this section
            </span>
          )}
        </div>

        {hasImage && (
          <button
            type="button"
            onClick={() => onUpdateImage({ imageSrc: '', src: '', imageUrl: '', caption: '', alt: '' })}
            className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            title="Remove image from this section"
          >
            <X className="h-3 w-3" />
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {hasImage ? (
        <div className="space-y-3">
          {/* Live Section Image Preview */}
          <div className="relative group rounded-xl border border-slate-700/80 bg-slate-950 p-2.5 flex flex-col items-center justify-center overflow-hidden">
            <img
              src={getSafeDisplaySrc(imageSrc)}
              alt={alt || 'Placed section image'}
              className="max-h-52 w-auto max-w-full rounded-lg object-contain shadow-lg border border-slate-800/80 bg-slate-900/50"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('%20') || target.src.includes(' ')) {
                  target.src = target.src.replace(/%20| /g, '_');
                }
              }}
            />
            {caption && (
              <div className="mt-2 text-center text-xs font-semibold text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full">
                📊 {caption}
              </div>
            )}
            <div className="text-[10px] text-slate-400 mt-1 truncate max-w-full font-mono">
              Source: {imageSrc}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Image Caption / Label
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => onUpdateImage({ caption: e.target.value })}
                placeholder="e.g. Workflow Steps or Product Comparison Table"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Image Alt Description
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => onUpdateImage({ alt: e.target.value })}
                placeholder="Short description for accessibility"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isUploading
              ? 'bg-pink-600/50 text-white cursor-wait animate-pulse'
              : 'bg-pink-600 hover:bg-pink-500 text-white shadow-sm'
              }`}>
              <Upload className="h-3 w-3" />
              <span>{isUploading ? 'Uploading...' : 'Replace Image File'}</span>
              <input
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.svg"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadFile(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {showUrlInput ? 'Hide URL' : 'Edit URL / Path'}
            </button>
          </div>

          {showUrlInput && (
            <div className="pt-2 flex items-center gap-1.5">
              <input
                type="text"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                placeholder="media/image1.png or https://..."
                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateImage({ src: urlVal, imageSrc: urlVal, imageUrl: urlVal });
                  setShowUrlInput(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-dashed border-slate-800 hover:border-pink-500/40 bg-slate-900/40 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Add an image to this section</p>
              <p className="text-[11px] text-slate-400">Upload any PNG, JPG, WebP, or SVG. It will appear directly in this section.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${isUploading
              ? 'bg-pink-600/50 text-white cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-600/20'
              }`}>
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.svg"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadFile(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Paste Link
            </button>
          </div>

          {showUrlInput && (
            <div className="w-full pt-2 border-t border-slate-800 flex items-center gap-1.5">
              <input
                type="text"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                placeholder="media/image1.png or https://..."
                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlVal.trim()) {
                    onUpdateImage({ src: urlVal.trim(), imageSrc: urlVal.trim(), imageUrl: urlVal.trim() });
                    setShowUrlInput(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CourseEditorProps {
  richCourse: RichCourseData;
  onUpdateRichCourse: (updated: RichCourseData) => void;
  onSyncPreview?: (targetChapterIndex?: number) => Promise<void>;
  onPreviewSlide: (index: number) => void;
  isSyncing?: boolean;
}

export const CourseEditor: React.FC<CourseEditorProps> = ({
  richCourse,
  onUpdateRichCourse,
  onSyncPreview,
  onPreviewSlide,
  isSyncing = false
}) => {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'quiz' | 'video' | 'card'>('all');

  const chapters = richCourse.chapters || [];
  const safeIndex = (selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length)
    ? selectedChapterIndex
    : 0;
  const activeChapter = chapters[safeIndex] || {
    id: 'ch0',
    num: '00',
    shortTitle: 'New Module',
    title: 'New Module',
    subtitle: '',
    blocks: []
  };

  // ---------------------------------------------------------------------------
  // Chapter State Updaters
  // ---------------------------------------------------------------------------
  const updateActiveChapter = (updater: (ch: CourseChapter) => CourseChapter) => {
    const updated = chapters.map((c, idx) => {
      if (idx === safeIndex) {
        return updater({ ...c });
      }
      return c;
    });
    onUpdateRichCourse({ ...richCourse, chapters: updated });
  };

  const handleAddChapter = (isUrlSlide = false) => {
    const nextIdx = chapters.length;
    const newChapter: CourseChapter = isUrlSlide ? {
      id: `ch_${Date.now()}`,
      num: `M${nextIdx}`,
      shortTitle: `Module ${nextIdx}`,
      title: `Module ${nextIdx}: External Link`,
      subtitle: 'External Resource & Web Link',
      blocks: [
        {
          type: 'url_redirect',
          tag: 'Web Link',
          heading: 'External Resource',
          url: 'https://',
          urlText: 'Click here to visit resource'
        }
      ]
    } : {
      id: `ch_${Date.now()}`,
      num: `M${nextIdx}`,
      shortTitle: `Module ${nextIdx}`,
      title: `Module ${nextIdx}: New Chapter Title`,
      subtitle: 'Key concepts, products and sales guidelines',
      blocks: [
        {
          type: 'card',
          tag: `Slide ${nextIdx + 1}`,
          heading: `Module ${nextIdx} Core Concepts`,
          body: '<p>Enter clear, consultative guidelines for this section.</p>',
          bullets: [
            'First key learning point or customer eligibility criteria',
            'Second step or documentation requirement'
          ]
        }
      ]
    };
    const updated = [...chapters, newChapter];
    onUpdateRichCourse({ ...richCourse, chapters: updated });
    setSelectedChapterIndex(updated.length - 1);
  };

  const handleDeleteChapter = (idxToDelete: number) => {
    if (chapters.length <= 1) {
      alert('A course must have at least one chapter.');
      return;
    }
    if (!confirm(`Delete Chapter ${idxToDelete + 1}: "${chapters[idxToDelete]?.shortTitle}"?`)) return;

    const filtered = chapters.filter((_, idx) => idx !== idxToDelete);
    onUpdateRichCourse({ ...richCourse, chapters: filtered });
    if (selectedChapterIndex >= filtered.length) {
      setSelectedChapterIndex(filtered.length - 1);
    }
  };

  const handleMoveChapter = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;

    const copy = [...chapters];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    onUpdateRichCourse({ ...richCourse, chapters: copy });
    setSelectedChapterIndex(targetIdx);
  };

  const handleDuplicateChapter = (idx: number) => {
    const src = chapters[idx];
    const cloned: CourseChapter = JSON.parse(JSON.stringify(src));
    cloned.id = `ch_${Date.now()}`;
    cloned.shortTitle = `${src.shortTitle} (Copy)`;
    cloned.title = `${src.title} (Copy)`;

    const copy = [...chapters];
    copy.splice(idx + 1, 0, cloned);
    onUpdateRichCourse({ ...richCourse, chapters: copy });
    setSelectedChapterIndex(idx + 1);
  };

  // ---------------------------------------------------------------------------
  // Block Level Updaters
  // ---------------------------------------------------------------------------
  const [uploadingAudioBlockIdx, setUploadingAudioBlockIdx] = useState<number | null>(null);
  const [uploadingImageBlockIdx, setUploadingImageBlockIdx] = useState<number | null>(null);
  const [flippedPreviewCards, setFlippedPreviewCards] = useState<Record<string, boolean>>({});
  const [openPreviewCollapsibles, setOpenPreviewCollapsibles] = useState<Record<string, boolean>>({});

  const handleUploadImageForBlock = async (bIdx: number, file: File) => {
    try {
      setUploadingImageBlockIdx(bIdx);
      const formData = new FormData();
      formData.append('file', file);
      const headers = getAuthHeaders();
      let uploadedUrl = '';
      try {
        let res = await fetch(getApiUrl('/api/upload_image'), {
          method: 'POST',
          headers,
          body: formData
        });
        if (!res.ok && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          res = await fetch('http://127.0.0.1:8000/api/upload_image', {
            method: 'POST',
            headers,
            body: formData
          });
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.image_url) {
            uploadedUrl = data.image_url;
          }
        }
      } catch (netErr) {
        console.warn('Backend image upload network error, using local FileReader DataURL fallback:', netErr);
      }

      if (uploadedUrl) {
        updateBlock(bIdx, b => ({
          ...b,
          src: uploadedUrl,
          imageSrc: uploadedUrl,
          imageUrl: uploadedUrl,
          alt: b.alt || file.name,
          caption: b.caption || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        }));
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            updateBlock(bIdx, b => ({
              ...b,
              src: dataUrl,
              imageSrc: dataUrl,
              imageUrl: dataUrl,
              alt: b.alt || file.name,
              caption: b.caption || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert('Image upload failed: ' + (err?.message || 'Could not read file.'));
    } finally {
      setUploadingImageBlockIdx(null);
    }
  };

  const handleUploadAudioForBlock = async (bIdx: number, file: File) => {
    try {
      setUploadingAudioBlockIdx(bIdx);
      const formData = new FormData();
      formData.append('file', file);
      const headers = getAuthHeaders();
      let res: Response;
      try {
        res = await fetch(getApiUrl('/api/upload_audio'), {
          method: 'POST',
          headers,
          body: formData
        });
        if (!res.ok && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          res = await fetch('http://127.0.0.1:8000/api/upload_audio', {
            method: 'POST',
            headers,
            body: formData
          });
        }
      } catch (networkErr) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          res = await fetch('http://127.0.0.1:8000/api/upload_audio', {
            method: 'POST',
            headers,
            body: formData
          });
        } else {
          throw networkErr;
        }
      }
      const data = await res.json();
      if (data.success && data.audio_url) {
        updateBlock(bIdx, b => ({
          ...b,
          audioUrl: data.audio_url,
          audioTitle: b.audioTitle || (b.heading ? `Listen: ${b.heading}` : (b.tag ? `${b.tag} Voiceover` : 'Audio Voiceover'))
        }));
      } else {
        alert('Audio upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Audio upload error:', err);
      alert('Audio upload failed: ' + (err?.message || 'Could not connect to server.'));
    } finally {
      setUploadingAudioBlockIdx(null);
    }
  };

  const updateBlock = (blockIndex: number, updater: (b: ChapterBlock) => ChapterBlock) => {
    updateActiveChapter(ch => {
      const nextBlocks = [...ch.blocks];
      nextBlocks[blockIndex] = updater({ ...nextBlocks[blockIndex] });
      return { ...ch, blocks: nextBlocks };
    });
  };

  const removeBlock = (blockIndex: number) => {
    updateActiveChapter(ch => ({
      ...ch,
      blocks: ch.blocks.filter((_, idx) => idx !== blockIndex)
    }));
  };

  const moveBlock = (blockIndex: number, direction: 'up' | 'down') => {
    updateActiveChapter(ch => {
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
      if (targetIndex < 0 || targetIndex >= ch.blocks.length) return ch;
      const copy = [...ch.blocks];
      const temp = copy[blockIndex];
      copy[blockIndex] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...ch, blocks: copy };
    });
  };

  const duplicateBlock = (blockIndex: number) => {
    updateActiveChapter(ch => {
      const copy = [...ch.blocks];
      const cloned = JSON.parse(JSON.stringify(copy[blockIndex]));
      copy.splice(blockIndex + 1, 0, cloned);
      return { ...ch, blocks: copy };
    });
  };

  // ---------------------------------------------------------------------------
  // One-Click Inserters for Interactive Modules & Sections
  // ---------------------------------------------------------------------------
  const addBlockMCQ = () => {
    const newBlock: ChapterBlock = {
      type: 'quiz_mcq',
      id: `mcq_${Date.now()}`,
      title: 'Knowledge Check: Concept Mastery',
      questions: [
        {
          q: 'Which of the following is the key eligibility or product criteria for this account?',
          options: [
            'Option A: Primary feature or benefit matching customer need',
            'Option B: Less optimal alternative variant',
            'Option C: Unrelated deposit requirement',
            'Option D: Inapplicable service channel'
          ],
          correct: 0,
          explanation: 'Option A directly reflects the bank\'s prescribed guideline and provides maximum customer value.'
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockSorter = () => {
    const newBlock: ChapterBlock = {
      type: 'kyc_sorter',
      id: `sorter_${Date.now()}`,
      title: 'Interactive Document & Product Sorter',
      instruction: 'Classify each item below by deciding if it meets the mandatory criteria:',
      docs: [
        {
          name: 'Passport (Current, unexpired with photograph & address)',
          valid: true,
          note: 'Full Officially Valid Document (OVD) accepted for proof of identity and address.'
        },
        {
          name: 'Utility Bill (Electricity/Telephone older than 2 months)',
          valid: false,
          note: 'Utility bills are only deemed OVD for limited temporary address updates and must be under 2 months old.'
        },
        {
          name: 'Voter Identity Card issued by Election Commission',
          valid: true,
          note: 'Officially Valid Document (OVD) valid across all branch channels.'
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockBlanks = () => {
    const newBlock: ChapterBlock = {
      type: 'quiz_blanks',
      id: `blanks_${Date.now()}`,
      title: 'Fill in the Blanks Word Bank Challenge',
      wordBank: ['Current Account', 'Savings Account', 'Average Monthly Balance', 'KYC Verification', 'Cheque Book'],
      blankItems: [
        {
          prompt: 'A ________________ is ideal for businesses to handle frequent commercial debits without transaction ceilings.',
          answer: 'Current Account'
        },
        {
          prompt: 'To avoid non-maintenance penalty charges, retail customers must preserve the designated ________________.',
          answer: 'Average Monthly Balance'
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockMatch = () => {
    const newBlock: ChapterBlock = {
      type: 'quiz_match',
      id: `match_${Date.now()}`,
      title: 'Match the Product with the Right Customer Profile',
      options: ['Speciale Senior Citizen', 'Savings Max', 'Regular Current Account', 'Insta Account'],
      pairs: [
        {
          left: 'Trader requiring high daily cash deposit limits and merchant QR',
          answer: 'Regular Current Account'
        },
        {
          left: 'Salaried professional seeking free accidental death cover of ₹25 Lakhs',
          answer: 'Savings Max'
        },
        {
          left: 'Retiree wanting monthly interest payouts and doorstep banking',
          answer: 'Speciale Senior Citizen'
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockVideo = () => {
    const newBlock: ChapterBlock = {
      type: 'video_placeholder',
      id: `video_${Date.now()}`,
      badge: 'ROLEPLAY DEMONSTRATION',
      duration: '3m 45s',
      title: 'Consultative Customer Account Opening Journey',
      embedUrl: 'media/media1.mp4',
      watchFor: [
        'How the banker opens with a professional warm greeting and establishes rapport.',
        'Explaining the product value proposition instead of reciting account fees.',
        'Securing complete KYC documentation the first time without missing signatures.'
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockCard = () => {
    const newBlock: ChapterBlock = {
      type: 'card',
      tag: `Section ${activeChapter.blocks.length + 1}`,
      heading: 'Product Guidelines & Sales Steps',
      body: '<p>Provide specific step-by-step guidance for branch executives and field sales teams.</p>',
      bullets: [
        'Verify customer documents against original physical copies.',
        'Cross-sell relevant debit card variants and active netbanking setup.'
      ],
      callout: {
        type: 'tip',
        text: '<strong>Pro-Tip:</strong> Always confirm mobile number seeding with OTP verification during onboarding.'
      }
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockThink = () => {
    const newBlock: ChapterBlock = {
      type: 'think',
      title: 'Reflect & Think',
      prompt: 'Why is getting complete, verified KYC documentation right the first time critical for both customer delight and RBI compliance?',
      hint: 'First-time-right onboarding eliminates document re-collection delays, avoids customer frustration, and protects the bank against regulatory penalties.'
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockAccordion = () => {
    const newBlock: ChapterBlock = {
      type: 'accordion',
      tag: 'Curriculum Objectives',
      heading: 'Key Learning Outcomes',
      items: [
        {
          title: 'IDENTIFY — Product Rules & Suitability',
          content: '<ul class="rich-list"><li>Pinpoint the exact savings or current account variant matching customer turnover and cash requirements.</li></ul>'
        },
        {
          title: 'EXPLAIN — Benefits & Privileges',
          content: '<ul class="rich-list"><li>Articulate airport lounge access, waiver benefits, and insurance protections cleanly.</li></ul>'
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockUrlRedirect = () => {
    const newBlock: ChapterBlock = {
      type: 'url_redirect',
      tag: 'Web Link',
      heading: 'External Resource',
      url: 'https://',
      urlText: 'Click here to visit resource'
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockFlashcards = () => {
    const newBlock: ChapterBlock = {
      type: 'flashcards',
      id: `fc_${Date.now()}`,
      tag: 'Flip Drill',
      title: 'Interactive Flip Cards: Concept Mastery',
      instruction: 'Tap any card below to flip and reveal the key knowledge takeaway:',
      cards: [
        {
          q: 'What is the primary customer eligibility criteria for this account variant?',
          a: 'Average Monthly Balance (AMB) maintained as prescribed for Metro / Urban or Semi-Urban branches.'
        },
        {
          q: 'Which mandatory document is acceptable as an Officially Valid Document (OVD)?',
          a: 'Current unexpired Passport, Voter ID, Driving Licence, or Aadhaar letter/card with address and photo.'
        },
        {
          q: 'What are the core value benefits offered on the companion debit card?',
          a: 'Complimentary airport lounge access, personal accidental death cover, and dining discounts.'
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockBoxes = () => {
    const newBlock: ChapterBlock = {
      type: 'boxes',
      id: `boxes_${Date.now()}`,
      tag: 'Key Highlights',
      heading: 'Core Architecture Pillars & Features',
      body: '<p>Key product features and essential criteria for sales and operational excellence:</p>',
      boxGridCols: 2,
      boxes: [
        {
          title: 'Product Eligibility & Tier',
          badge: 'CRITERIA',
          badgeColor: 'gold',
          desc: 'Clear eligibility criteria matching the customer profile and financial turnover.',
          bullets: [
            'Minimum balance requirements maintained on Average Monthly basis',
            'Instant digital onboarding via mobile biometric or OTP'
          ],
          highlight: true
        },
        {
          title: 'Value Privileges & Waivers',
          badge: 'BENEFITS',
          badgeColor: 'green',
          desc: 'Customer perks that boost engagement and product adoption.',
          bullets: [
            'Complimentary airport lounge access and fuel surcharge waivers',
            'Comprehensive insurance protection and zero liability cover'
          ],
          green: true
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockCollapsibleBoxes = () => {
    const newBlock: ChapterBlock = {
      type: 'collapsible_boxes',
      id: `coll_${Date.now()}`,
      tag: 'Explore & Learn',
      heading: 'Frequently Asked Questions & Detailed Steps',
      body: '<p>Click any drop-down section below to reveal specific details and conditions:</p>',
      collapsibles: [
        {
          title: '1. What are the key account opening documents needed?',
          badge: 'STEP 1',
          badgeColor: 'blue',
          content: '<p>Branches require valid identity and address proof as per RBI master directions.</p>',
          bullets: [
            'Officially Valid Document (Passport, Driving License, Voter ID, Aadhaar)',
            'Recent passport size photograph and PAN or Form 60'
          ],
          isOpen: true
        },
        {
          title: '2. How does the customer activate digital banking services?',
          badge: 'STEP 2',
          badgeColor: 'green',
          content: '<p>Customers can register via mobile app or web portal in under 3 minutes.</p>',
          bullets: [
            'Debit card authentication with SMS OTP verification',
            'Immediate activation of UPI, NEFT, and IMPS transaction channels'
          ],
          isOpen: false
        }
      ]
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  const addBlockImage = () => {
    const newBlock: ChapterBlock = {
      type: 'image',
      id: `img_${Date.now()}`,
      tag: 'Visual Diagram',
      heading: 'Process & Architecture Diagram',
      src: '',
      alt: 'Process workflow diagram',
      caption: 'Process Architecture Diagram'
    };
    updateActiveChapter(ch => ({ ...ch, blocks: [...ch.blocks, newBlock] }));
  };

  // ---------------------------------------------------------------------------
  // Sync to Preview Action
  // ---------------------------------------------------------------------------
  const handleSaveAndSync = async () => {
    if (onSyncPreview) {
      await onSyncPreview(safeIndex);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // ---------------------------------------------------------------------------
  // Filtered Chapters for Navigation
  // ---------------------------------------------------------------------------
  const filteredChapters = chapters.filter(c => {
    if (activeFilter === 'quiz') {
      return c.blocks.some(b => ['quiz_mcq', 'kyc_sorter', 'quiz_blanks', 'quiz_match'].includes(b.type));
    }
    if (activeFilter === 'video') {
      return c.blocks.some(b => b.type === 'video_placeholder');
    }
    if (activeFilter === 'card') {
      return c.blocks.some(b => b.type === 'card');
    }
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* ===================================================================== */}
      {/* LEFT SIDEBAR: Slide / Chapter Outline */}
      {/* ===================================================================== */}
      <div className="w-full lg:w-84 border-r border-slate-800 bg-slate-900/60 flex flex-col h-auto lg:h-full shrink-0">
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Course Outline
              </h3>
              <p className="text-[11px] text-slate-400">
                {chapters.length} Chapters · {chapters.reduce((acc, c) => acc + c.blocks.length, 0)} Blocks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddChapter(false)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm"
              title="Add a standard content chapter"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Slide</span>
            </button>
            <button
              onClick={() => handleAddChapter(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
              title="Add a dedicated URL / Web Link slide"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>+ URL Slide</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800/80 bg-slate-950/40 text-[11px]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All ({chapters.length})
          </button>
          <button
            onClick={() => setActiveFilter('quiz')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${activeFilter === 'quiz' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveFilter('video')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${activeFilter === 'video' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Videos
          </button>
        </div>

        {/* Chapters Scroll List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredChapters.map((c, originalIdx) => {
            const actualIdx = chapters.indexOf(c);
            const isSelected = actualIdx === safeIndex;

            const mcqCount = c.blocks.filter(b => b.type === 'quiz_mcq').length;
            const sorterCount = c.blocks.filter(b => b.type === 'kyc_sorter').length;
            const blanksCount = c.blocks.filter(b => b.type === 'quiz_blanks').length;
            const matchCount = c.blocks.filter(b => b.type === 'quiz_match').length;
            const videoCount = c.blocks.filter(b => b.type === 'video_placeholder').length;
            const thinkCount = c.blocks.filter(b => b.type === 'think').length;
            const flashcardCount = c.blocks.filter(b => b.type === 'flashcards').length;
            const boxesCount = c.blocks.filter(b => b.type === 'boxes').length;
            const dropdownCount = c.blocks.filter(b => b.type === 'collapsible_boxes').length;
            const imageCount = c.blocks.filter(b => b.type === 'image' || !!(b.imageSrc || b.src || b.imageUrl)).length;
            const audioCount = c.blocks.filter(b => !!b.audioUrl).length;

            return (
              <div
                key={c.id || actualIdx}
                onClick={() => setSelectedChapterIndex(actualIdx)}
                className={`group relative rounded-xl border p-3 transition-all cursor-pointer ${isSelected
                  ? 'border-blue-500 bg-blue-500/10 text-white shadow-md ring-1 ring-blue-500/30'
                  : 'border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[10px] font-extrabold text-blue-400 border border-slate-700">
                      {c.num || String(actualIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold truncate block">
                      {c.shortTitle || c.title || `Chapter ${actualIdx + 1}`}
                    </span>
                  </div>

                  {/* Move, Copy & Delete buttons */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveChapter(actualIdx, 'up'); }}
                      disabled={actualIdx === 0}
                      title="Move Up"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveChapter(actualIdx, 'down'); }}
                      disabled={actualIdx === chapters.length - 1}
                      title="Move Down"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateChapter(actualIdx); }}
                      title="Duplicate Chapter"
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteChapter(actualIdx); }}
                      title="Delete Chapter"
                      className="p-1 rounded text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Subtitle preview */}
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                  {c.title}
                </p>

                {/* Badges for Interactive Content */}
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {mcqCount > 0 && (
                    <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-500/30">
                      {mcqCount} MCQ
                    </span>
                  )}
                  {sorterCount > 0 && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                      {sorterCount} Sorter
                    </span>
                  )}
                  {blanksCount > 0 && (
                    <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                      Word Bank
                    </span>
                  )}
                  {matchCount > 0 && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                      Match
                    </span>
                  )}
                  {videoCount > 0 && (
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                      {videoCount} Video
                    </span>
                  )}
                  {thinkCount > 0 && (
                    <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-bold text-yellow-300 border border-yellow-500/30">
                      Reflect
                    </span>
                  )}
                  {flashcardCount > 0 && (
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                      Flip Cards
                    </span>
                  )}
                  {boxesCount > 0 && (
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 border border-sky-500/30">
                      Boxes
                    </span>
                  )}
                  {dropdownCount > 0 && (
                    <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-teal-300 border border-teal-500/30">
                      Drop Downs
                    </span>
                  )}
                  {imageCount > 0 && (
                    <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-0.5">
                      <ImageIcon className="h-2.5 w-2.5" />
                      Images
                    </span>
                  )}
                  {audioCount > 0 && (
                    <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-500/30 flex items-center gap-0.5">
                      <Volume2 className="h-2.5 w-2.5" />
                      {audioCount} Audio
                    </span>
                  )}
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                    {c.blocks.length} Blocks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* RIGHT MAIN WORKSPACE: Slide & Interactive Editor */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Top Sticky Action Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-black">
                {activeChapter.num || String(safeIndex + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                  Editing Chapter {safeIndex + 1} of {chapters.length}
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {activeChapter.shortTitle || activeChapter.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onPreviewSlide(safeIndex)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                title="Jump to the interactive player preview for this chapter"
              >
                <span>Jump to Preview</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span className="text-emerald-200">Synced ✓</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save &amp; Sync to Preview</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chapter Metadata Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Module Settings &amp; Hierarchy
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {activeChapter.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Chapter Code / Num
                </label>
                <input
                  type="text"
                  value={activeChapter.num || ''}
                  onChange={(e) => updateActiveChapter(c => ({ ...c, num: e.target.value }))}
                  placeholder="e.g. M1, 00, M2"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Navigation Short Title (Shows in Top Bar &amp; Drawer)
                </label>
                <input
                  type="text"
                  value={activeChapter.shortTitle || ''}
                  onChange={(e) => updateActiveChapter(c => ({ ...c, shortTitle: e.target.value }))}
                  placeholder="e.g. Importance of CASA"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Full Slide / Chapter Headline
              </label>
              <input
                type="text"
                value={activeChapter.title || ''}
                onChange={(e) => updateActiveChapter(c => ({ ...c, title: e.target.value }))}
                placeholder="e.g. Module 1: Importance of CASA: Why deposits matter"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Subtitle / Learning Essence
              </label>
              <textarea
                rows={2}
                value={activeChapter.subtitle || ''}
                onChange={(e) => updateActiveChapter(c => ({ ...c, subtitle: e.target.value }))}
                placeholder="Key concept essence or bullet points separated by bullets (•)..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick-Add Tray: Interactive Learning Modules & Visual Layouts */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-emerald-950/30 p-5 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Course Architecture Modules (Flip Cards · Boxes · Drop Downs · Images)
                  </h4>
                </div>
                <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  1-Click Add
                </span>
              </div>

              {/* 4 Requested Primary Architecture Inserters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={addBlockFlashcards}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 hover:border-indigo-400 text-indigo-300 transition-all text-center group shadow-sm"
                  title="Add interactive flip cards with question front and takeaway back"
                >
                  <RotateCw className="h-5 w-5 mb-1 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-xs font-bold">+ Flip the Cards</span>
                  <span className="text-[10px] text-indigo-400/80">3D Interactive Flip</span>
                </button>

                <button
                  onClick={addBlockBoxes}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/50 hover:border-sky-400 text-sky-300 transition-all text-center group shadow-sm"
                  title="Add feature & criteria boxes grid"
                >
                  <LayoutGrid className="h-5 w-5 mb-1 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">+ Boxes</span>
                  <span className="text-[10px] text-sky-400/80">Feature Boxes Grid</span>
                </button>

                <button
                  onClick={addBlockCollapsibleBoxes}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-teal-500/40 bg-teal-950/40 hover:bg-teal-900/50 hover:border-teal-400 text-teal-300 transition-all text-center group shadow-sm"
                  title="Add collapsible drop down sections"
                >
                  <ChevronDown className="h-5 w-5 mb-1 text-teal-400 group-hover:translate-y-0.5 transition-transform" />
                  <span className="text-xs font-bold">+ Drop Downs</span>
                  <span className="text-[10px] text-teal-400/80">Expandable Accordion</span>
                </button>

                <button
                  onClick={addBlockImage}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-pink-500/40 bg-pink-950/40 hover:bg-pink-900/50 hover:border-pink-400 text-pink-300 transition-all text-center group shadow-sm"
                  title="Add an image section or visual diagram"
                >
                  <ImageIcon className="h-5 w-5 mb-1 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">+ Add Images</span>
                  <span className="text-[10px] text-pink-400/80">Upload &amp; Place Visual</span>
                </button>
              </div>
            </div>

            {/* Scored Drills & Checks */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Interactive Knowledge Checks:
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={addBlockMCQ}
                  className="flex items-center gap-2 p-2 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 transition-colors text-xs font-bold"
                >
                  <HelpCircle className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>+ MCQ Quiz</span>
                </button>

                <button
                  onClick={addBlockSorter}
                  className="flex items-center gap-2 p-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-300 transition-colors text-xs font-bold"
                >
                  <Sliders className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>+ Drag &amp; Drop</span>
                </button>

                <button
                  onClick={addBlockBlanks}
                  className="flex items-center gap-2 p-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 transition-colors text-xs font-bold"
                >
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>+ Word Bank</span>
                </button>

                <button
                  onClick={addBlockMatch}
                  className="flex items-center gap-2 p-2 rounded-lg border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 transition-colors text-xs font-bold"
                >
                  <Layers className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>+ Match Pairs</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Add Extras:</span>
              <button
                onClick={addBlockVideo}
                className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
              >
                <Video className="h-3 w-3" />
                <span>+ Roleplay Video Slot</span>
              </button>
              <button
                onClick={addBlockThink}
                className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 text-[11px] font-semibold text-yellow-300 hover:bg-yellow-500/20 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>+ Reflect &amp; Think</span>
              </button>
              <button
                onClick={addBlockCard}
                className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                <span>+ Content Section</span>
              </button>
              <button
                onClick={addBlockUrlRedirect}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                title="Add a full-card URL redirect link"
              >
                <ExternalLink className="h-3 w-3 text-emerald-400" />
                <span>+ URL Link</span>
              </button>
            </div>
          </div>

          {/* Chapter Content Blocks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Slide Sections &amp; Interactive Blocks ({activeChapter.blocks.length})
              </h4>
              <button
                onClick={addBlockCard}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {activeChapter.blocks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No blocks yet in this chapter.</p>
                <p className="text-xs mt-1">Use the buttons above to insert content cards, quizzes, drag &amp; drop, or video slots.</p>
              </div>
            ) : (
              activeChapter.blocks.map((block, bIdx) => (
                <div
                  key={block.id || bIdx}
                  className={`rounded-2xl border p-5 shadow-sm transition-all ${block.type === 'quiz_mcq'
                    ? 'border-purple-500/40 bg-slate-900/80 border-l-4 border-l-purple-500'
                    : block.type === 'kyc_sorter'
                      ? 'border-emerald-500/40 bg-slate-900/80 border-l-4 border-l-emerald-500'
                      : block.type === 'quiz_blanks'
                        ? 'border-cyan-500/40 bg-slate-900/80 border-l-4 border-l-cyan-500'
                        : block.type === 'quiz_match'
                          ? 'border-amber-500/40 bg-slate-900/80 border-l-4 border-l-amber-500'
                          : block.type === 'video_placeholder'
                            ? 'border-rose-500/40 bg-slate-900/80 border-l-4 border-l-rose-500'
                            : block.type === 'think'
                              ? 'border-yellow-500/40 bg-slate-900/80 border-l-4 border-l-yellow-500'
                              : block.type === 'url_redirect'
                                ? 'border-emerald-500/40 bg-slate-900/80 border-l-4 border-l-emerald-500'
                                : block.type === 'flashcards'
                                  ? 'border-indigo-500/40 bg-slate-900/80 border-l-4 border-l-indigo-500'
                                  : block.type === 'boxes'
                                    ? 'border-sky-500/40 bg-slate-900/80 border-l-4 border-l-sky-500'
                                    : block.type === 'collapsible_boxes'
                                      ? 'border-teal-500/40 bg-slate-900/80 border-l-4 border-l-teal-500'
                                      : block.type === 'image'
                                        ? 'border-pink-500/40 bg-slate-900/80 border-l-4 border-l-pink-500'
                                        : 'border-slate-800 bg-slate-900/60 border-l-4 border-l-blue-500'
                    }`}
                >
                  {/* Block Header Toolbar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${block.type === 'quiz_mcq' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        block.type === 'kyc_sorter' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          block.type === 'quiz_blanks' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            block.type === 'quiz_match' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              block.type === 'video_placeholder' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                block.type === 'think' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  block.type === 'url_redirect' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                    block.type === 'flashcards' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                      block.type === 'boxes' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                                        block.type === 'collapsible_boxes' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                                          block.type === 'image' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                        {block.type === 'url_redirect' ? 'URL REDIRECT' : block.type === 'flashcards' ? 'FLIP CARDS' : block.type === 'collapsible_boxes' ? 'DROP DOWNS' : block.type === 'boxes' ? 'BOXES GRID' : block.type.replace('_', ' ')}
                      </span>
                      {block.tag && (
                        <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-md">
                          {block.tag}
                        </span>
                      )}
                      {(block.imageSrc || block.src || block.imageUrl) && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-md" title={`Image attached: ${block.imageSrc || block.src || block.imageUrl}`}>
                          <ImageIcon className="h-3 w-3" />
                          <span>Image Placed</span>
                        </span>
                      )}
                      {block.audioUrl && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md" title={`Audio: ${block.audioUrl}`}>
                          <Volume2 className="h-3 w-3" />
                          <span>Audio Attached</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveBlock(bIdx, 'up')}
                        disabled={bIdx === 0}
                        title="Move Up"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => moveBlock(bIdx, 'down')}
                        disabled={bIdx === activeChapter.blocks.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateBlock(bIdx)}
                        title="Duplicate Section"
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeBlock(bIdx)}
                        title="Delete Block"
                        className="p-1 rounded text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------- */}
                  {/* MCQ QUIZ BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'quiz_mcq' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-purple-300 block mb-1">
                          Quiz Title
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      {(block.questions || []).map((qItem, qIdx) => (
                        <div key={qIdx} className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-400">
                              Question {qIdx + 1}
                            </span>
                            {block.questions && block.questions.length > 1 && (
                              <button
                                onClick={() => {
                                  const updatedQuestions = block.questions?.filter((_, idx) => idx !== qIdx);
                                  updateBlock(bIdx, b => ({ ...b, questions: updatedQuestions }));
                                }}
                                className="text-[10px] text-red-400 hover:underline"
                              >
                                Remove Question
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            value={qItem.q}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateBlock(bIdx, b => {
                                const qCopy = [...(b.questions || [])];
                                qCopy[qIdx] = { ...qCopy[qIdx], q: val };
                                return { ...b, questions: qCopy };
                              });
                            }}
                            placeholder="Enter question prompt..."
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
                          />

                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-400 block">
                              Options (Click radio button to mark correct answer):
                            </label>
                            {qItem.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct_${bIdx}_${qIdx}`}
                                  checked={qItem.correct === oIdx}
                                  onChange={() => {
                                    updateBlock(bIdx, b => {
                                      const qCopy = [...(b.questions || [])];
                                      qCopy[qIdx] = { ...qCopy[qIdx], correct: oIdx };
                                      return { ...b, questions: qCopy };
                                    });
                                  }}
                                  className="accent-purple-500 h-4 w-4 shrink-0 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const qCopy = [...(b.questions || [])];
                                      const opts = [...qCopy[qIdx].options];
                                      opts[oIdx] = val;
                                      qCopy[qIdx] = { ...qCopy[qIdx], options: opts };
                                      return { ...b, questions: qCopy };
                                    });
                                  }}
                                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                                />
                                {qItem.options.length > 2 && (
                                  <button
                                    onClick={() => {
                                      updateBlock(bIdx, b => {
                                        const qCopy = [...(b.questions || [])];
                                        const opts = qCopy[qIdx].options.filter((_, idx) => idx !== oIdx);
                                        const newCorrect = qCopy[qIdx].correct >= opts.length ? 0 : qCopy[qIdx].correct;
                                        qCopy[qIdx] = { ...qCopy[qIdx], options: opts, correct: newCorrect };
                                        return { ...b, questions: qCopy };
                                      });
                                    }}
                                    className="p-1 text-slate-500 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              onClick={() => {
                                updateBlock(bIdx, b => {
                                  const qCopy = [...(b.questions || [])];
                                  const opts = [...qCopy[qIdx].options, `New option ${qCopy[qIdx].options.length + 1}`];
                                  qCopy[qIdx] = { ...qCopy[qIdx], options: opts };
                                  return { ...b, questions: qCopy };
                                });
                              }}
                              className="text-[11px] font-semibold text-purple-400 hover:underline pt-1"
                            >
                              + Add Option
                            </button>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              Explanation / Mentor Feedback
                            </label>
                            <textarea
                              rows={2}
                              value={qItem.explanation}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const qCopy = [...(b.questions || [])];
                                  qCopy[qIdx] = { ...qCopy[qIdx], explanation: val };
                                  return { ...b, questions: qCopy };
                                });
                              }}
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newQ: MCQQuestionItem = {
                            q: 'Additional concept knowledge check question:',
                            options: ['Option 1 (Correct)', 'Option 2', 'Option 3', 'Option 4'],
                            correct: 0,
                            explanation: 'Correct according to standard banking policy.'
                          };
                          updateBlock(bIdx, b => ({
                            ...b,
                            questions: [...(b.questions || []), newQ]
                          }));
                        }}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Another Question</span>
                      </button>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* KYC SORTER / DRAG & DROP BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'kyc_sorter' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-emerald-300 block mb-1">
                          Activity Title
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Learner Instruction
                        </label>
                        <input
                          type="text"
                          value={block.instruction || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, instruction: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Draggable Items / Documents to Classify:
                        </label>
                        {(block.docs || []).map((doc, dIdx) => (
                          <div key={dIdx} className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={doc.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateBlock(bIdx, b => {
                                    const dCopy = [...(b.docs || [])];
                                    dCopy[dIdx] = { ...dCopy[dIdx], name: val };
                                    return { ...b, docs: dCopy };
                                  });
                                }}
                                placeholder="Document / concept name..."
                                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                              />

                              {/* Toggle: Valid / Meets Criteria vs Invalid */}
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const dCopy = [...(b.docs || [])];
                                    dCopy[dIdx] = { ...dCopy[dIdx], valid: !dCopy[dIdx].valid };
                                    return { ...b, docs: dCopy };
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors shrink-0 ${doc.valid
                                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                  : 'bg-red-600/20 border-red-500 text-red-300'
                                  }`}
                              >
                                {doc.valid ? '✓ Valid / In Bucket' : '✕ Not Valid / Excluded'}
                              </button>

                              <button
                                onClick={() => {
                                  updateBlock(bIdx, b => ({
                                    ...b,
                                    docs: (b.docs || []).filter((_, idx) => idx !== dIdx)
                                  }));
                                }}
                                className="p-1 text-slate-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>

                            <input
                              type="text"
                              value={doc.note}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const dCopy = [...(b.docs || [])];
                                  dCopy[dIdx] = { ...dCopy[dIdx], note: val };
                                  return { ...b, docs: dCopy };
                                });
                              }}
                              placeholder="Feedback note shown when learner classifies this item..."
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] text-slate-400 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newDoc: KYCSorterDoc = {
                              name: 'Aadhaar Card (Offline XML / Masked e-KYC)',
                              valid: true,
                              note: 'Officially Valid Document (OVD) accepted as valid proof of identity and address.'
                            };
                            updateBlock(bIdx, b => ({
                              ...b,
                              docs: [...(b.docs || []), newDoc]
                            }));
                          }}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Item to Classify</span>
                        </button>
                      </div>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* WORD BANK / FILL IN THE BLANKS BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'quiz_blanks' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-cyan-300 block mb-1">
                          Activity Title
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Word Bank Chips (Comma separated):
                        </label>
                        <input
                          type="text"
                          value={(block.wordBank || []).join(', ')}
                          onChange={(e) => {
                            const words = e.target.value.split(',').map(w => w.trim()).filter(Boolean);
                            updateBlock(bIdx, b => ({ ...b, wordBank: words }));
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Blank Sentences (Enter prompt and correct answer from word bank):
                        </label>
                        {(block.blankItems || []).map((item, itIdx) => (
                          <div key={itIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950">
                            <input
                              type="text"
                              value={item.prompt}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const copy = [...(b.blankItems || [])];
                                  copy[itIdx] = { ...copy[itIdx], prompt: val };
                                  return { ...b, blankItems: copy };
                                });
                              }}
                              placeholder="Sentence with blank (e.g. A _____ is needed...)"
                              className="sm:col-span-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={item.answer}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.blankItems || [])];
                                    copy[itIdx] = { ...copy[itIdx], answer: val };
                                    return { ...b, blankItems: copy };
                                  });
                                }}
                                placeholder="Correct Word"
                                className="flex-1 rounded-lg border border-cyan-800/80 bg-slate-900 px-3 py-1.5 text-xs text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  updateBlock(bIdx, b => ({
                                    ...b,
                                    blankItems: (b.blankItems || []).filter((_, idx) => idx !== itIdx)
                                  }));
                                }}
                                className="p-1 text-slate-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newBlank: BlanksItem = {
                              prompt: 'The account holder must maintain the required ________________ balance.',
                              answer: 'Average Monthly Balance'
                            };
                            updateBlock(bIdx, b => ({
                              ...b,
                              blankItems: [...(b.blankItems || []), newBlank]
                            }));
                          }}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Blank Prompt</span>
                        </button>
                      </div>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* MATCH THE PAIRS BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'quiz_match' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-amber-300 block mb-1">
                          Activity Title
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Matching Pairs (Left Item &rarr; Target Right Answer):
                        </label>
                        {(block.pairs || []).map((pair, pIdx) => (
                          <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950">
                            <input
                              type="text"
                              value={pair.left}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const copy = [...(b.pairs || [])];
                                  copy[pIdx] = { ...copy[pIdx], left: val };
                                  return { ...b, pairs: copy };
                                });
                              }}
                              placeholder="Left statement / customer need..."
                              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={pair.answer}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.pairs || [])];
                                    copy[pIdx] = { ...copy[pIdx], answer: val };
                                    return { ...b, pairs: copy };
                                  });
                                }}
                                placeholder="Target matching product / solution..."
                                className="flex-1 rounded-lg border border-amber-800/80 bg-slate-900 px-3 py-1.5 text-xs text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  updateBlock(bIdx, b => ({
                                    ...b,
                                    pairs: (b.pairs || []).filter((_, idx) => idx !== pIdx)
                                  }));
                                }}
                                className="p-1 text-slate-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newPair: MatchPairItem = {
                              left: 'Senior citizen looking for higher FD return',
                              answer: 'Senior Citizen Savings Account'
                            };
                            updateBlock(bIdx, b => ({
                              ...b,
                              pairs: [...(b.pairs || []), newPair]
                            }));
                          }}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Matching Pair</span>
                        </button>
                      </div>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* VIDEO EMBED SLOT BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'video_placeholder' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-rose-300 block mb-1">
                            Video Title
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:border-rose-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Badge / Duration
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={block.badge || 'ROLEPLAY VIDEO'}
                              onChange={(e) => updateBlock(bIdx, b => ({ ...b, badge: e.target.value }))}
                              className="w-1/2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={block.duration || '3m 15s'}
                              onChange={(e) => updateBlock(bIdx, b => ({ ...b, duration: e.target.value }))}
                              className="w-1/2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-400">
                            Video File Path or Embed Link
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateBlock(bIdx, b => ({ ...b, embedUrl: 'media/media1.mp4' }))}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono"
                            >
                              media1.mp4
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBlock(bIdx, b => ({ ...b, embedUrl: 'media/media2.mp4' }))}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono"
                            >
                              media2.mp4
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={block.embedUrl || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, embedUrl: e.target.value }))}
                          placeholder="e.g. media/media1.mp4 or YouTube embed URL"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-rose-300 focus:border-rose-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          &quot;What to Watch For in This Video&quot; Checklist:
                        </label>
                        {(block.watchFor || []).map((wf, wfIdx) => (
                          <div key={wfIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={wf}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const copy = [...(b.watchFor || [])];
                                  copy[wfIdx] = val;
                                  return { ...b, watchFor: copy };
                                });
                              }}
                              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                            />
                            <button
                              onClick={() => {
                                updateBlock(bIdx, b => ({
                                  ...b,
                                  watchFor: (b.watchFor || []).filter((_, idx) => idx !== wfIdx)
                                }));
                              }}
                              className="p-1 text-slate-500 hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            updateBlock(bIdx, b => ({
                              ...b,
                              watchFor: [...(b.watchFor || []), 'New key technique to observe in the roleplay']
                            }));
                          }}
                          className="text-[11px] font-semibold text-rose-400 hover:underline pt-1"
                        >
                          + Add Criterion
                        </button>
                      </div>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* STANDARD CARD / CONTENT SECTION BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'card' && (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Card Tag / Badge
                          </label>
                          <input
                            type="text"
                            value={block.tag || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, tag: e.target.value }))}
                            placeholder="e.g. Slide 2"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            value={block.heading || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, heading: e.target.value }))}
                            placeholder="Enter section title..."
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Body Text / Description (HTML enabled)
                        </label>
                        <textarea
                          rows={2}
                          value={block.body || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, body: e.target.value }))}
                          placeholder="<p>Detailed explanation...</p>"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200"
                        />
                      </div>

                      {/* Bullets List */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Bullet Points:
                        </label>
                        {(block.bullets || []).map((bullet, buIdx) => (
                          <div key={buIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const copy = [...(b.bullets || [])];
                                  copy[buIdx] = val;
                                  return { ...b, bullets: copy };
                                });
                              }}
                              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                            />
                            <button
                              onClick={() => {
                                updateBlock(bIdx, b => ({
                                  ...b,
                                  bullets: (b.bullets || []).filter((_, idx) => idx !== buIdx)
                                }));
                              }}
                              className="p-1 text-slate-500 hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            updateBlock(bIdx, b => ({
                              ...b,
                              bullets: [...(b.bullets || []), 'New guideline or requirement']
                            }));
                          }}
                          className="text-[11px] font-semibold text-blue-400 hover:underline pt-1"
                        >
                          + Add Bullet Point
                        </button>
                      </div>

                      {/* Section Image / Visual Uploader */}
                      <SectionImageControl
                        imageSrc={block.imageSrc || block.src || block.imageUrl}
                        alt={block.alt}
                        caption={block.caption}
                        onUpdateImage={(upd) => updateBlock(bIdx, b => ({ ...b, ...upd }))}
                        onUploadFile={(file) => handleUploadImageForBlock(bIdx, file)}
                        isUploading={uploadingImageBlockIdx === bIdx}
                        title="Section Visual / Placed Image"
                      />

                      {/* Callout / Facilitator Tip */}
                      <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-400">
                            Facilitator Insight / Callout Box
                          </label>
                          <select
                            value={block.callout?.type || 'tip'}
                            onChange={(e) => {
                              const cType = e.target.value as any;
                              updateBlock(bIdx, b => ({
                                ...b,
                                callout: { type: cType, text: b.callout?.text || '' }
                              }));
                            }}
                            className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 font-bold"
                          >
                            <option value="tip">Tip (Green/Amber)</option>
                            <option value="info">Info (Blue)</option>
                            <option value="warning">Warning (Red)</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          value={block.callout?.text || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateBlock(bIdx, b => ({
                              ...b,
                              callout: { type: b.callout?.type || 'tip', text: val }
                            }));
                          }}
                          placeholder="Facilitator notes, background context, or critical alert..."
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* URL REDIRECT / WEB LINK BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'url_redirect' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Card Badge / Tag
                          </label>
                          <input
                            type="text"
                            value={block.tag || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, tag: e.target.value }))}
                            placeholder="e.g. Web Link or External Resource"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            value={block.heading || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, heading: e.target.value }))}
                            placeholder="e.g. Visit External Resource"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <ExternalLink className="h-4 w-4" />
                            Target Destination URL (Where user will be redirected)
                          </label>
                          <input
                            type="url"
                            className="w-full rounded-lg bg-slate-950 border border-emerald-500/50 px-3.5 py-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-400 focus:outline-none shadow-inner"
                            value={block.url || ''}
                            placeholder="https://example.com or https://your-portal.com"
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, url: e.target.value }))}
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            When learners click anywhere on this slide, they will be redirected directly to this URL.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                            Text Displayed on Slide for the URL
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                            value={block.urlText || ''}
                            placeholder="e.g. Click here to open HDFC NetBanking & Account Opening Portal"
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, urlText: e.target.value }))}
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            This text is displayed prominently as the main clickable link on the slide.
                          </p>
                        </div>
                      </div>

                      {/* Live In-Editor Preview */}
                      <div className="rounded-xl border border-emerald-500/20 bg-slate-950/80 p-5 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            Live Slide Interactive Preview
                          </span>
                          {block.url && block.url !== 'https://' && (
                            <a
                              href={block.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
                            >
                              <span>Test Link Now</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-950/10 p-6 flex flex-col items-center justify-center">
                          <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 shadow-md">
                            <ExternalLink className="h-7 w-7" />
                          </div>
                          <div className="text-base font-bold text-emerald-300 underline underline-offset-4 mb-2 max-w-md">
                            {block.urlText || 'Click here to visit URL'}
                          </div>
                          <div className="text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 max-w-sm truncate mb-3">
                            {block.url || 'https://example.com'}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-sm">
                            <span>Open Link</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-3">
                            Tap anywhere on this card to be redirected in a new window.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* REFLECT & THINK BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'think' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-yellow-300 block mb-1">
                          Reflection Headline
                        </label>
                        <input
                          type="text"
                          value={block.title || 'Reflect & Think'}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Reflection Question / Thought Prompt
                        </label>
                        <textarea
                          rows={2}
                          value={block.prompt || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, prompt: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Revealable Mentor Key Takeaway
                        </label>
                        <textarea
                          rows={2}
                          value={block.hint || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, hint: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* ACCORDION GROUP BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'accordion' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-blue-300 block mb-1">
                          Accordion Group Heading
                        </label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, heading: e.target.value }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white font-bold"
                        />
                      </div>

                      {/* Section Image Uploader for Accordion */}
                      <SectionImageControl
                        imageSrc={block.imageSrc || block.src || block.imageUrl}
                        alt={block.alt}
                        caption={block.caption}
                        onUpdateImage={(upd) => updateBlock(bIdx, b => ({ ...b, ...upd }))}
                        onUploadFile={(file) => handleUploadImageForBlock(bIdx, file)}
                        isUploading={uploadingImageBlockIdx === bIdx}
                        title="Section Visual / Placed Image"
                      />

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Collapsible Items:
                        </label>
                        {(block.items || []).map((item, itIdx) => (
                          <div key={itIdx} className="p-3 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.items || [])];
                                    copy[itIdx] = { ...copy[itIdx], title: val };
                                    return { ...b, items: copy };
                                  });
                                }}
                                placeholder="Accordion title / header"
                                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                              />
                              <button
                                onClick={() => {
                                  updateBlock(bIdx, b => ({
                                    ...b,
                                    items: (b.items || []).filter((_, idx) => idx !== itIdx)
                                  }));
                                }}
                                className="p-1 text-slate-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={item.content}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateBlock(bIdx, b => {
                                  const copy = [...(b.items || [])];
                                  copy[itIdx] = { ...copy[itIdx], content: val };
                                  return { ...b, items: copy };
                                });
                              }}
                              placeholder="Accordion expanded body content (HTML or bullets)..."
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300"
                            />
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newItem: AccordionItem = {
                              title: 'New Topic / Privilege',
                              content: '<ul class="rich-list"><li>Key benefit or condition</li></ul>'
                            };
                            updateBlock(bIdx, b => ({
                              ...b,
                              items: [...(b.items || []), newItem]
                            }));
                          }}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Accordion Item</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* FLIP THE CARDS BLOCK EDITOR (FLASHCARDS) */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'flashcards' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Card Tag / Badge
                          </label>
                          <input
                            type="text"
                            value={block.tag || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, tag: e.target.value }))}
                            placeholder="e.g. Flip Drill"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-indigo-300 block mb-1">
                            Flip Cards Section Title
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, title: e.target.value }))}
                            placeholder="e.g. Interactive Flip Cards: Concept Mastery"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Learner Instruction
                        </label>
                        <input
                          type="text"
                          value={block.instruction || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, instruction: e.target.value }))}
                          placeholder="Tap any card below to flip and reveal the key knowledge takeaway:"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>

                      {/* Section Image Uploader for Flip Cards */}
                      <SectionImageControl
                        imageSrc={block.imageSrc || block.src || block.imageUrl}
                        alt={block.alt}
                        caption={block.caption}
                        onUpdateImage={(upd) => updateBlock(bIdx, b => ({ ...b, ...upd }))}
                        onUploadFile={(file) => handleUploadImageForBlock(bIdx, file)}
                        isUploading={uploadingImageBlockIdx === bIdx}
                        title="Section Visual / Placed Image"
                      />

                      {/* Flip Cards List */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <RotateCw className="h-3.5 w-3.5" />
                            Flip Cards ({(block.cards || []).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newCard: FlashcardItemEntry = {
                                q: 'New Concept or Question to Recall',
                                a: 'Key definition, guideline, or takeaway revealed on flip.'
                              };
                              updateBlock(bIdx, b => ({
                                ...b,
                                cards: [...(b.cards || []), newCard]
                              }));
                            }}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Flip Card</span>
                          </button>
                        </div>

                        {(block.cards || []).map((card, cIdx) => (
                          <div key={cIdx} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                                Card #{cIdx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.cards || [])];
                                      const cloned = JSON.parse(JSON.stringify(copy[cIdx]));
                                      copy.splice(cIdx + 1, 0, cloned);
                                      return { ...b, cards: copy };
                                    });
                                  }}
                                  title="Duplicate Card"
                                  className="p-1 text-slate-400 hover:text-white"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBlock(bIdx, b => ({
                                      ...b,
                                      cards: (b.cards || []).filter((_, idx) => idx !== cIdx)
                                    }));
                                  }}
                                  title="Delete Card"
                                  className="p-1 text-slate-500 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Front Side */}
                              <div className="space-y-1.5 rounded-lg border border-blue-500/30 bg-blue-950/20 p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                    Card Front (Question / Prompt)
                                  </span>
                                  <span className="text-[10px] text-blue-300/80">Visible Initially</span>
                                </div>
                                <textarea
                                  rows={2}
                                  value={card.q}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.cards || [])];
                                      copy[cIdx] = { ...copy[cIdx], q: val };
                                      return { ...b, cards: copy };
                                    });
                                  }}
                                  placeholder="Enter prompt, question, or term to remember..."
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                                />
                              </div>

                              {/* Back Side */}
                              <div className="space-y-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    Card Back (Answer / Solution)
                                  </span>
                                  <span className="text-[10px] text-emerald-300/80">Revealed on Flip</span>
                                </div>
                                <textarea
                                  rows={2}
                                  value={card.a}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.cards || [])];
                                      copy[cIdx] = { ...copy[cIdx], a: val };
                                      return { ...b, cards: copy };
                                    });
                                  }}
                                  placeholder="Enter answer, explanation, or key takeaway..."
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive In-Editor 3D Flip Card Test Preview */}
                      {(block.cards || []).length > 0 && (
                        <div className="mt-4 rounded-xl border border-indigo-500/30 bg-slate-950/90 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              Live In-Editor Flip Test (Tap any card to test flip!)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Interactive Preview
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(block.cards || []).map((card, cIdx) => {
                              const cardKey = `${bIdx}_${cIdx}`;
                              const isFlipped = Boolean(flippedPreviewCards[cardKey]);
                              return (
                                <div
                                  key={cIdx}
                                  onClick={() => setFlippedPreviewCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }))}
                                  className="cursor-pointer h-40 select-none group perspective"
                                  title="Click to flip"
                                >
                                  <div className={`relative w-full h-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] shadow-md ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                                    {/* Front Side */}
                                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl p-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/40 text-white flex flex-col justify-between">
                                      <div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                            Tap to Flip 🔄
                                          </span>
                                          <span className="text-[10px] text-blue-300 font-semibold">Front</span>
                                        </div>
                                        <p className="mt-2 text-xs font-bold leading-snug line-clamp-3">
                                          {card.q || 'Untitled Question'}
                                        </p>
                                      </div>
                                      <div className="text-[10px] text-blue-300/80 flex items-center gap-1">
                                        <span>💡 Click to flip answer</span>
                                      </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl p-4 bg-white text-slate-900 border-2 border-indigo-600 flex flex-col justify-between shadow-lg overflow-y-auto">
                                      <div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                            Takeaway ✓
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-semibold">Back</span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-800 leading-relaxed font-medium">
                                          {card.a || 'No answer provided'}
                                        </p>
                                      </div>
                                      <div className="text-[10px] text-slate-500 text-right mt-1">
                                        Click again to flip back
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* BOXES GRID BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'boxes' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Card Tag / Badge
                          </label>
                          <input
                            type="text"
                            value={block.tag || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, tag: e.target.value }))}
                            placeholder="e.g. Highlights"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-sky-300 block mb-1">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            value={block.heading || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, heading: e.target.value }))}
                            placeholder="e.g. Core Features & Key Value Propositions"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:border-sky-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Body Description (HTML enabled)
                        </label>
                        <textarea
                          rows={2}
                          value={block.body || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, body: e.target.value }))}
                          placeholder="Introductory text before boxes..."
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>

                      {/* Section Image Uploader for Boxes */}
                      <SectionImageControl
                        imageSrc={block.imageSrc || block.src || block.imageUrl}
                        alt={block.alt}
                        caption={block.caption}
                        onUpdateImage={(upd) => updateBlock(bIdx, b => ({ ...b, ...upd }))}
                        onUploadFile={(file) => handleUploadImageForBlock(bIdx, file)}
                        isUploading={uploadingImageBlockIdx === bIdx}
                        title="Section Visual / Placed Image"
                      />

                      {/* Boxes List */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Boxes ({(block.boxes || []).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newBox: BoxItem = {
                                title: 'New Feature or Value Pillar',
                                badge: 'FEATURE',
                                badgeColor: 'blue',
                                desc: 'Clear, concise description of this feature or product benefit.',
                                bullets: [
                                  'Primary attribute or requirement',
                                  'Key advantage or operational guideline'
                                ],
                                highlight: false
                              };
                              updateBlock(bIdx, b => ({
                                ...b,
                                boxes: [...(b.boxes || []), newBox]
                              }));
                            }}
                            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-lg"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Box</span>
                          </button>
                        </div>

                        {(block.boxes || []).map((box, bxIdx) => (
                          <div key={bxIdx} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <span className="text-[11px] font-bold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-md">
                                Box #{bxIdx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.boxes || [])];
                                      const cloned = JSON.parse(JSON.stringify(copy[bxIdx]));
                                      copy.splice(bxIdx + 1, 0, cloned);
                                      return { ...b, boxes: copy };
                                    });
                                  }}
                                  title="Duplicate Box"
                                  className="p-1 text-slate-400 hover:text-white"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBlock(bIdx, b => ({
                                      ...b,
                                      boxes: (b.boxes || []).filter((_, idx) => idx !== bxIdx)
                                    }));
                                  }}
                                  title="Delete Box"
                                  className="p-1 text-slate-500 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                                  Box Title
                                </label>
                                <input
                                  type="text"
                                  value={box.title || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.boxes || [])];
                                      copy[bxIdx] = { ...copy[bxIdx], title: val };
                                      return { ...b, boxes: copy };
                                    });
                                  }}
                                  placeholder="e.g. High Daily Limits"
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:border-sky-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                                  Badge Text
                                </label>
                                <input
                                  type="text"
                                  value={box.badge || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.boxes || [])];
                                      copy[bxIdx] = { ...copy[bxIdx], badge: val };
                                      return { ...b, boxes: copy };
                                    });
                                  }}
                                  placeholder="e.g. MODULE 1 or POPULAR"
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Style Variant:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.boxes || [])];
                                    copy[bxIdx] = { ...copy[bxIdx], highlight: false, gold: false, green: false };
                                    return { ...b, boxes: copy };
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${!box.highlight && !box.gold && !box.green
                                  ? 'bg-slate-700 text-white border-slate-500'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                  }`}
                              >
                                Standard
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.boxes || [])];
                                    copy[bxIdx] = { ...copy[bxIdx], highlight: !copy[bxIdx].highlight, gold: false, green: false };
                                    return { ...b, boxes: copy };
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${box.highlight
                                  ? 'bg-blue-600 text-white border-blue-400'
                                  : 'bg-blue-950/40 text-blue-300 border-blue-900/60 hover:border-blue-700'
                                  }`}
                              >
                                Highlight Blue
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.boxes || [])];
                                    copy[bxIdx] = { ...copy[bxIdx], gold: !copy[bxIdx].gold, highlight: false, green: false };
                                    return { ...b, boxes: copy };
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${box.gold
                                  ? 'bg-amber-600 text-white border-amber-400'
                                  : 'bg-amber-950/40 text-amber-300 border-amber-900/60 hover:border-amber-700'
                                  }`}
                              >
                                Gold Accent
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.boxes || [])];
                                    copy[bxIdx] = { ...copy[bxIdx], green: !copy[bxIdx].green, highlight: false, gold: false };
                                    return { ...b, boxes: copy };
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${box.green
                                  ? 'bg-emerald-600 text-white border-emerald-400'
                                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60 hover:border-emerald-700'
                                  }`}
                              >
                                Green Accent
                              </button>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                                Description / Body
                              </label>
                              <textarea
                                rows={2}
                                value={box.desc || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.boxes || [])];
                                    copy[bxIdx] = { ...copy[bxIdx], desc: val };
                                    return { ...b, boxes: copy };
                                  });
                                }}
                                placeholder="Summary of this pillar or feature..."
                                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
                              />
                            </div>

                            {/* Bullets List */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                                Box Bullet Points:
                              </label>
                              {(box.bullets || []).map((bullet, buIdx) => (
                                <div key={buIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateBlock(bIdx, b => {
                                        const copy = [...(b.boxes || [])];
                                        const bCopy = [...(copy[bxIdx].bullets || [])];
                                        bCopy[buIdx] = val;
                                        copy[bxIdx] = { ...copy[bxIdx], bullets: bCopy };
                                        return { ...b, boxes: copy };
                                      });
                                    }}
                                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateBlock(bIdx, b => {
                                        const copy = [...(b.boxes || [])];
                                        copy[bxIdx] = {
                                          ...copy[bxIdx],
                                          bullets: (copy[bxIdx].bullets || []).filter((_, idx) => idx !== buIdx)
                                        };
                                        return { ...b, boxes: copy };
                                      });
                                    }}
                                    className="p-1 text-slate-500 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.boxes || [])];
                                    copy[bxIdx] = {
                                      ...copy[bxIdx],
                                      bullets: [...(copy[bxIdx].bullets || []), 'New guideline or benefit']
                                    };
                                    return { ...b, boxes: copy };
                                  });
                                }}
                                className="text-[11px] font-semibold text-sky-400 hover:underline pt-0.5"
                              >
                                + Add Bullet Point
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Live Boxes Preview in Course Architecture */}
                      {(block.boxes || []).length > 0 && (
                        <div className="mt-4 rounded-xl border border-sky-500/30 bg-slate-950/90 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              Live In-Editor Boxes Preview
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Rendered Layout
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(block.boxes || []).map((box, bxIdx) => (
                              <div
                                key={bxIdx}
                                className={`rounded-xl border p-4 bg-slate-900/90 transition-all ${box.highlight
                                  ? 'border-blue-500 shadow-md shadow-blue-500/10'
                                  : box.gold
                                    ? 'border-amber-500/80 shadow-md shadow-amber-500/10'
                                    : box.green
                                      ? 'border-emerald-500/80 shadow-md shadow-emerald-500/10'
                                      : 'border-slate-800'
                                  }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="text-xs font-bold text-white leading-snug">
                                    {box.title || 'Untitled Box'}
                                  </h4>
                                  {box.badge && (
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${box.gold
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : box.green
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      }`}>
                                      {box.badge}
                                    </span>
                                  )}
                                </div>
                                {box.desc && (
                                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{box.desc}</p>
                                )}
                                {box.bullets && box.bullets.length > 0 && (
                                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                                    {box.bullets.map((b, bi) => (
                                      <li key={bi}>{b}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* DROP DOWNS (COLLAPSIBLE BOXES) BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'collapsible_boxes' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Card Tag / Badge
                          </label>
                          <input
                            type="text"
                            value={block.tag || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, tag: e.target.value }))}
                            placeholder="e.g. FAQ or Drill-Down"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-teal-300 block mb-1">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            value={block.heading || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, heading: e.target.value }))}
                            placeholder="e.g. Key Questions & Step-by-Step Drop Downs"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">
                          Body Description (HTML enabled)
                        </label>
                        <textarea
                          rows={2}
                          value={block.body || ''}
                          onChange={(e) => updateBlock(bIdx, b => ({ ...b, body: e.target.value }))}
                          placeholder="Introductory text before drop downs..."
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>

                      {/* Section Image Uploader for Drop Downs */}
                      <SectionImageControl
                        imageSrc={block.imageSrc || block.src || block.imageUrl}
                        alt={block.alt}
                        caption={block.caption}
                        onUpdateImage={(upd) => updateBlock(bIdx, b => ({ ...b, ...upd }))}
                        onUploadFile={(file) => handleUploadImageForBlock(bIdx, file)}
                        isUploading={uploadingImageBlockIdx === bIdx}
                        title="Section Visual / Placed Image"
                      />

                      {/* Drop Down Items List */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                            <ChevronDown className="h-3.5 w-3.5" />
                            Drop Down Items ({(block.collapsibles || []).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newItem: CollapsibleItem = {
                                title: 'New Drop Down Question or Step',
                                badge: 'STEP',
                                badgeColor: 'teal',
                                content: '<p>Detailed description revealed when user taps to open this drop down.</p>',
                                bullets: [
                                  'First requirement or condition',
                                  'Second operational step'
                                ],
                                isOpen: false
                              };
                              updateBlock(bIdx, b => ({
                                ...b,
                                collapsibles: [...(b.collapsibles || []), newItem]
                              }));
                            }}
                            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-lg"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Drop Down Item</span>
                          </button>
                        </div>

                        {(block.collapsibles || []).map((item, itIdx) => (
                          <div key={itIdx} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <span className="text-[11px] font-bold text-teal-400 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-md">
                                Drop Down #{itIdx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.collapsibles || [])];
                                      const cloned = JSON.parse(JSON.stringify(copy[itIdx]));
                                      copy.splice(itIdx + 1, 0, cloned);
                                      return { ...b, collapsibles: copy };
                                    });
                                  }}
                                  title="Duplicate Drop Down"
                                  className="p-1 text-slate-400 hover:text-white"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBlock(bIdx, b => ({
                                      ...b,
                                      collapsibles: (b.collapsibles || []).filter((_, idx) => idx !== itIdx)
                                    }));
                                  }}
                                  title="Delete Drop Down"
                                  className="p-1 text-slate-500 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                                  Drop Down Header / Question
                                </label>
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.collapsibles || [])];
                                      copy[itIdx] = { ...copy[itIdx], title: val };
                                      return { ...b, collapsibles: copy };
                                    });
                                  }}
                                  placeholder="e.g. 1. What documents are needed?"
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:border-teal-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                                  Badge / Tag (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.badge || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateBlock(bIdx, b => {
                                      const copy = [...(b.collapsibles || [])];
                                      copy[itIdx] = { ...copy[itIdx], badge: val };
                                      return { ...b, collapsibles: copy };
                                    });
                                  }}
                                  placeholder="e.g. STEP 1 or FAQ"
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                                Expanded Body Content (HTML enabled)
                              </label>
                              <textarea
                                rows={2}
                                value={item.content || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.collapsibles || [])];
                                    copy[itIdx] = { ...copy[itIdx], content: val };
                                    return { ...b, collapsibles: copy };
                                  });
                                }}
                                placeholder="Detailed explanation revealed when opened..."
                                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
                              />
                            </div>

                            {/* Bullets List */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                                Bullet Points inside Drop Down:
                              </label>
                              {(item.bullets || []).map((bullet, buIdx) => (
                                <div key={buIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateBlock(bIdx, b => {
                                        const copy = [...(b.collapsibles || [])];
                                        const bCopy = [...(copy[itIdx].bullets || [])];
                                        bCopy[buIdx] = val;
                                        copy[itIdx] = { ...copy[itIdx], bullets: bCopy };
                                        return { ...b, collapsibles: copy };
                                      });
                                    }}
                                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateBlock(bIdx, b => {
                                        const copy = [...(b.collapsibles || [])];
                                        copy[itIdx] = {
                                          ...copy[itIdx],
                                          bullets: (copy[itIdx].bullets || []).filter((_, idx) => idx !== buIdx)
                                        };
                                        return { ...b, collapsibles: copy };
                                      });
                                    }}
                                    className="p-1 text-slate-500 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  updateBlock(bIdx, b => {
                                    const copy = [...(b.collapsibles || [])];
                                    copy[itIdx] = {
                                      ...copy[itIdx],
                                      bullets: [...(copy[itIdx].bullets || []), 'New condition or guideline']
                                    };
                                    return { ...b, collapsibles: copy };
                                  });
                                }}
                                className="text-[11px] font-semibold text-teal-400 hover:underline pt-0.5"
                              >
                                + Add Bullet Point
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Live Drop Downs Preview in Course Architecture */}
                      {(block.collapsibles || []).length > 0 && (
                        <div className="mt-4 rounded-xl border border-teal-500/30 bg-slate-950/90 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              Live In-Editor Drop Downs Preview (Tap to toggle expand/collapse!)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Interactive Test
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(block.collapsibles || []).map((item, itIdx) => {
                              const collKey = `${bIdx}_${itIdx}`;
                              const isOpen = Boolean(openPreviewCollapsibles[collKey]);
                              return (
                                <div
                                  key={itIdx}
                                  className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden transition-all shadow-sm"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setOpenPreviewCollapsibles(prev => ({ ...prev, [collKey]: !prev[collKey] }))}
                                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-800/60 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {item.badge && (
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                                          {item.badge}
                                        </span>
                                      )}
                                      <span className="text-xs font-bold text-white">
                                        {item.title || 'Untitled Drop Down'}
                                      </span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-teal-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isOpen && (
                                    <div className="p-3.5 pt-0 border-t border-slate-800/80 bg-slate-950/50 space-y-2 text-xs text-slate-300">
                                      {item.content && (
                                        <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                      )}
                                      {item.bullets && item.bullets.length > 0 && (
                                        <ul className="space-y-1 list-disc list-inside text-slate-300">
                                          {item.bullets.map((b, bi) => (
                                            <li key={bi}>{b}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* DEDICATED VISUAL IMAGE SECTION BLOCK EDITOR */}
                  {/* ------------------------------------------------------------- */}
                  {block.type === 'image' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">
                            Card Tag / Badge
                          </label>
                          <input
                            type="text"
                            value={block.tag || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, tag: e.target.value }))}
                            placeholder="e.g. Visual Diagram"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-pink-300 block mb-1">
                            Visual Section Title / Heading
                          </label>
                          <input
                            type="text"
                            value={block.heading || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, heading: e.target.value }))}
                            placeholder="e.g. Architecture Flowchart & Operational Lifecycle"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:border-pink-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Section Image Uploader */}
                      <SectionImageControl
                        imageSrc={block.src || block.imageSrc || block.imageUrl}
                        alt={block.alt}
                        caption={block.caption}
                        onUpdateImage={(upd) => updateBlock(bIdx, b => ({ ...b, ...upd }))}
                        onUploadFile={(file) => handleUploadImageForBlock(bIdx, file)}
                        isUploading={uploadingImageBlockIdx === bIdx}
                        title="Primary Section Image / Diagram"
                      />
                    </div>
                  )}


                  {/* ------------------------------------------------------------- */}
                  {/* DEDICATED CARD AUDIO EMBEDDING & VOICEOVER CONTROL */}
                  {/* ------------------------------------------------------------- */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className={`rounded-xl border p-3.5 transition-all ${block.audioUrl
                      ? 'border-blue-500/40 bg-gradient-to-r from-blue-950/60 to-slate-900/80 shadow-md shadow-blue-950/20'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                      }`}>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md ${block.audioUrl ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                            <Volume2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-200">
                            Card Audio Narration / Voiceover
                          </span>
                          {block.audioUrl ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Voiceover Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              Embed an audio file for this card
                            </span>
                          )}
                        </div>

                        {block.audioUrl && (
                          <button
                            onClick={() => updateBlock(bIdx, b => ({ ...b, audioUrl: undefined, audioTitle: undefined }))}
                            className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors"
                            title="Remove audio voiceover from this card"
                          >
                            ✕ Remove Audio
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-5">
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">
                            Audio Label (Header in player)
                          </label>
                          <input
                            type="text"
                            value={block.audioTitle || ''}
                            onChange={(e) => updateBlock(bIdx, b => ({ ...b, audioTitle: e.target.value }))}
                            placeholder={block.heading ? `Listen: ${block.heading.slice(0, 30)}` : 'e.g. Listen: Card Narration'}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-7">
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">
                            Audio File / Path / URL
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={block.audioUrl || ''}
                              onChange={(e) => updateBlock(bIdx, b => ({ ...b, audioUrl: e.target.value }))}
                              placeholder="media/audio1.mp3 or https://..."
                              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${uploadingAudioBlockIdx === bIdx
                              ? 'bg-blue-600/50 text-white cursor-wait animate-pulse'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                              }`}>
                              <Upload className="h-3 w-3" />
                              <span>{uploadingAudioBlockIdx === bIdx ? 'Uploading...' : 'Upload MP3'}</span>
                              <input
                                type="file"
                                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                                className="hidden"
                                disabled={uploadingAudioBlockIdx === bIdx}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadAudioForBlock(bIdx, file);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Live in-editor audio player preview */}
                      {block.audioUrl && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300/80 shrink-0 flex items-center gap-1">
                            <Headphones className="h-3 w-3" /> In-Editor Audio Preview:
                          </span>
                          <audio
                            controls
                            className="w-full h-8 rounded max-w-lg"
                            src={block.audioUrl.startsWith('http') || block.audioUrl.startsWith('/') ? block.audioUrl : `/${block.audioUrl}`}
                          >
                            Your browser does not support audio playback.
                          </audio>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Instructor / Facilitator Notes Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Instructor / Facilitator Speaking Guidance
              </h4>
            </div>
            <textarea
              rows={3}
              value={activeChapter.notes || ''}
              onChange={(e) => updateActiveChapter(c => ({ ...c, notes: e.target.value }))}
              placeholder="Private speaker notes: facilitation cues, questions to ask the branch team, or transition statements..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
