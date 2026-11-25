import { CourseData } from '../types/course';

export const sampleBankingCourse: CourseData = {
  title: 'Digital Banking & Cybersecurity Fundamentals',
  subtitle: 'Interactive Micro-learning for High-Impact Financial Operations',
  description: 'Master core principles of zero-trust banking architecture, digital payments resilience, and fraud prevention through bite-sized interactive modules.',
  author: 'Enterprise Learning Academy',
  theme: {
    id: 'modern-indigo',
    name: 'Corporate Indigo & Teal',
    primaryColor: '#4f46e5',
    primaryLight: '#e0e7ff',
    accentColor: '#10b981',
    backgroundColor: '#090d16',
    cardBackground: '#131b2e',
    textColor: '#f8fafc',
    textMuted: '#94a3b8',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  },
  scormSettings: {
    version: '2004 4th Edition',
    identifier: 'COURSE_HDFC_SEC_2026',
    title: 'Digital Banking & Cybersecurity Fundamentals',
    description: 'Compliant SCORM 2004 4th Edition module with interactive MCQ and Drag-and-Drop verification.',
    passingScore: 80,
    masteryScore: 80,
    allowRetake: true,
    requireQuizPass: true,
    author: 'Chief Information Security Office'
  },
  slides: [
    {
      id: 'slide-1',
      slideNumber: 1,
      title: 'Digital Banking & Cybersecurity Architecture',
      subtitle: 'Modernizing Trust, Real-time Fraud Defense & Cloud Resilience',
      layout: 'title',
      blocks: [
        {
          id: 'b1-1',
          type: 'paragraph',
          text: 'Welcome to the Digital Banking Excellence series. In this interactive module, you will explore how modern financial institutions balance instantaneous customer convenience with uncompromising zero-trust security controls.'
        },
        {
          id: 'b1-2',
          type: 'callout',
          text: 'Mobile-Optimized Learning: This course dynamically adapts to your smartphone screen with touch-friendly interactions and swipe navigation.',
          calloutType: 'info'
        }
      ],
      keyTakeaways: [
        'Understand Zero-Trust in modern banking',
        'Learn real-time fraud prevention techniques',
        'Demonstrate mastery in interactive challenges'
      ]
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      title: 'Core Pillars of Secure Banking',
      subtitle: 'Building layered defense across customer touchpoints',
      layout: 'bullets',
      blocks: [
        {
          id: 'b2-1',
          type: 'paragraph',
          text: 'Modern banking architecture relies on three foundational pillars to safeguard financial transactions and customer privacy:'
        },
        {
          id: 'b2-2',
          type: 'bullet-list',
          items: [
            'Identity First & Continuous Authentication: Never trust, always verify every API request and customer session.',
            'End-to-End Cryptography: Hardware Security Modules (HSM) and TLS 1.3 encryption across all payment corridors.',
            'Behavioral Biometrics: AI-driven telemetry analyzing typing cadences, swipe patterns, and device anomalies to prevent account takeovers.'
          ]
        },
        {
          id: 'b2-3',
          type: 'callout',
          text: 'Pro Tip: Multi-factor authentication reduces credential-stuffing vulnerability by over 99.2%.',
          calloutType: 'tip'
        }
      ],
      keyTakeaways: [
        'Continuous authentication replaces static passwords',
        'AI behavioral biometrics detect fraud before transfer execution'
      ]
    },
    {
      id: 'slide-3',
      slideNumber: 3,
      title: 'Knowledge Check: Authentication Architecture',
      subtitle: 'Test your understanding before advancing to risk mitigation',
      layout: 'interactive-quiz',
      blocks: [
        {
          id: 'b3-1',
          type: 'paragraph',
          text: 'Select the optimal security decision for modern cloud-native banking microservices:'
        }
      ],
      quiz: {
        id: 'quiz-1',
        prompt: 'In a Zero-Trust banking environment, how should API communication between payment services be authorized?',
        options: [
          {
            id: 'opt-1',
            text: 'Mutual TLS (mTLS) with short-lived cryptographically signed tokens and least-privilege scoping',
            isCorrect: true,
            feedback: 'Spot on! Mutual TLS ensures bidirectional identity verification with strict time-bounded token expiration.'
          },
          {
            id: 'opt-2',
            text: 'Relying exclusively on the internal network firewall without service-to-service authentication',
            isCorrect: false,
            feedback: 'Incorrect. Perimeter-only security fails when an internal node or VPN connection is compromised.'
          },
          {
            id: 'opt-3',
            text: 'Hardcoded static API keys stored in server environment variables',
            isCorrect: false,
            feedback: 'Incorrect. Static keys risk credential leakage and cannot be easily rotated without downtime.'
          },
          {
            id: 'opt-4',
            text: 'Allowing all services within the same VPC to communicate unencrypted for speed',
            isCorrect: false,
            feedback: 'Incorrect. Lateral movement in unencrypted VPCs violates regulatory financial compliance standards.'
          }
        ],
        explanation: 'Zero-Trust requires explicit mutual verification (mTLS) and fine-grained least-privilege token validation on every single microservice call.',
        points: 50
      }
    },
    {
      id: 'slide-4',
      slideNumber: 4,
      title: 'Matching Challenge: Threat vs Safeguard',
      subtitle: 'Drag and drop or tap to align threats with mitigation protocols',
      layout: 'interactive-dragdrop',
      blocks: [
        {
          id: 'b4-1',
          type: 'paragraph',
          text: 'Align each emerging banking threat with its corresponding mitigation framework:'
        }
      ],
      dragDrop: {
        id: 'dd-1',
        title: 'Security Safeguard Matching',
        instruction: 'Categorize each item into either "Preventive Shield" or "Detection & Incident Response":',
        categories: ['Preventive Shield', 'Detection & Incident Response'],
        pairs: [
          {
            id: 'p1',
            sourceText: 'FIDO2 Hardware Security Keys',
            targetCategory: 'Preventive Shield'
          },
          {
            id: 'p2',
            sourceText: 'Automated Honeytokens & SIEM Log Correlation',
            targetCategory: 'Detection & Incident Response'
          },
          {
            id: 'p3',
            sourceText: 'Strict Web Application Firewall (WAF) Rule Sets',
            targetCategory: 'Preventive Shield'
          },
          {
            id: 'p4',
            sourceText: 'Real-time Transaction Anomaly Alerts',
            targetCategory: 'Detection & Incident Response'
          }
        ],
        explanation: 'FIDO2 and WAF provide frontline defenses (Preventive), while SIEM logs and transaction anomaly models provide immediate detection and response capabilities.'
      }
    },
    {
      id: 'slide-5',
      slideNumber: 5,
      title: 'Core Architectural Concepts',
      subtitle: 'Tap each card below to test your recall of key financial regulations',
      layout: 'interactive-flashcard',
      blocks: [
        {
          id: 'b5-1',
          type: 'paragraph',
          text: 'Review these fundamental compliance standards critical for banking audits:'
        }
      ],
      flashcards: [
        {
          id: 'fc-1',
          badge: 'REGULATION',
          front: 'What is the primary mandate of PCI-DSS 4.0?',
          back: 'Requires continuous payment card data protection, multi-factor authentication for all cardholder access, and strict automated tamper detection.'
        },
        {
          id: 'fc-2',
          badge: 'METRIC',
          front: 'What does RPO and RTO mean in disaster recovery?',
          back: 'RPO (Recovery Point Objective): maximum acceptable data loss in time. RTO (Recovery Time Objective): maximum acceptable system downtime.'
        },
        {
          id: 'fc-3',
          badge: 'GOVERNANCE',
          front: 'What is the role of Data Localization in banking?',
          back: 'Mandates that all financial transaction payment data must reside within the sovereign geographic boundaries of the governing central bank.'
        }
      ]
    },
    {
      id: 'slide-6',
      slideNumber: 6,
      title: 'Summary & Certification Completion',
      subtitle: 'Key takeaways and SCORM tracking submission',
      layout: 'summary',
      blocks: [
        {
          id: 'b6-1',
          type: 'paragraph',
          text: 'You have reviewed the core foundations of modern digital banking security, completed the knowledge check, and categorized critical safeguards.'
        },
        {
          id: 'b6-2',
          type: 'bullet-list',
          items: [
            'Zero Trust is continuous: trust nothing without token authorization.',
            'Layered defense prevents catastrophic systemic single-point failures.',
            'Interactive validation reinforces compliance retention.'
          ]
        },
        {
          id: 'b6-3',
          type: 'callout',
          text: 'Ready to submit: When uploaded to your LMS, your completion and quiz score are automatically recorded via SCORM 2004 API.',
          calloutType: 'success'
        }
      ]
    }
  ]
};

