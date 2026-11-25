import { CourseSlide, DragDropActivity, MCQQuestion, FlashcardItem } from '../types/course';

export function createDefaultMCQ(slideTitle: string): MCQQuestion {
  return {
    id: `mcq-${Date.now()}`,
    prompt: `Based on "${slideTitle}", which of the following is the most effective approach?`,
    options: [
      {
        id: 'opt-1',
        text: 'Implement automated continuous monitoring and structured controls',
        isCorrect: true,
        feedback: 'Correct! Automation and structured controls provide consistent oversight and error reduction.'
      },
      {
        id: 'opt-2',
        text: 'Rely solely on manual ad-hoc audits once a year',
        isCorrect: false,
        feedback: 'Incorrect. Ad-hoc annual reviews leave long exposure windows for risks.'
      },
      {
        id: 'opt-3',
        text: 'Bypass governance checkpoints to prioritize rapid speed over compliance',
        isCorrect: false,
        feedback: 'Incorrect. Skipping checkpoints exposes the organization to compliance and operational failures.'
      },
      {
        id: 'opt-4',
        text: 'Restrict knowledge sharing and silo data within single departments',
        isCorrect: false,
        feedback: 'Incorrect. Siloed data hinders cross-functional collaboration and visibility.'
      }
    ],
    explanation: 'Effective implementation requires proactive, automated oversight with clear cross-functional alignment.',
    allowMultiple: false,
    points: 25
  };
}

export function createDefaultDragDrop(slideTitle: string): DragDropActivity {
  return {
    id: `dd-${Date.now()}`,
    title: `Knowledge Check: ${slideTitle}`,
    instruction: 'Drag each item on the left to its matching category or definition on the right:',
    categories: ['Core Strategy', 'Operational Best Practice', 'Risk Mitigation'],
    pairs: [
      {
        id: 'pair-1',
        sourceText: 'Continuous automated validation',
        targetCategory: 'Operational Best Practice'
      },
      {
        id: 'pair-2',
        sourceText: 'Multi-factor authentication & zero trust',
        targetCategory: 'Risk Mitigation'
      },
      {
        id: 'pair-3',
        sourceText: 'Customer-centric digital transformation',
        targetCategory: 'Core Strategy'
      },
      {
        id: 'pair-4',
        sourceText: 'Encryption of data in transit and at rest',
        targetCategory: 'Risk Mitigation'
      }
    ],
    explanation: 'Awesome job! Aligning strategic goals with operational and security safeguards ensures resilient success.'
  };
}

export function createDefaultFlashcards(slideTitle: string): FlashcardItem[] {
  return [
    {
      id: 'fc-1',
      badge: 'Concept 1',
      front: 'What is the primary objective of this module?',
      back: 'To establish an agile, resilient framework that maximizes learner retention and interactive engagement.'
    },
    {
      id: 'fc-2',
      badge: 'Concept 2',
      front: 'Why is mobile-first responsive re-imagining critical?',
      back: 'Modern learners access learning on mobile devices. Traditional 16:9 desktop slides cause unreadable text, letterboxing, and high drop-off rates.'
    },
    {
      id: 'fc-3',
      badge: 'Concept 3',
      front: 'How does SCORM 2004 track learner competence?',
      back: 'SCORM 2004 tracks granular interaction states (cmi.interactions), scaled scores, completion status, and session bookmarks.'
    }
  ];
}

/**
 * Auto-generate an interactive quiz from bullet points in a slide
 */
export function autoGenerateQuizFromSlide(slide: CourseSlide): MCQQuestion | null {
  const bulletBlock = slide.blocks.find(b => b.type === 'bullet-list' && b.items && b.items.length >= 2);
  if (!bulletBlock || !bulletBlock.items || bulletBlock.items.length < 2) {
    return createDefaultMCQ(slide.title);
  }

  const correctItem = bulletBlock.items[0];
  const distractor1 = bulletBlock.items[1] || 'Ignore best practices and proceed without verification';
  const distractor2 = bulletBlock.items[2] || 'Delay all actions until next quarterly review cycle';
  const distractor3 = 'Rely exclusively on outdated legacy mechanisms';

  return {
    id: `mcq-${Date.now()}`,
    prompt: `Regarding "${slide.title}", which of the following is highlighted as a critical pillar?`,
    options: [
      {
        id: 'opt-1',
        text: correctItem,
        isCorrect: true,
        feedback: `Spot on! "${correctItem}" is a primary focal point highlighted in this lesson.`
      },
      {
        id: 'opt-2',
        text: `Opposite approach: Avoiding ${correctItem.toLowerCase().slice(0, 30)}`,
        isCorrect: false,
        feedback: 'Incorrect. This contradicts the recommended guideline.'
      },
      {
        id: 'opt-3',
        text: distractor2.startsWith('Opposite') ? 'Unverified manual intervention' : `Deferring: ${distractor2.slice(0, 40)}`,
        isCorrect: false,
        feedback: 'Incorrect. Prompt execution is vital for standard compliance.'
      },
      {
        id: 'opt-4',
        text: distractor3,
        isCorrect: false,
        feedback: 'Incorrect. Modern systems deprecate outdated legacy workflows.'
      }
    ],
    explanation: `The key takeaway emphasizes that "${correctItem}" drives optimal operational outcomes.`,
    allowMultiple: false,
    points: 25
  };
}

/**
 * Auto-generate Drag & Drop matching from bullet points in a slide
 */
export function autoGenerateDragDropFromSlide(slide: CourseSlide): DragDropActivity | null {
  const bulletBlock = slide.blocks.find(b => b.type === 'bullet-list' && b.items && b.items.length >= 3);
  const items = bulletBlock?.items || [
    'Zero Trust Architecture',
    'Real-time Threat Monitoring',
    'Role-based Access Control',
    'Automated Incident Response'
  ];

  const categories = ['Prevention & Identity', 'Monitoring & Response'];
  const pairs = items.slice(0, 4).map((item, idx) => ({
    id: `pair-${idx + 1}`,
    sourceText: item,
    targetCategory: idx % 2 === 0 ? categories[0] : categories[1]
  }));

  return {
    id: `dd-${Date.now()}`,
    title: `Matching Challenge: ${slide.title}`,
    instruction: 'Drag each concept into the appropriate category bucket below:',
    categories,
    pairs,
    explanation: 'Great work! Categorizing controls helps solidify security architecture and operational taxonomy.'
  };
}

