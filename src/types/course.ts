export type SlideLayout = 
  | 'title' 
  | 'content' 
  | 'bullets' 
  | 'two-column' 
  | 'quote' 
  | 'interactive-quiz' 
  | 'interactive-dragdrop' 
  | 'interactive-flashcard'
  | 'summary';

export interface PositionedElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'table';
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  zIndex?: number;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: number;
  text?: string;
  paragraphs?: {
    text: string;
    level: number;
    isBold: boolean;
    isItalic?: boolean;
    fontSize?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  imageUrl?: string;
  tableData?: string[][];
  isTitle?: boolean;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface MCQQuestion {
  id: string;
  prompt: string;
  options: MCQOption[];
  explanation: string;
  allowMultiple?: boolean;
  points?: number;
}

export interface DragDropPair {
  id: string;
  sourceText: string;
  targetCategory: string;
}

export interface DragDropActivity {
  id: string;
  title: string;
  instruction: string;
  pairs: DragDropPair[];
  categories: string[];
  explanation?: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  badge?: string;
}

export interface SlideContentBlock {
  id: string;
  type: 'heading' | 'subheading' | 'paragraph' | 'bullet-list' | 'image' | 'callout' | 'table';
  text?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  calloutType?: 'info' | 'warning' | 'success' | 'tip';
  tableData?: string[][];
}

export interface CourseSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  layout: SlideLayout;
  blocks: SlideContentBlock[];
  positionedElements?: PositionedElement[];
  notes?: string;
  bgColor?: string;
  bgImageUrl?: string;
  quiz?: MCQQuestion;
  dragDrop?: DragDropActivity;
  flashcards?: FlashcardItem[];
  keyTakeaways?: string[];
}

export interface CourseTheme {
  id: string;
  name: string;
  primaryColor: string;
  primaryLight: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  textMuted: string;
  fontFamily: string;
}

export interface SCORMSettings {
  version: '2004 4th Edition' | '2004 3rd Edition';
  identifier: string;
  title: string;
  description: string;
  passingScore: number;
  masteryScore: number;
  allowRetake: boolean;
  requireQuizPass: boolean;
  author: string;
}

export interface CourseData {
  title: string;
  subtitle: string;
  description?: string;
  author?: string;
  slides: CourseSlide[];
  theme: CourseTheme;
  scormSettings: SCORMSettings;
  slideWidth?: number;
  slideHeight?: number;
}

export type ViewportMode = 'mobile' | 'desktop';

// =========================================================================
// Rich Micro-Learning Architecture Types (Direct 1:1 with SCORM 2004 Engine)
// =========================================================================

export interface MCQQuestionItem {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface KYCSorterDoc {
  name: string;
  valid: boolean;
  note: string;
}

export interface BlanksItem {
  prompt: string;
  answer: string;
}

export interface MatchPairItem {
  left: string;
  answer: string;
}

export interface AccordionItem {
  title: string;
  content: string;
}

export interface FlashcardItemEntry {
  q: string;
  a: string;
}

export interface ChapterBlock {
  id?: string;
  type: 
    | 'card' 
    | 'think' 
    | 'accordion' 
    | 'video_placeholder' 
    | 'quiz_mcq' 
    | 'kyc_sorter' 
    | 'quiz_blanks' 
    | 'quiz_match' 
    | 'action_commitment' 
    | 'flashcards' 
    | 'image'
    | 'url_redirect';

  // Common card fields
  tag?: string;
  heading?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  listTone?: string;
  callout?: {
    type?: 'tip' | 'info' | 'warning' | 'alert';
    text?: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };

  // URL redirect / Link slide fields
  url?: string;
  urlText?: string;
  openInNewTab?: boolean;

  // think prompt fields
  prompt?: string;
  hint?: string;

  // accordion fields
  items?: AccordionItem[];

  // video placeholder fields
  badge?: string;
  duration?: string;
  embedUrl?: string;
  watchFor?: string[];

  // MCQ fields
  questions?: MCQQuestionItem[];

  // KYC sorter / Drag & Drop fields
  instruction?: string;
  docs?: KYCSorterDoc[];

  // Word Bank / Blanks fields
  wordBank?: string[];
  blankItems?: BlanksItem[];

  // Match fields
  options?: string[];
  pairs?: MatchPairItem[];

  // Flashcards
  cards?: FlashcardItemEntry[];

  // Audio narration / Voiceover fields
  audioUrl?: string;
  audioTitle?: string;

  // Image fields
  src?: string;
  alt?: string;
  caption?: string;
}

export interface CourseChapter {
  id: string;
  num: string;
  shortTitle: string;
  title: string;
  subtitle?: string;
  blocks: ChapterBlock[];
  notes?: string;
}

export interface RichCourseData {
  title: string;
  name?: string;
  subtitle?: string;
  chapters: CourseChapter[];
  assets?: string[];
}
