/**
 * HDFC Academy — Business Sales Excellence (Day 2)
 * Complete, Unabridged 129-Slide Curriculum Data + 14 Visual Infographics + 4 Video Embed Slots
 */
const COURSE_CHAPTERS = [
  // =========================================================================
  // CHAPTER 0: SESSION OVERVIEW, ROADMAP & LEARNING OBJECTIVES (Slides 1-3)
  // =========================================================================
  {
    id: 'ch0',
    num: '00',
    shortTitle: 'Overview & Roadmap',
    title: 'Day 2: KYC and Know Your Product',
    subtitle: 'KYC & AML, Savings Accounts, Current Accounts, Term Deposits & Consultative Sales',
    blocks: [
      {
        type: 'think',
        title: 'Opening Reflection (Slide 1)',
        prompt: 'What must a bank know about a customer before it opens an account for them?',
        hint: 'Consider true identity, verifiable address, source of funds, occupation/nature of business, and expected transaction patterns under RBI & PMLA regulations.'
      },
      {
        type: 'image',
        src: 'assets/hero_roadmap.png',
        alt: 'Day 2 Learning Architecture across 8 Modules',
        caption: 'Fig 0.1 · Complete Two-Part Learning Journey (Modules 1–4 Products & Compliance | Modules 5–8 Sales & Digital)'
      },
      {
        type: 'card',
        tag: 'Session Roadmap · Slide 2',
        heading: 'Eight Modules in Two Connected Parts',
        body: '<p>Today covers <strong>eight modules</strong> organized into two integrated parts so you master both regulatory compliance and consultative customer conversations:</p>',
        bullets: [
          '<strong>Part 1 · Products & Compliance (Modules 1–4):</strong> Module 1: KYC & AML · Module 2: Savings Accounts · Module 3: Current Accounts · Module 4: Term Deposits.',
          '<strong>Part 2 · Sales & Customers (Modules 5–8):</strong> Module 5: Sales Mindset · Module 6: Sales Process · Module 7: Managed Customers · Module 8: Banking Industry – New Trends.',
          '<strong>Interactive Learning Elements Throughout:</strong> Role-play video slots, Quick checks, Real-world branch & merchant scenarios, Fill-in-the-blanks, Matching drills, and a KYC Document Sorter.'
        ]
      },
      {
        type: 'accordion',
        tag: 'Learning Objectives · Slide 3',
        heading: 'What You Will Master by the End of Day 2',
        items: [
          {
            title: '1. IDENTIFY — Core Rules, Triggers & Profiles',
            content: '<ul class="rich-list"><li>Identify key <strong>KYC, AML, and compliance requirements</strong>, including documents, red flags, and escalation triggers.</li><li>Identify key <strong>product features, eligibility, and rules</strong> for Savings Accounts, Current Accounts, and Term Deposits.</li><li>Identify <strong>customer profile and life-stage indicators</strong> that influence banking needs and product suitability.</li></ul>'
          },
          {
            title: '2. EXPLAIN — Concepts, Processes & Trends',
            content: '<ul class="rich-list"><li>Explain <strong>core banking and compliance concepts</strong>—such as Maker-Checker, nomination, payout types, TDS, and safe digital practices—in clear customer-friendly language.</li><li>Explain the <strong>three stages and six steps</strong> of a structured sales process and how to build a steady customer pipeline.</li><li>Explain how <strong>digital trends, AI, CRM, and omnichannel journeys</strong> are reshaping modern banking sales.</li></ul>'
          },
          {
            title: '3. APPLY — Real Branch & Field Decisions',
            content: '<ul class="rich-list"><li>Apply <strong>KYC verification, customer profiling, and product-selection rules</strong> to realistic customer scenarios.</li><li>Apply <strong>need-based selling, objection handling, and referral practices</strong> during simulated sales conversations.</li><li>Apply <strong>responsible, compliant, and fraud-aware sales behaviours</strong> across physical and digital channels.</li></ul>'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 1: MODULE 1 — KYC & AML (Slides 4-26)
  // =========================================================================
  {
    id: 'ch1',
    num: 'M1',
    shortTitle: 'M1 · KYC & AML',
    title: 'Module 1: KYC & AML Compliance',
    subtitle: 'Regulatory Foundations, Customer Due Diligence, Transaction Monitoring & Profiling',
    blocks: [
      {
        type: 'think',
        title: 'Module 1 Opening Thought (Slide 4)',
        prompt: 'What could go wrong if a bank does not know who its customer really is?',
        hint: 'Shell accounts, money laundering, terrorist financing, statutory cheque-collection liability, RBI penalties, and personal employee accountability.'
      },
      {
        type: 'card',
        tag: 'Why Compliance · Slides 5–7',
        heading: 'Compliance Culture & Cost of Non-Compliance',
        body: '<p>Banks operate in a tightly regulated environment and are subject to strict regulatory oversight. A breach—or even a <strong>"perceived breach"</strong>—of regulations can severely affect a bank\'s growth.</p>',
        bullets: [
          '<strong>Monetary Losses:</strong> Heavy regulatory fines, penalties, and financial restitutions.',
          '<strong>Loss of Goodwill:</strong> Erosion of public, investor, and regulator trust.',
          '<strong>License Cancellation:</strong> Suspension or revocation of banking operations in severe breaches.',
          '<strong>Personal Liability:</strong> Individual disciplinary, civil, or legal liability for negligent staff.',
          '<strong>Three Pillars of Compliance Culture (Slide 7):</strong> (1) <em>AML & KYC</em>, (2) <em>Audit</em>, and (3) <em>Fraud Prevention</em>.'
        ],
        callout: {
          type: 'warn',
          text: '<strong>Four Key Compliance Questions (Slide 6):</strong><br>1. <em>Who is responsible?</em> Every single employee—not just the compliance department.<br>2. <em>When do you monitor—only at audit?</em> Continuously in every daily transaction and onboarding.<br>3. <em>Why is compliance important?</em> Protects customers, the bank\'s license, and personal integrity.<br>4. <em>How do you ensure compliance in a branch?</em> Strict adherence to SOPs, Maker-Checker controls, and timely exception escalation.'
        }
      },
      {
        type: 'image',
        src: 'assets/m1_kyc_pillars.png',
        alt: '4 Core KYC Questions and Maker-Checker Control',
        caption: 'Fig 1.1 · The Four Core KYC Questions & Maker-Checker Dual Accountability'
      },
      {
        type: 'card',
        tag: 'Dual Control · Slide 8',
        heading: 'The Maker-Checker Concept',
        body: '<p>In banking, <strong>Maker-Checker</strong> is a mandatory dual-control workflow: one employee (the <em>Maker</em>) creates a request or transaction, and a second authorized employee (the <em>Checker</em>) independently verifies and approves it before execution.</p>',
        bullets: [
          'Introduces a vital <strong>second pair of eyes</strong> to spot suspicious, strange, or incorrect entries.',
          'Strengthens online and branch operational controls.',
          '<strong>Protects employees and the business from 4 critical operational risks:</strong> (1) <em>Processing Errors</em>, (2) <em>Compromised Credentials</em>, (3) <em>Payment Scams</em>, and (4) <em>Internal Fraud</em>.'
        ],
        callout: {
          type: 'tip',
          text: '<strong>Accountability Rule:</strong> Both the Maker AND the Checker are jointly accountable. Never approve an entry blindly just because a colleague initiated it.'
        }
      },
      {
        type: 'card',
        tag: 'Regulatory Framework · Slides 9–12',
        heading: 'Know Your Customer (KYC): Legal Basis, Reasons & 4 Key Elements',
        body: '<p><strong>Do we really know our customer?</strong> Before onboarding, we must ask: (1) Can we recognise them by Proof of Identity? (2) Can we trace them by Proof of Address & contact details? (3) Do we know their business or profession? (4) Do they fit into our regulatory framework?</p><p><strong>Statutory Mandate (Slide 10):</strong> Issued by the Reserve Bank of India (RBI) under <strong>Section 35A of the Banking Regulation Act, 1949</strong> and <strong>Rule 7 of the Prevention of Money-Laundering (Maintenance of Records) Rules, 2005 under PMLA, 2002</strong>. Any contravention attracts severe statutory penalties.</p>',
        bullets: [
          '<strong>Core Objective (Slide 12):</strong> Prevent banks from being used, intentionally or unintentionally, by criminal elements for money laundering or terrorist financing activities.',
          '<strong>3 Main Reasons KYC is Crucial at Account Opening:</strong><br>a) <em>Statutory Protection:</em> Protection under <strong>Section 131 of the Negotiable Instruments Act</strong> in respect of cheques collected for credit to the customer\'s account.<br>b) <em>Prevent Money Laundering:</em> Stop customers from misusing accounts to launder illicit funds.<br>c) <em>Prevent Terrorism Funding:</em> Block financial channels supporting terrorist networks.',
          '<strong>4 Key Elements of KYC Policy:</strong> (i) <em>Customer Acceptance Policy (CAP)</em>, (ii) <em>Customer Identification Process (CIP)</em>, (iii) <em>Monitoring of Transactions</em>, and (iv) <em>Risk Management</em>.'
        ]
      },
      {
        type: 'accordion',
        tag: 'Customer Acceptance & Identification · Slides 13–14',
        heading: '8 Rules of Customer Acceptance Policy & CIP Standards',
        items: [
          {
            title: '1. Customer Acceptance Criteria & 2. Risk Classification',
            content: '<p><strong>Acceptance Criteria:</strong> Clear criteria for accepting customers—accounts cannot be opened in anonymous, fictitious, or benami names.</p><p><strong>Customer Risk Classification:</strong> Categorize every customer into <strong>Low, Medium, or High Risk</strong> based on identity, social/financial status, nature of business activity, and location.</p>'
          },
          {
            title: '3. Documentation Requirements & 4. Ongoing Due Diligence (CDD)',
            content: '<p><strong>Documentation:</strong> Specify exact OVDs and supporting documents required per risk category without creating barriers for financially excluded segments.</p><p><strong>Customer Due Diligence (CDD):</strong> Applied continuously at <em>account opening</em>, during <em>ongoing operations</em>, and at <em>account closure</em>.</p>'
          },
          {
            title: '5. Authorised Representatives & 6. Criminal / Sanctions Screening',
            content: '<p><strong>Authorised Representatives:</strong> Verify identity and authority of anyone acting on behalf of a customer (mandate holders, POA, signatories).</p><p><strong>Criminal & Sanctions Screening:</strong> Screen applicants against UN Security Council, RBI, and statutory banned/sanctions lists to prevent onboarding criminals or terrorists.</p>'
          },
          {
            title: '7. Politically Exposed Persons (PEPs) & 8. Vulnerable Customers',
            content: '<p><strong>PEPs:</strong> Enhanced due diligence (EDD), senior management approval, and source-of-wealth verification for domestic/foreign PEPs and their close associates.</p><p><strong>Special Assistance to Vulnerable Customers:</strong> Provide courteous, accessible support to senior citizens, differently-abled persons, and visually impaired customers.</p>'
          },
          {
            title: 'Customer Identification Process (CIP) · Slide 14',
            content: '<ul class="rich-list"><li><strong>Beneficial Owner Identification:</strong> Identify the natural person(s) who ultimately own or control a legal entity/trust account.</li><li><strong>Customer Identification:</strong> Verify identity using reliable, independent source documents (OVDs).</li><li><strong>Acceptable ID Mandatory Elements:</strong> Must contain <strong>Name, Photograph, and Signature</strong>.</li><li><strong>Verification Against AOF:</strong> Cross-check every detail on the ID document against the Account Opening Form (AOF).</li></ul>'
          }
        ]
      },
      {
        type: 'video_placeholder',
        id: 'vid_kyc_process',
        badge: 'VIDEO EMBED SLOT 01 · SLIDE 16',
        title: 'KYC Process for an Account & Personal Verification',
        duration: '04:30',
        embedUrl: '',
        watchFor: [
          'Checking original Officially Valid Documents (OVDs) against photocopies without overwriting',
          'Obtaining customer self-attestation on every submitted photocopy',
          'Affixing staff Name, Employee Number, Signature, and Branch Stamp on the face of the copy'
        ]
      },
      {
        type: 'image',
        src: 'assets/m1_aml_redflags.png',
        alt: 'AML Transaction Monitoring 5 Categories',
        caption: 'Fig 1.2 · Five AML Surveillance Categories Across 28 Red-Flag Scenarios (Slide 15)'
      },
      {
        type: 'accordion',
        tag: 'AML Transaction Monitoring · Slide 15 (Complete 28 Scenarios)',
        heading: 'All 5 Categories of Suspicious Transaction Patterns',
        items: [
          {
            title: 'Category 1: Cash and Threshold Patterns (5 Scenarios)',
            content: '<ul class="rich-list red"><li>Cash deposits or withdrawals exceeding the specified regulatory threshold in a month.</li><li>Multiple cash transactions cumulating above the threshold in a single day.</li><li>Cash transactions structured <strong>just below</strong> the reporting threshold (smurfing).</li><li>Small cash transactions that become excessive over several consecutive days.</li><li>Structuring of cash deposits through multiple branches to evade detection.</li></ul>'
          },
          {
            title: 'Category 2: Account Behaviour Anomalies (6 Scenarios)',
            content: '<ul class="rich-list red"><li>Deposits far in excess of declared income or inconsistent with financial standing.</li><li>Transactions across multiple branch locations over a short period.</li><li>Sudden high-value operations in long-inactive/dormant accounts.</li><li>Unusual high-value transactions in newly opened accounts.</li><li>Repeated transactions in identical or very similar round amounts.</li><li>Multiple large withdrawals within a short period after credit.</li></ul>'
          },
          {
            title: 'Category 3: Transfers and Remittances (5 Scenarios)',
            content: '<ul class="rich-list red"><li>Unexplained transfers between multiple accounts with no commercial rationale.</li><li>Remittances or inward wire transfers to branches from sensitive states/regions.</li><li>High-value remittances routed via exchange houses or vostro accounts.</li><li>Large outgoing wire transfers for Visa Money Transfer (VMT).</li><li>Frequent purchases of demand drafts (DDs) or negotiable instruments.</li></ul>'
          },
          {
            title: 'Category 4: Customer and Identity Patterns (6 Scenarios)',
            content: '<ul class="rich-list red"><li>Frequent, unexplained changes of communication or permanent address.</li><li>Common phone/mobile numbers shared across seemingly unrelated accounts.</li><li>Multiple accounts opened with the same or slightly altered customer IDs.</li><li>Joint account holders appearing across more than a permitted number of accounts.</li><li>Customer or beneficial owner names matching banned/sanctions lists.</li><li>Unexplained high-value transactions in bank staff accounts.</li></ul>'
          },
          {
            title: 'Category 5: Products and High-Value Activity (6 Scenarios)',
            content: '<ul class="rich-list red"><li>Large cash deposits/payments in credit card accounts.</li><li>Multiple loans taken and rapidly closed by cash.</li><li>Depository (Demat) account transactions unusual by value or nature.</li><li>Unusually high frequency of safe-deposit locker operations.</li><li>Multiple cheque books issued repeatedly in a short span.</li><li>Individual transactions above threshold or high-value transactions conducted without PAN ID.</li></ul>'
          }
        ]
      },
      {
        type: 'image',
        src: 'assets/m1_doc_verification.png',
        alt: 'Branch Personal Verification and KYC Attestation Standard',
        caption: 'Fig 1.3 · 3-Step Branch Document Verification & Attestation Protocol (Slides 17–19)'
      },
      {
        type: 'card',
        tag: 'Branch Execution · Slides 17–19',
        heading: 'Mandatory Documents, Checking Rules & Personal Verification',
        body: '<h3>Mandatory Documents for Account Opening (Slide 17)</h3>',
        bullets: [
          '<strong>1. Duly filled Account Opening Form (AOF)</strong> signed across all required fields.',
          '<strong>2. Latest colour photograph(s)</strong> of applicant(s).',
          '<strong>3. Identity Proof (OVDs):</strong> PAN Card, Driving Licence, Voter ID, or Aadhaar Card.',
          '<strong>4. Proof of Communication Address:</strong> Aadhaar Card, Driving Licence, Voter ID, or Passport.',
          '<strong>5. PAN Card</strong> (or duly filled <strong>Form 60 / 61</strong> where applicable).',
          '<strong>6. Initial Deposit:</strong> By self-cheque from existing bank account or cash deposit at the branch.'
        ],
        callout: {
          type: 'tip',
          text: '<strong>6 Mandatory Rules for Personal Verification (Slides 18–19):</strong><br>1. Personally meet the applicant(s) face-to-face.<br>2. Conduct the meeting preferably at the customer\'s <em>residence, office, or bank branch</em>.<br>3. Obtain the customer\'s <strong>self-attestation on photocopies of ALL documents</strong>.<br>4. Verify originals for genuineness, current validity, clear photograph, and <strong>zero tampering or overwriting</strong>.<br>5. Attest verified copies with your <strong>Name, Employee Number, and Signature</strong>.<br>6. Certify by affixing the official <strong>Branch Stamp on the face</strong> of the document.'
        }
      },
      {
        type: 'card',
        tag: 'Customer Profiling · Slides 20–23',
        heading: 'Customer Profiling: Knowing Your Customer Beyond the Documents',
        body: '<p><strong>What is Customer Profiling?</strong> Building a clear, realistic picture of who the customer is, how they earn, why they need the account, and what normal transaction activity looks like for them.</p><p><strong>Why It Matters:</strong> Documents prove identity, but profiling explains behaviour—helping spot unusual activity early, preventing mule accounts, supporting risk classification, and matching the right product.</p>',
        table: {
          headers: ['Profile Component', 'What You Must Capture & Verify'],
          rows: [
            ['1. Identity', 'Full legal name, age, DOB, PAN, and beneficial ownership'],
            ['2. Address & Location', 'Current residence/business premises vs. permanent address'],
            ['3. Occupation / Business', 'Salaried role, industry, trade, or professional practice'],
            ['4. Source of Funds', 'Where the money entering the account comes from (salary, sales, fees)'],
            ['5. Source of Wealth', 'Overall net worth / accumulated assets or business capital'],
            ['6. Expected Transactions', 'Expected monthly turnover, cash vs. digital ratio, ticket size'],
            ['7. Purpose of Account', 'Salary credit, household savings, retail collections, or vendor payouts'],
            ['8. Risk Indicators', 'PEP status, cash-intensive trade, cross-border wires, or high-risk geography']
          ]
        },
        callout: {
          type: 'warn',
          text: '<strong>Illustrative Case & Red Flags (Slides 22–23):</strong> A small local retailer declares modest daily local collections, yet receives frequent high-value NEFT/RTGS transfers from unrelated outstation parties.<br><strong>7 Red Flags to Watch:</strong> (1) Reluctance to share occupation/source of funds, (2) Vague/inconsistent answers, (3) Turnover far above stated income, (4) High-value cash/transfers in a new account, (5) Frequent third-party credits with no link, (6) Address mismatch/unreachable contact, (7) Urgency to open account while skipping checks.<br><em>Golden Rule: A red flag is a reason to examine further and escalate—not a conclusion that a crime has occurred.</em>'
        }
      },
      {
        type: 'quiz_mcq',
        id: 'm1_qc1',
        title: 'Module 1 · Quick Check 1: Apply It (Slide 24)',
        questions: [
          {
            q: '1. During branch verification, the customer\'s photograph on the submitted ID photocopy is too faint to recognise their face clearly. What should you do?',
            options: [
              'Accept it since the ID number is readable',
              'Do not accept the faint copy; ask for a clear, legible copy verified against the original OVD',
              'Write "Verified" and ask the Checker to approve it'
            ],
            correct: 1,
            explanation: 'Slide 18: You must verify that the photograph is clear and recognizable against the person and original OVD before attesting.'
          },
          {
            q: '2. A salaried customer who declared ₹45,000 monthly salary begins receiving multiple ₹4–5 lakh transfers from unrelated parties within two weeks of opening the account. What does this indicate?',
            options: [
              'Normal salary bonus activity; ignore it',
              'A profile mismatch & AML red flag requiring closer examination and compliance escalation',
              'Automatically close the account without recording an alert'
            ],
            correct: 1,
            explanation: 'Slides 22–23: Deposits/transfers inconsistent with declared income and unrelated third-party credits are classic AML red flags requiring examination and escalation.'
          },
          {
            q: '3. Meera submits her AOF and documents at the branch, and all photocopies are verified against originals. Which personal verification step is still essential?',
            options: [
              'Visit/verify her actual communication address in person and ensure self-attestation + staff stamp/signature',
              'Skip address verification since her PAN card is attached',
              'Keep her original Aadhaar card in the branch file'
            ],
            correct: 0,
            explanation: 'Slides 18–19: Never retain originals; ensure customer self-attestation, staff Name/Emp No./Sign/Stamp on copies, and verify actual communication address in person.'
          }
        ]
      },
      {
        type: 'quiz_blanks',
        id: 'm1_qc2',
        title: 'Module 1 · Quick Check 2: Fill in the Blanks (Slide 25)',
        wordBank: ['Prevention of Money-Laundering', 'Risk', 'overwriting', 'signature', 'exception'],
        items: [
          { prompt: '1. RBI KYC guidelines are issued under Section 35A of the Banking Regulation Act and Rule 7 of the __________ Act, 2002.', answer: 'Prevention of Money-Laundering' },
          { prompt: '2. The four key elements of KYC policy are Customer Acceptance Policy, Customer Identification Process, Monitoring of Transactions, and __________ Management.', answer: 'Risk' },
          { prompt: '3. In a branch, compliance is maintained by following SOPs, Maker-Checker controls, and timely __________ escalation.', answer: 'exception' },
          { prompt: '4. An acceptable ID document must contain the customer\'s Name, Photograph, and __________.', answer: 'signature' },
          { prompt: '5. Originals must be checked to ensure there is no tampering or __________ on the document.', answer: 'overwriting' }
        ]
      },
      {
        type: 'quiz_mcq',
        id: 'm1_qc3',
        title: 'Module 1 · Quick Check 3: True or False (Slide 26)',
        questions: [
          {
            q: '1. True or False: Only the central Compliance Department is responsible for KYC and AML compliance in the bank.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Every employee—especially customer-facing sales and branch staff—is personally responsible and accountable.'
          },
          {
            q: '2. True or False: In a Maker-Checker workflow, only the Maker is accountable if a fraudulent or erroneous entry is approved.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Both the Maker AND the Checker are jointly accountable.'
          },
          {
            q: '3. True or False: A red flag in transaction monitoring is a reason to examine further and escalate, not an automatic conclusion that a crime has occurred.',
            options: ['True', 'False'],
            correct: 0,
            explanation: 'True! Slide 23 explicitly emphasizes that a red flag triggers investigation and escalation, not a premature accusation.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 2: MODULE 2 — SAVINGS BANK ACCOUNT (Slides 27-42)
  // =========================================================================
  {
    id: 'ch2',
    num: 'M2',
    shortTitle: 'M2 · Savings Account',
    title: 'Module 2: Savings Bank Account',
    subtitle: 'Base Location Rules, Joint Modes of Operation, RBI Nomination Rules & 5 Resident Variants',
    blocks: [
      {
        type: 'card',
        tag: 'Core Concepts · Slide 28',
        heading: 'Base Branch Location & Scheme Code Accuracy',
        bullets: [
          '<strong>Base Branch / Base Location:</strong> The branch/city where the account is opened and domiciled. Certain free cash deposit/withdrawal limits and home-branch services apply at the base location.',
          '<strong>Non-Base Locations:</strong> Branches outside the home city/location where multi-city transactions can still be performed subject to variant rules.',
          '<strong>Account Opening Status / Scheme Code:</strong> Selecting the exact Scheme Code at onboarding is critical because it governs minimum balance (MAB), free limits, debit card eligibility, insurance covers, and interest/fee waivers.'
        ]
      },
      {
        type: 'image',
        src: 'assets/m2_savings_matrix.png',
        alt: '5 Resident Savings Variants and RBI Nomination Rule',
        caption: 'Fig 2.1 · Five Resident Savings Variants & RBI Trustee Nomination Standard'
      },
      {
        type: 'card',
        tag: 'Joint Accounts · Slide 29',
        heading: 'Savings Account: 5 Modes of Operation',
        table: {
          headers: ['Mode of Operation', 'How It Operates (During Lifetime & On Death)'],
          rows: [
            ['1. Single', 'Operated solely by one individual account holder.'],
            ['2. Either or Survivor (E or S)', 'Two individuals; either holder can operate independently during lifetime, and the survivor operates upon the death of one.'],
            ['3. Former or Survivor (F or S)', 'Only the First (Former) holder operates during their lifetime; the Survivor operates only after the death of the Former holder.'],
            ['4. Jointly or Survivor (J or S)', 'Both/all holders must sign together for every operation during lifetime; upon death of one, the survivor(s) operate.'],
            ['5. Anyone or Survivor (A or S)', 'Used when there are more than two joint holders; any one holder can operate independently, and survivor(s) operate thereafter.']
          ]
        }
      },
      {
        type: 'accordion',
        tag: 'RBI Nomination Guidelines · Slides 30–31',
        heading: 'All 7 RBI Nomination Rules Every Banker Must Know',
        items: [
          {
            title: '1. Mandatory Nomination & Written Opt-Out',
            content: '<p>Banks must actively offer nomination at account opening. If a customer declines nomination, they must record a <strong>written opt-out declaration</strong> (the bank cannot refuse to open the account solely because the customer declined nomination).</p>'
          },
          {
            title: '2. Up to 4 Individual Nominees & All Joint Holders\' Consent',
            content: '<p>Account holders can nominate <strong>up to four (4) individuals</strong> (with clear percentage shares totalling 100%). In joint accounts, <strong>all joint holders must sign/consent</strong> to add, modify, or cancel a nominee.</p>'
          },
          {
            title: '3. Nominee\'s Rights as a Trustee',
            content: '<p>Upon the death of the sole/all account holders, the bank pays the balance to the nominee, which gives the bank a valid discharge. Crucially, the <strong>nominee receives the funds in trust</strong> on behalf of the legal heirs.</p>'
          },
          {
            title: '4. Change or Cancellation Anytime with Bank Acknowledgement',
            content: '<p>Nomination can be modified or cancelled at any time during the subsistence of the account by all surviving holders, and the bank must issue a written acknowledgement.</p>'
          },
          {
            title: '5. Does Not Override Succession Laws or a Will',
            content: '<p>Nomination creates no independent ownership right for the nominee—it <strong>does not override personal succession laws or a valid legal will</strong>.</p>'
          },
          {
            title: '6. Record Keeping & 7. Awareness and Accessibility',
            content: '<p>Banks must maintain accurate nomination registers, print nomination registration status on passbooks/statements, and make nomination forms easily accessible at branches and digital channels.</p>'
          }
        ]
      },
      {
        type: 'quiz_mcq',
        id: 'm2_kc1',
        title: 'Module 2 · Knowledge Check 1: Operation & Nomination (Slide 32)',
        questions: [
          {
            q: '1. Mr. Sharma wants his wife to be a joint holder on his Savings Account, but wants ONLY himself to operate the account during his lifetime, with his wife accessing funds only after his death. Which mode applies?',
            options: ['Either or Survivor', 'Former or Survivor', 'Jointly or Survivor'],
            correct: 1,
            explanation: 'Former or Survivor (F or S) restricts operation strictly to the first (former) holder during their lifetime, passing operation to the survivor only on death.'
          },
          {
            q: '2. Under updated RBI guidelines, up to how many individual nominees can be registered in a deposit account?',
            options: ['Only 1', 'Up to 2', 'Up to 4'],
            correct: 2,
            explanation: 'Slide 30: RBI guidelines permit nominating up to four (4) individuals.'
          },
          {
            q: '3. True or False: Once registered as a nominee, the nominee becomes the absolute legal owner of the funds and overrides the deceased customer\'s legal heirs or will.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! The nominee acts solely as a trustee for the legal heirs and does not override succession laws or a will.'
          }
        ]
      },
      {
        type: 'accordion',
        tag: '5 Resident Savings Variants · Slides 33–39',
        heading: 'Complete Product Breakdown: All 5 Resident Savings Variants',
        items: [
          {
            title: 'Variant 1: Savings Regular Account (Slide 34)',
            content: '<p><strong>Eligibility:</strong> Resident individual (sole or joint, including minors), Hindu Undivided Family (HUF), and <strong>Foreign Nationals residing in India for more than 180 days</strong> (with valid passport, visa & residential permit).</p><ul class="rich-list"><li>Free InstaAlerts, Passbook & Monthly Email Statements.</li><li>International Debit Card with cashback & airport lounge/merchant offers.</li><li>24x7 NetBanking, MobileBanking & PayZapp access.</li><li>Free BillPay & Standing Instructions for utility bills.</li><li>Safe Deposit Locker & sweep-in FD (Money Maximizer) facility.</li></ul>'
          },
          {
            title: 'Variant 2: Kids (Minor) Savings Account (Slide 35)',
            content: '<p><strong>Eligibility:</strong> Minor under <strong>18 years</strong> of age; parent/natural guardian must hold an HDFC Bank Savings Account to link Standing Instructions.</p><p><strong>Banking Advantages for Kids:</strong></p><ul class="rich-list green"><li>ATM/International Debit Card issued for kids aged <strong>10 to 18 years</strong> (with parent\'s consent) with controlled daily ATM cash (₹2,500) & merchant shopping limits (₹10,000).</li><li>Free non-HDFC ATM transactions (up to prescribed limit) & free personalized cheque book.</li></ul><p><strong>Banking Advantages for Parents:</strong></p><ul class="rich-list"><li>Free Passbook, NetBanking & monthly email statements to monitor child\'s spending.</li><li><strong>Free Standing Instruction (SI)</strong> transfer from parent\'s HDFC Savings Account to build disciplined savings.</li></ul>'
          },
          {
            title: 'Variant 3: Senior Citizens Savings Account (Slide 36)',
            content: '<p><strong>Eligibility:</strong> Resident individuals aged <strong>60 years and above</strong> (sole or joint). In joint accounts, the <strong>first applicant must be 60+</strong>.</p><ul class="rich-list"><li><strong>Preferential Fixed Deposit interest rates</strong> (higher yield than regular card rates).</li><li><strong>Priority servicing</strong> at all bank branches and dedicated senior-citizen desks.</li><li>Complimentary accidental hospitalisation & personal accident insurance cover (subject to card usage terms).</li><li>Free Lifetime BillPay, free passbook, and easy sweep-out FD facility.</li></ul>'
          },
          {
            title: 'Variant 4: Institutional Savings Account (Slide 37)',
            content: '<p><strong>8 Eligible Non-Profit / Institutional Entities:</strong> (1) Trust, (2) Association, (3) Society, (4) Club, (5) NGO, (6) Charitable Hospital, (7) Educational Institute, and (8) Section 25 (Section 8) Company.</p><ul class="rich-list"><li>NetBanking, PhoneBanking & MobileBanking tailored for authorized signatories.</li><li>Business Debit Card for authorized officials.</li><li><strong>Payment Gateway (PG) & POS terminal linking</strong> to collect donations, fees, or memberships digitally.</li><li>Employee Salary Accounts & <strong>Cash Management Services (CMS)</strong> support.</li></ul>'
          },
          {
            title: 'Variant 5: Women\'s Savings Account (Slides 38–39)',
            content: '<p><strong>Eligibility:</strong> Resident woman (sole or joint where the <strong>first holder is a woman</strong>) or resident foreign national woman (>180 days).</p><ul class="rich-list"><li>Complimentary <strong>Accidental Death & Accidental Hospitalisation cover</strong>.</li><li><strong>Preferential discount on processing fees</strong> for Two-Wheeler Loans and Auto Loans.</li><li>Exclusive shopping, lifestyle & debit card cashback benefits.</li><li><strong>Money Maximizer (Sweep-out)</strong> facility to earn higher FD returns on idle surplus.</li><li>Free Lifetime BillPay & free monthly email alerts.</li><li>24x7 NetBanking, PhoneBanking & MobileBanking + free passbook at home branch.</li></ul>'
          }
        ]
      },
      {
        type: 'quiz_match',
        id: 'm2_qc1',
        title: 'Module 2 · Quick Check 1: Match Customer to Savings Variant (Slide 40)',
        options: ['Savings Regular', 'Kids Savings Account', 'Senior Citizens Account', 'Women\'s Savings Account', 'Institutional Savings Account'],
        pairs: [
          { left: '1. Mrs. Rao wants to open an account for her 12-year-old son with a controlled debit card and monthly auto-transfer.', answer: 'Kids Savings Account' },
          { left: '2. Mr. Nair (63) wants priority branch service and higher interest rates on his retirement savings.', answer: 'Senior Citizens Account' },
          { left: '3. Ms. Fernandes (29) wants auto-sweep FD returns and a discount on two-wheeler loan processing fees.', answer: 'Women\'s Savings Account' },
          { left: '4. Green Valley Charitable Trust needs an account to receive donations via Payment Gateway and pay staff salaries.', answer: 'Institutional Savings Account' },
          { left: '5. Mr. Dsouza (35), a salaried executive, needs a standard everyday digital savings account.', answer: 'Savings Regular' }
        ]
      },
      {
        type: 'quiz_mcq',
        id: 'm2_qc2',
        title: 'Module 2 · Quick Check 2: True or False (Slide 41)',
        questions: [
          {
            q: '1. True or False: In a Senior Citizens Savings Account opened jointly, it is fine if the second holder is 62 while the first applicant is 45.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Slide 36: The FIRST applicant must be 60 years or older.'
          },
          {
            q: '2. True or False: A foreign national residing in India for more than 180 days with valid documents can open a Resident Savings Regular Account.',
            options: ['True', 'False'],
            correct: 0,
            explanation: 'True! Slide 34 explicitly includes foreign nationals residing in India for >180 days.'
          },
          {
            q: '3. True or False: An NGO or Educational Institute can link a Payment Gateway and POS machine to its Institutional Savings Account.',
            options: ['True', 'False'],
            correct: 0,
            explanation: 'True! Slide 37 highlights PG & POS linking plus CMS for Institutional Savings Accounts.'
          }
        ]
      },
      {
        type: 'quiz_blanks',
        id: 'm2_qc3',
        title: 'Module 2 · Quick Check 3: Fill in the Blanks with Word Bank (Slide 42)',
        wordBank: ['in trust', 'four', '60', '180', '18'],
        items: [
          { prompt: '1. A nominee holds the proceeds of a deceased depositor\'s account __________ for the legal heirs.', answer: 'in trust' },
          { prompt: '2. RBI guidelines allow up to __________ individual nominees in a deposit account.', answer: 'four' },
          { prompt: '3. The first applicant in a Senior Citizens Savings Account must be at least __________ years old.', answer: '60' },
          { prompt: '4. A foreign national must reside in India for more than __________ days to be eligible for a Resident Savings Regular account.', answer: '180' },
          { prompt: '5. A Kids Savings Account is meant for minors below __________ years of age.', answer: '18' }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 3: MODULE 3 — CURRENT ACCOUNT & MERCHANT SUITE (Slides 43-59)
  // =========================================================================
  {
    id: 'ch3',
    num: 'M3',
    shortTitle: 'M3 · Current Account',
    title: 'Module 3: Current Account & Merchant Solutions',
    subtitle: 'Business Banking, CIB, Business App, Doorstep Banking, POS/PG & Merchant App',
    blocks: [
      {
        type: 'think',
        title: 'Discussion Prompts (Slide 44)',
        prompt: 'Why is matching the right Current Account variant critical for both the business customer and the bank?',
        hint: 'Right variant prevents non-maintenance penalties and gives free cash/cheque/NEFT limits matched to turnover, while giving the bank zero-interest CASA float and fee/cross-sell revenue.'
      },
      {
        type: 'image',
        src: 'assets/m3_ca_ecosystem.png',
        alt: 'Current Account 360 Business Ecosystem',
        caption: 'Fig 3.1 · Current Account Digital, Doorstep & Merchant Collection Architecture'
      },
      {
        type: 'card',
        tag: 'Core Proposition · Slides 45–49',
        heading: 'Current Account: Features, 8 Customer Segments & Dual Benefits',
        body: '<p>A <strong>Current Account</strong> is a non-interest-bearing operating account designed primarily for businesses and non-individuals to handle high-frequency daily receipts and payments without transaction caps.</p>',
        bullets: [
          '<strong>8 Eligible Customer Categories (Slide 46):</strong> (1) Business Individuals, (2) Sole Proprietorship Firms, (3) Partnership Firms, (4) Private & Public Limited Companies, (5) Associations / Clubs, (6) Hindu Undivided Families (HUF), (7) Trusts, and (8) Societies.',
          '<strong>Core Features & Customer Benefits (Slides 45, 47–48):</strong> Liberty to operate several times a day; <strong>Anywhere Banking</strong> across India; vast branch & ATM network; Doorstep Banking; multi-user Corporate Internet Banking; free local/outstation collection limits based on variant; Overdraft/working-capital linkage.',
          '<strong>Top Benefits to the Bank (Slide 49):</strong> (1) <em>Zero interest cost</em> paid on Current Account balances, (2) Low-cost stable CASA float for lending/reinvestment, (3) Fee & transaction income (FX, CMS, POS, DSB), and (4) High cross-sell potential (trade finance, working capital loans, salary accounts).'
        ]
      },
      {
        type: 'accordion',
        tag: 'Digital & Physical Channels · Slides 50–56',
        heading: 'Complete Business Banking & Collection Toolkit',
        items: [
          {
            title: '1. Corporate Internet Banking (CIB) — 9 Key Capabilities (Slides 50–51)',
            content: '<ul class="rich-list"><li>24x7 online account access across entities.</li><li>Direct & indirect tax payments including <strong>GST</strong>.</li><li><strong>RTGS, NEFT, IMPS</strong> & <strong>Cardless Cash Withdrawal</strong>.</li><li>Real-time balances, mini-statements & downloadable MIS statements.</li><li>Utility & vendor <strong>Bill Pay</strong>.</li><li>Statutory <strong>EPF / ESIC</strong> employee contributions.</li><li><strong>Bulk file uploads</strong> for employee salaries, vendor payouts & taxes.</li><li>Dealer debit / automated collection mandates.</li><li><strong>Multi-level Maker / Checker workflow</strong> with custom authorization limits.</li></ul>'
          },
          {
            title: '2. Business Mobile Banking App on the Move (Slide 52)',
            content: '<p>Built for proprietors and SME promoters on the move:</p><ul class="rich-list"><li>Approve Maker-Checker transactions on the go via secure <strong>MPIN</strong>.</li><li>Collect payments via <strong>Eazypay UPI</strong> QR/link.</li><li><strong>6 Supported Payment Modes:</strong> Funds Transfer (within HDFC), IMPS, NEFT, RTGS, Bill Pay, and UPI.</li><li>Check real-time balances, FD summary, and mini statements anywhere.</li></ul>'
          },
          {
            title: '3. Doorstep Banking (DSB) — Slides 53–54',
            content: '<ul class="rich-list green"><li><strong>Risk Reduction:</strong> Eliminates the physical risk of carrying large cash/cheques from shop/mandi to the branch.</li><li><strong>Dedicated Courier Agencies:</strong> Authorized, insured pickup & delivery agents at scheduled slots.</li><li><strong>Quick Realisation:</strong> Faster clearing of local and outstation cheques.</li><li><strong>Customised Solution:</strong> Tailored pickup frequency & cash limits for high-cash traders, mandis, and retail chains.</li></ul><div class="callout think"><strong>Mandi Trader Case (Slide 54 — Mr. Mehta, Mehta Grain Traders):</strong> Mr. Mehta handles heavy daily cash and outstation buyer cheques in a busy grain mandi and cannot leave his counter during market hours. <em>Best Fit:</em> Current Account with <strong>Doorstep Banking (DSB)</strong> for daily cash/cheque pickup + <strong>Business Mobile App / Eazypay</strong> for instant supplier payouts.</div>'
          },
          {
            title: '4. POS (Point of Sale) & PG (Payment Gateway) — Slide 55',
            content: '<p>Offered through <strong>HDFC Merchant Services in alliance with First Data</strong>—providing physical EDC card swipe terminals and online Payment Gateways with competitive MDR rates and fast installation.</p><p><strong>7 Key Target Industries:</strong> (1) Restaurants, (2) Hotels, (3) Food Joints, (4) E-commerce Websites, (5) Events & Exhibitions, (6) Fuel Stations, and (7) Retail Outlets & Malls.</p>'
          },
          {
            title: '5. Merchant Mobile App — 7 Features (Slide 56)',
            content: '<ul class="rich-list"><li>Accepts <strong>UPI, Credit Cards, Debit Cards, NetBanking, Pockets, and AEPS</strong> via smartphone.</li><li>Works standalone or with an optional physical POS device.</li><li>Ideal for both <strong>Over-the-Counter (OTC)</strong> and <strong>home-delivery</strong> payment collection via SMS/payment link.</li><li><strong>Sub-merchant login option</strong> for delivery staff/cashiers without giving access to main account withdrawals.</li><li>Direct, automated settlement into the merchant\'s HDFC Current Account.</li><li><strong>No daily or monthly collection limits</strong> (unlike personal savings UPI caps).</li><li>Complete in-app digital transaction history and settlement reports.</li></ul>'
          }
        ]
      },
      {
        type: 'video_placeholder',
        id: 'vid_ca_suite',
        badge: 'VIDEO EMBED SLOT 02 · MODULE 3',
        title: 'Current Account Digital Suite: CIB, Doorstep Banking & Merchant App',
        duration: '05:15',
        embedUrl: '',
        watchFor: [
          'Pitching Doorstep Banking (DSB) to cash-heavy mandi traders like Mr. Mehta',
          'Showing how Merchant Mobile App sub-merchant logins empower delivery boys safely',
          'Demonstrating Maker-Checker bulk salary & GST payments on Corporate Internet Banking'
        ]
      },
      {
        type: 'quiz_match',
        id: 'm3_qc1',
        title: 'Module 3 · Quick Check 1: Match Facility to Business Need (Slide 57)',
        options: ['Payment Gateway (PG)', 'Doorstep Banking (DSB)', 'Merchant Mobile App', 'Corporate Internet Banking (CIB)', 'POS EDC Terminal'],
        pairs: [
          { left: '1. An e-commerce website selling apparel across India needs online checkout.', answer: 'Payment Gateway (PG)' },
          { left: '2. A wholesale grain trader in a mandi collects heavy cash & cheques daily.', answer: 'Doorstep Banking (DSB)' },
          { left: '3. A bakery with 5 home-delivery riders wants staff to collect UPI/card payments at customers\' doors.', answer: 'Merchant Mobile App' },
          { left: '4. A mid-sized company\'s finance team needs bulk salary upload, GST payment & dual Maker-Checker approval.', answer: 'Corporate Internet Banking (CIB)' },
          { left: '5. A busy restaurant & retail store counter needs instant physical card swipe/tap acceptance.', answer: 'POS EDC Terminal' }
        ]
      },
      {
        type: 'quiz_mcq',
        id: 'm3_qc2',
        title: 'Module 3 · Quick Check 2: Apply It Scenarios (Slides 58–59)',
        questions: [
          {
            q: '1. The secretary of a registered Housing Society / Club wants to open a Current Account. Are Clubs/Societies eligible for a Current Account?',
            options: [
              'No, only Private Limited companies can open Current Accounts',
              'Yes, Associations, Clubs, Trusts, Societies, HUFs, Sole Proprietors & Companies are all eligible',
              'Only if they apply for a Fixed Deposit first'
            ],
            correct: 1,
            explanation: 'Slide 46: Associations, Clubs, Societies, Trusts, HUFs, Sole Proprietors, Partnerships, and Companies are all eligible.'
          },
          {
            q: '2. A distributor supplies goods across 12 cities and wants buyers to deposit cheques locally with fast realization and anywhere access. Which Current Account advantages solve this?',
            options: [
              'Anywhere Banking across India + Doorstep Banking quick outstation cheque realisation',
              'Kids Savings Account standing instructions',
              'Tax Saver Fixed Deposit'
            ],
            correct: 0,
            explanation: 'Slides 45 & 53: Anywhere Banking and Doorstep Banking provide multi-city access and fast local/outstation cheque clearing.'
          },
          {
            q: '3. Why does HDFC Bank actively prioritize acquiring healthy Current Account relationships?',
            options: [
              'Because the bank pays 7% interest on Current Accounts',
              'Because Current Accounts carry zero interest cost, build low-cost CASA float, and generate fee/cross-sell revenue',
              'Because Current Accounts have no KYC requirements'
            ],
            correct: 1,
            explanation: 'Slide 49: Current Accounts incur zero interest expense for the bank while generating CASA float, fee income, and cross-sell opportunities.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 4: MODULE 4 — TERM DEPOSIT / FIXED DEPOSIT (Slides 60-77)
  // =========================================================================
  {
    id: 'ch4',
    num: 'M4',
    shortTitle: 'M4 · Term Deposits',
    title: 'Module 4: Term Deposits (Fixed & Recurring)',
    subtitle: 'Payout Options, Worked Compounding Dates, TDS Rules, Tax Saver FD & KYC Sorter',
    blocks: [
      {
        type: 'card',
        tag: 'Three Pillars · Slide 61',
        heading: 'Three Main Concepts of a Term Deposit',
        bullets: [
          '<strong>01 · Type of Deposit:</strong> Regular Fixed Deposit, Tax Saver Fixed Deposit (5-year lock-in), or Recurring Deposit (monthly instalments).',
          '<strong>02 · Interest Pay-out Options:</strong> Reinvestment (Cumulative), Quarterly Payout, or Monthly Payout.',
          '<strong>03 · Maturity Instruction:</strong> Auto-renew Principal & Interest, Auto-renew Principal & Repay Interest, or Do Not Renew.'
        ]
      },
      {
        type: 'image',
        src: 'assets/m4_fd_payouts.png',
        alt: 'Term Deposit Payout Structures and TDS Thresholds',
        caption: 'Fig 4.1 · Reinvestment vs. Quarterly vs. Monthly Payouts & TDS Rules (Slides 62–69)'
      },
      {
        type: 'image',
        src: 'assets/m4_fd_worked_example.png',
        alt: 'Worked Reinvestment Timeline and Tax Saver FD Rules',
        caption: 'Fig 4.2 · Exact Quarterly Compounding Dates (18 Sep 2025 → 17 Dec 2025 → 17 Mar 2026) & Tax Saver Rules'
      },
      {
        type: 'accordion',
        tag: 'Deep Dive · Slides 62–67',
        heading: 'Payout Mechanics, Worked Date Calculations & Core FD Rules',
        items: [
          {
            title: 'Concept 1: Reinvestment / Compounding / Cumulative (Slide 62)',
            content: '<ul class="rich-list"><li>Interest is <strong>compounded quarterly</strong> and paid together with principal at maturity (giving the highest effective yield).</li><li><strong>Worked Date Example:</strong> If an FD is booked on <strong>18 Sep 2025</strong>, Quarter 1 completes on <strong>17 Dec 2025 (91 days)</strong>; Quarter 2 completes on <strong>17 Mar 2026 (90 days)</strong>, and so on.</li><li><strong>365-Day Denominator:</strong> Interest is calculated on an actual/365-day basis (even in a leap year).</li><li><strong>Broken Period Rule:</strong> For any residual broken period at maturity less than a full quarter, simple interest is paid on the compounded principal.</li><li><strong>Post-TDS Compounding:</strong> Wherever TDS is deducted on 31 March, subsequent compounding runs on the net post-TDS balance.</li></ul>'
          },
          {
            title: 'Concept 2: Quarterly Interest Payout — Anniversary vs. Calendar (Slide 63)',
            content: '<ul class="rich-list"><li>Interest is paid out every quarter directly to the customer\'s CASA—<strong>no compounding</strong> takes place.</li><li><strong>Anniversary Option:</strong> Payouts follow the booking date. Example: FD booked on <strong>25 Mar 2025</strong> pays interest on <strong>25 Jun 2025, 25 Sep 2025, and 25 Dec 2025</strong>.</li><li><strong>Calendar Option:</strong> Payouts align to financial quarters (31 Mar, 30 Jun, 30 Sep, 31 Dec). Example: FD booked on <strong>25 Mar 2025</strong> receives its first broken payout on <strong>31 Mar 2025 (covering 6 days)</strong>, followed by <strong>30 Jun 2025</strong> and <strong>30 Sep 2025</strong>.</li></ul>'
          },
          {
            title: 'Concept 3: Monthly Interest Payout — 1/12 Rule (Slide 64)',
            content: '<ul class="rich-list"><li>Requires a <strong>minimum deposit duration of 12 Months</strong>.</li><li>Calculated using the <strong>1/12th rule</strong> at a slightly discounted interest rate (to account for monthly cash outflow vs. quarterly rest) with <strong>no compounding</strong>.</li><li>Available in both <strong>Anniversary</strong> (e.g., 15 Mar → 15 Apr) and <strong>Calendar</strong> (last day of every month, e.g., 31 Mar) modes.</li></ul>'
          },
          {
            title: 'Maturity Instructions & CASA Linking (Slide 65)',
            content: '<ul class="rich-list green"><li><strong>Option 1 · Renew Principal & Interest (Most Preferred):</strong> Full maturity amount is auto-renewed for the same tenure at prevailing rate.</li><li><strong>Option 2 · Renew Principal & Repay Interest:</strong> Principal auto-renews while earned interest is credited to linked CASA.</li><li><strong>Option 3 · Do Not Renew:</strong> Principal + interest credited to linked HDFC Savings/Current Account or paid via DD/PO.</li><li><em>Note:</em> Customers can link a CASA account held in <strong>any HDFC Bank branch</strong> across India.</li></ul>'
          },
          {
            title: 'Premature Withdrawal, Card Rate, Value Date & 365-Day Formula (Slides 66–67)',
            content: '<ul class="rich-list"><li><strong>Premature Withdrawal:</strong> Allowed on standard callable FDs; attracts a <strong>1% penalty</strong> on the applicable rate for the actual run period. <strong>Senior & Super Senior Citizens have NO premature withdrawal penalty</strong> (on retail domestic deposits).</li><li><strong>Partial Withdrawal:</strong> Permitted in multiples of ₹1,000; balance continues to earn original contracted rate.</li><li><strong>Exclusions:</strong> <strong>NO premature or partial withdrawal</strong> is allowed in <strong>Tax Saver FDs</strong> or <strong>Non-Callable FDs</strong>.</li><li><strong>Applicable Rate & Card Rate:</strong> Rate on Value Date applies; Retail Card Rate applies to deposits <strong>&lt; ₹3 Crore</strong> (bulk rates apply for ₹3 Crore & above).</li><li><strong>Value Date:</strong> Date from which interest starts accruing (clearing date for cheques; receipt date for cash/transfer).</li></ul>'
          }
        ]
      },
      {
        type: 'card',
        tag: 'Taxation, Nomination & Special FDs · Slides 68–74',
        heading: 'TDS Rules, Nomination, Tax Saver FD & Recurring Deposit',
        bullets: [
          '<strong>TDS Applicability (Slides 68–69):</strong> Standard TDS rate is <strong>10%</strong> when aggregate FD/RD interest across the bank in a financial year exceeds <strong>₹50,000 for Resident Individuals</strong> or <strong>₹1,00,000 for Senior Citizens (60+)</strong>. Deducted at payout and on accrued interest as of <strong>31 March</strong>.',
          '<strong>NRI TDS & Form 121 / No-PAN Penalty:</strong> NRIs (NRO FDs) attract TDS under <strong>Section 195</strong> (with no threshold exemption). Eligible resident customers can submit <strong>Form 121</strong> (15G/15H declaration) for NIL TDS—<em>however, if PAN is not provided, TDS is deducted at <strong>20%</strong> even if Form 121 is submitted!</em>',
          '<strong>Nomination in Term Deposits (Slides 70–72):</strong> Can be registered (1) at deposit booking, (2) after FD receipt issuance, or (3) by survivor on death of a joint holder. Always advise nomination; document refusal in AOF if declined; issue acknowledgement. Even a <strong>sole proprietary concern</strong> can nominate; only <strong>individuals</strong> can be nominees; multiple nominees (up to 4) allowed.',
          '<strong>Tax Saver Fixed Deposit (Slide 73):</strong> Deposit <strong>₹100 to ₹1,50,000</strong> (in multiples of ₹100) for a strict <strong>5-year lock-in</strong> under <strong>Section 80C</strong>. Tax benefit applies <strong>ONLY to the First Holder</strong> in joint deposits. Calendar option only for monthly/quarterly payouts. <strong>Cannot be prematurely closed, partially withdrawn, or lien-marked for a loan/OD</strong>. FD receipt serves as Section 80C tax proof.',
          '<strong>Recurring Fixed Deposit — RD (Slide 74):</strong> Ideal for disciplined monthly savings via fixed monthly instalments, <strong>Auto Debit Facility</strong> from CASA, <strong>No Penalty</strong> on delayed/missed monthly instalment rules as per product terms, flexible tenure, <strong>Loan/OD against RD</strong>, high FD-equivalent interest rates, and instant booking via NetBanking/MobileBanking.'
        ]
      },
      {
        type: 'quiz_blanks',
        id: 'm4_qc1',
        title: 'Module 4 · Quick Check 1: Fill in the Blanks (Slide 75)',
        wordBank: ['10%', '121', '20%', '80C', '12'],
        items: [
          { prompt: '1. Standard TDS on resident FD interest exceeding the annual threshold is __________.', answer: '10%' },
          { prompt: '2. Eligible customers whose total income is below taxable limits can submit Form __________ for NIL TDS deduction.', answer: '121' },
          { prompt: '3. If a customer fails to furnish a valid PAN, TDS is deducted at __________ even if Form 121 is submitted.', answer: '20%' },
          { prompt: '4. Tax Saver Fixed Deposits offer income tax deduction up to ₹1,50,000 under Section __________ with a 5-year lock-in.', answer: '80C' },
          { prompt: '5. A Monthly Interest Payout Fixed Deposit requires a minimum tenure of __________ months.', answer: '12' }
        ]
      },
      {
        type: 'quiz_mcq',
        id: 'm4_qc2',
        title: 'Module 4 · Quick Check 2: True or False (Slide 76)',
        questions: [
          {
            q: '1. True or False: In a joint Tax Saver Fixed Deposit, both the First Holder and the Second Holder can claim Section 80C tax deduction.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Slide 73: Income tax benefit under Section 80C is available ONLY to the First Holder.'
          },
          {
            q: '2. True or False: Senior Citizens face no premature withdrawal penalty on domestic retail Fixed Deposits.',
            options: ['True', 'False'],
            correct: 0,
            explanation: 'True! Slide 66: While regular customers incur a 1% penalty, Senior & Super Senior Citizens have NO premature withdrawal penalty.'
          },
          {
            q: '3. True or False: A customer can take an Overdraft / Loan against a 5-Year Tax Saver Fixed Deposit during the lock-in period.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Slide 73: A Tax Saver FD cannot be lien-marked or pledged for any loan/OD during its 5-year lock-in.'
          }
        ]
      },
      {
        type: 'kyc_sorter',
        id: 'm4_kyc_sorter',
        title: 'Final Knowledge Check · KYC Document Sorter (Slide 77)',
        instruction: 'Classify each document below as either <strong>Valid as OVD Address Proof</strong> or <strong>Not Valid as OVD Address Proof</strong> for opening a bank account:',
        docs: [
          { name: '1. Valid Indian Passport', valid: true, note: 'Valid OVD for both Identity & Address Proof.' },
          { name: '2. Aadhaar Card', valid: true, note: 'Valid OVD for both Identity & Address Proof.' },
          { name: '3. PAN Card', valid: false, note: 'Valid for Identity & Tax (PAN), NOT valid as Address Proof!' },
          { name: '4. Voter Identity Card (EPIC)', valid: true, note: 'Valid OVD for both Identity & Address Proof.' },
          { name: '5. Valid Driving Licence', valid: true, note: 'Valid OVD for both Identity & Address Proof.' },
          { name: '6. College / Employer ID Card', valid: false, note: 'Not an Officially Valid Document (OVD) for address proof.' },
          { name: '7. Credit Card Monthly Statement', valid: false, note: 'Not accepted as primary OVD address proof for standard KYC.' }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 5: MODULE 5 — SALES MINDSET & OVERCOMING FEARS (Slides 78-86)
  // =========================================================================
  {
    id: 'ch5',
    num: 'M5',
    shortTitle: 'M5 · Sales Mindset',
    title: 'Module 5: Sales Mindset & Overcoming Apprehensions',
    subtitle: 'Understanding Buyer Psychology, Conquering 5 Fears of Selling & Core Sales Definitions',
    blocks: [
      {
        type: 'think',
        title: 'Part 2 Opening Reflection (Slides 78–80)',
        prompt: '1) Think of something you bought recently—what made you buy it?  2) When did you last hesitate to ask for something because you feared hearing "No"?  3) What words come to mind when you hear "Sales"?',
        hint: 'People buy when a product solves a real need and they trust the advisor. Great sales is a helpful conversation—never pushy coercion.'
      },
      {
        type: 'image',
        src: 'assets/m5_sales_mindset.png',
        alt: 'Overcoming 5 Common Fears of Selling',
        caption: 'Fig 5.1 · Turning the 5 Apprehensions of Selling into Winning Consultative Habits (Slides 81–83)'
      },
      {
        type: 'card',
        tag: 'Mindset Mastery · Slides 81–85',
        heading: 'How Fear Impacts Sales — And How to Overcome All 5 Fears',
        body: '<p><strong>4 Ways Fear Hurts Performance (Slide 81):</strong> Fear (1) blocks you from initiating conversations, (2) makes body language tense and unconvincing, (3) prevents you from asking closing questions, and (4) causes you to give up after a single objection.</p>',
        table: {
          headers: ['Common Fear / Apprehension', 'Practical Solution to Overcome It'],
          rows: [
            ['1. Making a negative first impression', 'Focus on open posture, warm smile, neat grooming, and attentive nonverbal signals.'],
            ['2. Fear of being rejected ("No")', 'Reframe "No" as feedback on the pitch or timing—never a personal rejection.'],
            ['3. Fear of sounding pushy', 'Hold a genuine two-way conversation focused on customer needs rather than monologuing.'],
            ['4. Fear that you won\'t deliver', 'Take accurate notes, set honest expectations, and honour every post-sale follow-up commitment.'],
            ['5. Not knowing if you\'re doing it right', 'Step out of your comfort zone, use the 6-step structure, and seek coaching feedback.']
          ]
        },
        callout: {
          type: 'tip',
          text: '<strong>Core Definitions (Slides 84–85):</strong><br>• <strong>Selling:</strong> The art of <em>persuading</em> and <em>influencing</em> a customer to make an informed <em>purchase</em> decision.<br>• <strong>Sales:</strong> A mutually beneficial transaction between a <em>Buyer</em> and a <em>Seller</em> in which <em>goods or services</em> are exchanged for <em>money or other assets</em>.'
        }
      },
      {
        type: 'quiz_blanks',
        id: 'm5_qc1',
        title: 'Module 5 · Quick Check: Fill in the Blanks with Word Bank (Slide 86)',
        wordBank: ['purchase', 'seller', 'assets', 'rejected', 'conversation'],
        items: [
          { prompt: '1. Selling is the process of persuading and influencing a prospect to make a __________.', answer: 'purchase' },
          { prompt: '2. A sale takes place between a buyer and a __________.', answer: 'seller' },
          { prompt: '3. In a sales transaction, goods or services are exchanged for money or other __________.', answer: 'assets' },
          { prompt: '4. Instead of fearing being __________, treat a "No" as helpful feedback on your pitch.', answer: 'rejected' },
          { prompt: '5. To avoid sounding pushy, approach the customer with a genuine two-way __________.', answer: 'conversation' }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 6: MODULE 6 — ART & SCIENCE OF THE SALES PROCESS (Slides 87-99)
  // =========================================================================
  {
    id: 'ch6',
    num: 'M6',
    shortTitle: 'M6 · Sales Process',
    title: 'Module 6: Art & Science of the Sales Process',
    subtitle: 'Stage 1 Preparation & Phone Script, Stage 2 Six-Step Call (Role-Play) & Stage 3 Analysis',
    blocks: [
      {
        type: 'image',
        src: 'assets/m6_sales_process.png',
        alt: '3 Macro Stages and 6-Step Sales Call',
        caption: 'Fig 6.1 · The 3 Macro Sales Stages & 6-Step Execution Blueprint (Slides 88–98)'
      },
      {
        type: 'image',
        src: 'assets/m6_phone_script.png',
        alt: '6-Part Phone Call Blueprint for Fixing an Appointment',
        caption: 'Fig 6.2 · Six-Part Telephone Script for Fixing Customer Appointments (Slide 90)'
      },
      {
        type: 'card',
        tag: 'Stage 1 · Preparation (Slides 88–90)',
        heading: 'Stage 1: Preparation & The 6-Part Appointment Phone Script',
        bullets: [
          '<strong>4 Preparation Steps:</strong> (1) Research customer/segment profile and existing relationship, (2) Carry updated brochures, AOFs, tariff sheets & digital tablet, (3) Plan opening benefit hook & discovery questions, (4) Fix a confirmed appointment by phone.',
          '<strong>6-Part Phone Call Script for Fixing an Appointment (Slide 90):</strong><br>1. <em>Introduction:</em> State your name, role, and HDFC Bank clearly.<br>2. <em>Pleasantries:</em> Greet warmly and ask if it is a convenient 2-minute moment to speak.<br>3. <em>Reference:</em> Mention the referral source, branch relationship, or business locality.<br>4. <em>General Benefit Statement:</em> Share a crisp value hook (e.g., faster collections / higher idle-cash yield).<br>5. <em>Fix & Reconfirm Appointment:</em> Offer two specific time slots and repeat the confirmed date, time, and venue.<br>6. <em>Close the Call:</em> Thank the customer politely and reconfirm your contact number.'
        ]
      },
      {
        type: 'video_placeholder',
        id: 'vid_sales_sixstep',
        badge: 'VIDEO EMBED SLOT 03 · SLIDES 1 & 91',
        title: 'Role-Play: Running the Six-Step Sales Call (Radha & Mr. Khanna)',
        duration: '06:20',
        embedUrl: '',
        watchFor: [
          'How Radha transitions smoothly from warm pleasantries into open discovery questions',
          'Presenting solutions using the FAB (Feature → Advantage → Benefit) method',
          'Handling Money, Trust, and Time objections calmly before asking for the close'
        ]
      },
      {
        type: 'accordion',
        tag: 'Stage 2 · Execution (Slides 91–97)',
        heading: 'All 6 Steps of the Sales Call with Radha & Mr. Khanna Dialogue',
        items: [
          {
            title: 'Step 1: Introduction & Step 2: Pleasantry (Slide 92)',
            content: '<p><strong>Objective:</strong> Establish credibility immediately and build warm rapport before discussing banking.</p><div class="dialogue-box"><div class="msg rm"><span class="msg-speaker">Radha (HDFC RM)</span>"Good morning Mr. Khanna! I\'m Radha from HDFC Bank\'s MG Road branch. Thank you for sparing 15 minutes today. Congratulations on expanding your showroom floor—the new display looks fantastic!"</div><div class="msg cust"><span class="msg-speaker">Mr. Khanna (Customer)</span>"Thank you, Radha! Yes, festive footfall has been keeping us quite busy."</div></div>'
          },
          {
            title: 'Step 3: Identifying Customer Needs — 5 Indicative Questions (Slide 93)',
            content: '<p>Ask open-ended questions and listen actively (80% listening, 20% talking):</p><ul class="rich-list"><li>1. "How do you currently manage your daily business collections and supplier payouts?"</li><li>2. "What challenges do you face with cheque clearing or digital customer payments?"</li><li>3. "How much idle balance typically sits in your operating account between stock cycles?"</li><li>4. "Are you planning any expansion, equipment purchase, or tax-saving investments this quarter?"</li><li>5. "What matters most to you in a banking partner—speed, doorstep support, or yield?"</li></ul>'
          },
          {
            title: 'Step 4: Offering the Solution via FAB Framework (Slide 94)',
            content: '<p>Never dump raw product specs—translate every <strong>Feature</strong> into an <strong>Advantage</strong> and a personal <strong>Benefit</strong>:</p><div class="callout tip"><strong>Deck FAB Illustration (Television Example):</strong><br>• <em>Feature:</em> 4K Ultra-HD Anti-Glare OLED Panel.<br>• <em>Advantage:</em> Eliminates window reflections and sharpens contrast in bright living rooms.<br>• <em>Benefit to You:</em> Your family enjoys cinema-grade cricket & movie nights without eye strain, even during afternoon matches.<br><strong>Banking FAB Application:</strong> Auto-Sweep (Money Maximizer) [Feature] → Automatically moves surplus above threshold into high-yield FD while keeping liquidity [Advantage] → Your idle shop cash earns FD returns without blocking supplier payments [Benefit].</div>'
          },
          {
            title: 'Step 5: Handling Objections — Money, Trust & Time (Slide 95)',
            content: '<p>Welcome objections as buying signals using <strong>Listen → Empathize → Clarify → Confirm</strong>:</p><ul class="rich-list red"><li><strong>1. Money / Cost Objection ("Your MAB / charges seem high"):</strong> Show how free digital/cash limits and auto-sweep interest outweigh fees and save working capital.</li><li><strong>2. Trust Objection ("I\'ve banked with my old bank for 10 years"):</strong> Respect their existing relationship; suggest starting with one specific pain-point solution (e.g., Merchant QR / DSB) to experience service quality first.</li><li><strong>3. Time Objection ("I\'m too busy right now"):</strong> Offer paperless digital onboarding / doorstep document pickup at their shop in under 10 minutes.</li></ul>'
          },
          {
            title: 'Step 6: Closing the Sale — Trial & Direct Closes (Slides 96–97)',
            content: '<p>Look for verbal & nonverbal buying signals (nodding, asking about charges/documents) and ask clearly for the commitment:</p><ul class="rich-list green"><li><strong>Summary Close:</strong> "Since Doorstep Banking and Eazypay QR solve both your evening cash risk and customer UPI queues, shall we start the application right now?"</li><li><strong>Alternative Close:</strong> "Would you prefer linking your existing savings account for sweep-in, or setting up the Current Account with quarterly limits?"</li><li><strong>Next-Step Close:</strong> "If you share your PAN and business registration copy now, I can complete the KYC verification before 4 PM today."</li></ul>'
          }
        ]
      },
      {
        type: 'card',
        tag: 'Stage 3 · Analysis (Slide 98)',
        heading: 'Stage 3: Post-Call Analysis & CRM Discipline',
        bullets: [
          '<strong>Update Sales CRM Immediately:</strong> Log call notes, customer profile insights, product pitched, objections raised, and next follow-up date.',
          '<strong>If Outcome is Positive (Converted):</strong> Verify KYC & AOF completeness, track account activation/funding, deliver welcome kit/digital setup, and ask for <strong>3 to 5 referrals</strong>.',
          '<strong>If Outcome is Non-Conversion:</strong> Reflect on which step stalled (needs discovery vs. objection handling), schedule a value-led follow-up nudge, and keep the lead warm in CRM.'
        ]
      },
      {
        type: 'quiz_match',
        id: 'm6_qc1',
        title: 'Module 6 · Quick Check: Match the Sales Step to the Action (Slide 99)',
        options: ['1. Introduction', '2. Pleasantry', '3. Customer Needs', '4. Offer Solution (FAB)', '5. Handle Objections', '6. Closing the Sale'],
        pairs: [
          { left: 'State your name, designation, and HDFC Bank clearly at the start.', answer: '1. Introduction' },
          { left: 'Compliment the customer\'s newly renovated store to build warmth.', answer: '2. Pleasantry' },
          { left: 'Ask open questions about daily cash collections and supplier payouts.', answer: '3. Customer Needs' },
          { left: 'Connect Auto-Sweep features directly to the customer\'s idle-cash benefit.', answer: '4. Offer Solution (FAB)' },
          { left: 'Address concerns about minimum balance charges calmly with value math.', answer: '5. Handle Objections' },
          { left: 'Ask "Shall we complete your AOF and KYC verification right now?"', answer: '6. Closing the Sale' }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 7: MODULE 7 — ART & SCIENCE OF MANAGED CUSTOMERS (Slides 100-106)
  // =========================================================================
  {
    id: 'ch7',
    num: 'M7',
    shortTitle: 'M7 · Managed Customers',
    title: 'Module 7: Art & Science of Managed Customers',
    subtitle: 'Portfolio Ownership, Referrals, Demand Funnel (20% Conversion), Micro Markets & Life-Stage Fit',
    blocks: [
      {
        type: 'image',
        src: 'assets/m7_demand_funnel.png',
        alt: 'Sales Demand Funnel and Lifecycle Product Fit',
        caption: 'Fig 7.1 · The 4-Tier Demand Funnel (1,000 → ~20%) & Life-Stage Asset/Liability Matrix (Slides 103–105)'
      },
      {
        type: 'card',
        tag: 'Portfolio & Referrals · Slides 101–103',
        heading: 'Managed Customers, Referral Habit & The Demand Funnel',
        bullets: [
          '<strong>5 Pillars of Managed Customers (Slide 101):</strong> (1) Continuously acquire new customers, (2) Actively manage your assigned portfolio set, (3) Act as a trusted <strong>Single Point of Contact (SPOC)</strong>, (4) Deliver proactive service & portfolio reviews, and (5) Drive ethical <strong>cross-selling and up-selling</strong>.',
          '<strong>Customer Referrals (Slide 102):</strong> Ask for referrals from <em>Existing customers</em>, <em>Prospective customers</em>, and <em>Everyone</em> you interact with. <strong>Golden Habit: Always ask for 3 to 5 referrals</strong> after every positive interaction!',
          '<strong>The Demand Funnel (Slide 103):</strong><br>1. <em>Awareness (Market Potential — e.g., 1,000 prospects):</em> Total addressable people/businesses in your catchment.<br>2. <em>Interest (Suspects):</em> Those who engage with your outreach or campaign.<br>3. <em>Desire (Prospects):</em> Qualified leads with an identified need and eligibility.<br>4. <em>Action (Customers — ~20% conversion / ~200):</em> Prospects who convert into active funded accounts.'
        ]
      },
      {
        type: 'card',
        tag: 'Catchment Strategy · Slides 104–105',
        heading: '4 Micro-Market Archetypes & Life-Stage Asset/Liability Rules',
        table: {
          headers: ['Micro-Market Type', 'Dominant Customer Needs & Best-Fit Solutions'],
          rows: [
            ['1. Industrial Area', 'Factory owners, contractors & workers → Current Accounts, CMS/bulk payroll, Employee Salary Accounts, Trade/Working Capital.'],
            ['2. Majority Govt Employees', 'Stable salaried & pensioner households → Regular/Senior Savings, Recurring Deposits, Tax Saver FDs, Home/Personal Loans.'],
            ['3. Businessmen & Traders (Cash Market)', 'Mandis, wholesalers & retail hubs → Current Accounts, Doorstep Banking (DSB), POS/Merchant App QR, Overdrafts.'],
            ['4. IT Hub (Salaried Employees)', 'Tech professionals & young earners → Corporate Salary Accounts, Credit Cards, Personal/Auto Loans, Digital Wealth/FDs.']
          ]
        },
        callout: {
          type: 'tip',
          text: '<strong>Life-Stage Asset vs. Liability Product Rule (Slide 105):</strong><br>• <strong>Liability Products</strong> (Savings, Current, FD, RD — funds deposited by customer with the bank) can be sold across all stages.<br>• <strong>Asset Products</strong> (Home, Auto, Personal, Business Loans & Credit Cards — funds lent by the bank) require <strong>repayment capacity</strong> and a <strong>valid legal contract (age 18+)</strong>.<br>• <em>Early Years (Not Earning):</em> Liability products only.<br>• <em>Earning Years:</em> Both Liability + Asset products.<br>• <em>Retired Years (No Longer Earning):</em> Liability products only (Senior Savings & regular-payout FDs).'
        }
      },
      {
        type: 'quiz_mcq',
        id: 'm7_qc1',
        title: 'Module 7 · Quick Check: Apply It (Slide 106)',
        questions: [
          {
            q: '1. You are assigned a territory dominated by a wholesale grain & spice mandi (cash-heavy traders). Which product bundle should lead your pitch?',
            options: [
              'Kids Savings Account and Education Loans',
              'Current Account with Doorstep Banking (DSB) and Merchant Mobile App / QR',
              'Retired Senior Citizen Pension Plan'
            ],
            correct: 1,
            explanation: 'Slide 104: Businessmen & trader cash markets need Current Accounts, Doorstep Banking for cash/cheque pickup, and digital merchant collection tools.'
          },
          {
            q: '2. A 68-year-old retired school principal with no active employment income asks for a new unsecured personal loan vs. a regular-income deposit. According to the Life-Stage Matrix, what is suitable?',
            options: [
              'Liability products (Senior Citizens Savings Account & Quarterly/Monthly Payout Fixed Deposit)',
              'High-leverage unsecured business asset loans',
              'Kids Minor Account'
            ],
            correct: 0,
            explanation: 'Slide 105: Retired customers without active earning capacity fit Liability products (Senior Savings & payout FDs) rather than new debt-heavy Asset products.'
          },
          {
            q: '3. How many referrals should a banking sales executive aim to request after every positive customer meeting?',
            options: ['Zero—wait for customers to volunteer', '3 to 5 referrals', '50 cold phone numbers'],
            correct: 1,
            explanation: 'Slide 102: Make it a consistent habit to ask for 3 to 5 referrals from existing, prospective, and everyday contacts.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // CHAPTER 8: MODULE 8 — BANKING INDUSTRY: NEW TRENDS & CAPSTONE (Slides 107-129)
  // =========================================================================
  {
    id: 'ch8',
    num: 'M8',
    shortTitle: 'M8 · New Trends & Recap',
    title: 'Module 8: Banking Industry – New Trends & Capstone',
    subtitle: 'Need-Based Selling, UPI/Digital Onboarding, AI & CRM, Omnichannel, Cybersecurity & Final Recap',
    blocks: [
      {
        type: 'card',
        tag: 'Industry Shift · Slides 108–114',
        heading: '6 Macro Trends, Evolving Expectations & New Customer Segments',
        bullets: [
          '<strong>6 Key Trends Shaping Indian Banking (Slide 109):</strong> (1) <em>Digital-first banking</em>, (2) <em>Retail credit growth</em>, (3) <em>CASA and low-cost deposit focus</em>, (4) <em>Financial inclusion</em>, (5) <em>Hyper-personalized banking</em>, and (6) <em>Fintech collaboration</em>.',
          '<strong>Changing Customer Expectations (Slide 111):</strong> Instant speed, 24x7 self-service, transparent pricing, omnichannel continuity, proactive advice, and zero-friction security. <em>Core Truth: "Convenience may attract a customer, but trust and service help retain them."</em>',
          '<strong>How Banking Sales Is Evolving (Slides 112 & 114):</strong> Moving from branch-only product pushing → today\'s digital-assisted advisory → emerging AI-guided omnichannel journeys. <strong>4 Things That Never Change:</strong> Customer trust, compliance & KYC integrity, genuine need discovery, and human empathy.',
          '<strong>7 High-Opportunity Customer Segments (Slide 113):</strong> (1) Students & first-jobbers, (2) Salaried professionals, (3) Growing families, (4) Small merchants & kirana stores, (5) Self-employed professionals (doctors, CAs, consultants), (6) Senior citizens, and (7) Existing bank customers (cross-sell/upgrade).'
        ]
      },
      {
        type: 'image',
        src: 'assets/m8_need_vs_product.png',
        alt: 'Product-Led Pitch vs Need-Based Selling',
        caption: 'Fig 8.1 · Shifting from Product-Led Pitching to Need-Based Consultative Discovery (Slide 110)'
      },
      {
        type: 'card',
        tag: 'Consultative Dialogue · Slide 110',
        heading: 'From Product Selling to Need-Based Selling (3 Side-by-Side Shifts)',
        table: {
          headers: ['Product-Led Pitch (Avoid)', 'Need-Based Consultative Question (Use This)'],
          rows: [
            ['"Sir, open a Fixed Deposit with us today."', '"When might you need this surplus money back, and what goal are you saving it for?"'],
            ['"We have a great Credit Card offer for you."', '"How do you currently manage your monthly travel, utility, and household spends?"'],
            ['"Would you like to open a Current Account?"', '"How are you currently receiving customer payments and tracking business expenses?"']
          ]
        }
      },
      {
        type: 'accordion',
        tag: 'Digital, AI, CRM & Omnichannel · Slides 115–120',
        heading: 'Digital Payments, Paperless Onboarding, AI & CRM-Led Selling',
        items: [
          {
            title: '1. Digital Payments Creating Sales Opportunities (Slide 115)',
            content: '<p>Explosion of <strong>UPI, QR codes, and merchant solutions</strong> creates natural conversation starters. <em>Illustrative Case:</em> A neighbourhood retailer is accepting high-volume customer UPI payments into a personal Savings Account—exposing them to personal tax/audit mix-ups and transaction caps. Solution: Upgrade them to a dedicated <strong>Current Account + Merchant QR/Soundbox</strong>!</p>'
          },
          {
            title: '2. Mobile Banking & Self-Service (Slide 116)',
            content: '<p>Customers now open FDs/RDs, pay bills, block/manage cards, and check statements on MobileBanking. <strong>Your Role:</strong> Educate and onboard customers onto the app during account opening so they experience instant convenience and stay sticky with the bank.</p>'
          },
          {
            title: '3. Digital Onboarding & Paperless e-KYC (Slide 117)',
            content: '<p>Video KYC, biometric/OTP e-KYC, and real-time application status tracking cut turnaround time dramatically. <strong>Critical Compliance Rule:</strong> Digital onboarding still requires full customer consent, accurate profiling, and OVD verification—<em>digital speed never bypasses KYC rules or guarantees automatic approval</em>.</p>'
          },
          {
            title: '4. Artificial Intelligence in Banking (Slide 118)',
            content: '<ul class="rich-list"><li><strong>5 AI Use Cases:</strong> (1) Next-best-product lead scoring, (2) Real-time fraud & AML anomaly alerts, (3) 24x7 conversational chatbots, (4) Credit underwriting assistance, and (5) Personalized financial nudges.</li><li><strong>Human Judgment Rule:</strong> AI highlights patterns, but <em>only a human banker brings empathy, ethical judgment, and trust</em> to close complex decisions.</li></ul>'
          },
          {
            title: '5. Data Analytics & CRM-Led Selling (Slide 119)',
            content: '<p><strong>5 CRM Steps:</strong> (1) Review CRM trigger/lead, (2) Check existing holdings & balances, (3) Prepare tailored need question, (4) Conduct outreach & log outcome, (5) Track follow-up. <em>Example:</em> CRM flags a Corporate Salary customer whose balance has grown steadily for 6 months → reach out to discuss goal-based RD/FD or emergency liquidity.</p>'
          },
          {
            title: '6. Omnichannel Banking & Hybrid Sales (Slide 120)',
            content: '<p>Customers move seamlessly across <strong>4 Channels</strong>: (1) <em>Physical Branch</em>, (2) <em>Online / Mobile App</em>, (3) <em>WhatsApp Banking</em>, and (4) <em>Phone Banking</em>. A customer may discover an FD rate on WhatsApp, compare on the app, ask a question on phone banking, and finalize nomination at the branch.</p>'
          }
        ]
      },
      {
        type: 'image',
        src: 'assets/m8_omnichannel_safe.png',
        alt: 'Omnichannel Hybrid Banking and Zero-OTP Security Shield',
        caption: 'Fig 8.2 · Four Omnichannel Touchpoints & Golden Cybersecurity Rule (Slides 120–121)'
      },
      {
        type: 'video_placeholder',
        id: 'vid_digital_safe',
        badge: 'VIDEO EMBED SLOT 04 · MODULE 8',
        title: 'Demonstrating Mobile Banking, e-KYC & Safe Digital Banking Habits',
        duration: '04:45',
        embedUrl: '',
        watchFor: [
          'Guiding a new customer through MobileBanking / WhatsApp Banking activation',
          'Explaining why HDFC Bank NEVER asks for OTPs, PINs, CVVs, or passwords',
          'Spotting and warning customers about phishing links and screen-sharing scams'
        ]
      },
      {
        type: 'card',
        tag: 'Cybersecurity, Competition & Future Skills · Slides 121–125',
        heading: 'Safe Digital Banking, Market Competition & 8 Future Sales Skills',
        table: {
          headers: ['Cybersecurity Risks (Slide 121)', 'Your Role in Safe Digital Banking'],
          rows: [
            ['Phishing SMS / fake KYC update links', 'Educate customers to use only official HDFC Bank apps/portals'],
            ['Vishing calls asking for OTP / CVV / PIN', 'State clearly: Bank staff NEVER ask for OTPs, PINs, or passwords'],
            ['Remote screen-sharing malware apps', 'Warn customers never to install screen-share apps from unknown callers'],
            ['Public Wi-Fi & unsecured devices', 'Advise strong device locks, biometric login & official app stores'],
            ['Mule account & QR scan-to-receive scams', 'Clarify that scanning a QR/entering UPI PIN always DEBITS money']
          ]
        },
        bullets: [
          '<strong>Increasing Competition (Slides 122–123):</strong> Competing against PSU banks, private peers, Small Finance Banks, NBFCs, and Fintech apps. <strong>How YOU Respond:</strong> Lead with advisory trust, faster turnaround, complete ecosystem bundling (CASA + Cards + Loans + Merchant), and responsive post-sale service.',
          '<strong>Trust, Compliance & Responsible Selling (Slide 124):</strong> Never mis-sell, never hide fees/lock-in terms (e.g., Tax Saver FD 5-year lock-in), never force unwanted bundles, and always obtain explicit customer consent.',
          '<strong>8 Future Skills for a Banking Sales Executive (Slide 125):</strong> (1) <em>Product Knowledge</em>, (2) <em>Customer Discovery</em>, (3) <em>Communication & Storytelling</em>, (4) <em>Digital Fluency</em>, (5) <em>Analytical & CRM Thinking</em>, (6) <em>Negotiation & Objection Handling</em>, (7) <em>Ethics & Compliance</em>, and (8) <em>Adaptability</em>.'
        ]
      },
      {
        type: 'quiz_mcq',
        id: 'm8_qc1',
        title: 'Module 8 · Quick Check: True or False (Slide 126)',
        questions: [
          {
            q: '1. True or False: Digital e-KYC onboarding automatically guarantees account approval without customer profiling or OVD verification.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Slide 117: Verification, customer consent, and profiling rules still apply in full.'
          },
          {
            q: '2. True or False: Convenience may attract a customer initially, but trust and reliable service are what retain them long-term.',
            options: ['True', 'False'],
            correct: 0,
            explanation: 'True! Slide 111 highlights this exact principle.'
          },
          {
            q: '3. True or False: To help an elderly customer activate MobileBanking faster, a bank executive should ask the customer to read out their SMS OTP.',
            options: ['True', 'False'],
            correct: 1,
            explanation: 'False! Never ask for or view a customer\'s OTP, PIN, or password under any circumstance.'
          }
        ]
      },
      {
        type: 'flashcards',
        id: 'final_recap_fc',
        title: 'Final Recap: Test Yourself — 6 Core Questions (Slide 127)',
        cards: [
          {
            q: '1. What are the 4 key elements of a bank\'s KYC Policy?',
            a: '(1) Customer Acceptance Policy (CAP), (2) Customer Identification Process (CIP), (3) Monitoring of Transactions, and (4) Risk Management.'
          },
          {
            q: '2. What is the legal role of a nominee under RBI guidelines?',
            a: 'The nominee receives funds upon the depositor\'s death IN TRUST for the legal heirs; nomination does NOT override succession laws or a valid will (up to 4 individuals allowed).'
          },
          {
            q: '3. Why is a Current Account valuable to both a business customer and HDFC Bank?',
            a: 'Customer gets unlimited daily transactions, Anywhere Banking, CIB, DSB & POS/Merchant tools; Bank gets zero-interest CASA float, fee income & cross-sell.'
          },
          {
            q: '4. What are the TDS thresholds and missing-PAN penalty on Fixed Deposits?',
            a: '10% TDS when annual interest exceeds ₹50,000 (Residents) or ₹1,00,000 (Senior Citizens); 20% TDS if PAN is missing (even with Form 121).'
          },
          {
            q: '5. Name the 3 macro stages and 6 execution steps of the sales process.',
            a: 'Stages: Preparation → Execution → Analysis. Execution 6 Steps: (1) Introduction, (2) Pleasantry, (3) Customer Needs, (4) Offer Solution (FAB), (5) Handle Objections, (6) Closing the Sale.'
          },
          {
            q: '6. How does need-based selling differ from product-led selling?',
            a: 'Instead of pushing a product upfront, you ask open discovery questions about goals, liquidity, and cash flow first, then map FAB benefits to the real need.'
          }
        ]
      },
      {
        type: 'card',
        tag: 'Key Takeaways & Official References · Slides 128–129',
        heading: 'Day 2 Key Takeaways & Official HDFC Bank Product Portals',
        bullets: [
          '<strong>Compliance First:</strong> Know your customer beyond documents, follow Maker-Checker & attestation SOPs, and escalate red flags early.',
          '<strong>Right Product Fit:</strong> Match Savings variants, Current Account digital/doorstep suites, and FD/RD structures to life stage and cash flow.',
          '<strong>Consultative & Digital Growth:</strong> Overcome sales fears, run the 6-step call, ask for 3–5 referrals, leverage CRM/omnichannel, and protect customers from cyber fraud.'
        ],
        callout: {
          type: 'tip',
          text: '<strong>Official HDFC Bank Reference Links (Slide 128):</strong><br>• Personal Savings & Accounts: <code>https://www.hdfc.bank.in/savings-account</code><br>• Current Accounts & Business Banking: <code>https://www.hdfc.bank.in/current-account</code><br>• Fixed & Recurring Deposits: <code>https://www.hdfc.bank.in/fixed-deposit</code><br>• Merchant & Payment Solutions: <code>https://www.hdfc.bank.in/business/payment-solutions</code>'
        }
      },
      {
        type: 'action_commitment',
        id: 'final_action_plan',
        title: 'Your Week-1 Action Commitment (Slide 129)',
        prompt: 'Write down ONE product you will offer a customer this week and the THREE need-discovery questions you will ask first:'
      }
    ]
  }
];