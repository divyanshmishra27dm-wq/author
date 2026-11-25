
/**
 * SCORM 2004 (2nd/3rd/4th Edition) API_1484_11 Wrapper with Graceful Local Fallback
 */
var SCORM2004 = (function () {
  let api = null;
  let initialized = false;
  let terminated = false;
  const LOCAL_KEY = 'hdfc_academy_bse_day2_scorm2004_v2';

  function findAPI(win) {
    let attempts = 0;
    while (win && !win.API_1484_11 && win.parent && win.parent !== win && attempts < 15) {
      attempts++;
      win = win.parent;
    }
    return win && win.API_1484_11 ? win.API_1484_11 : null;
  }

  function getAPI() {
    if (api) return api;
    api = findAPI(window);
    if (!api && window.opener) {
      api = findAPI(window.opener);
    }
    return api;
  }

  function init() {
    if (initialized) return true;
    const handle = getAPI();
    if (handle) {
      const res = handle.Initialize('');
      initialized = (res === 'true' || res === true);
      if (initialized) {
        const status = getValue('cmi.completion_status');
        if (!status || status === 'unknown' || status === 'not attempted') {
          setValue('cmi.completion_status', 'incomplete');
        }
        setValue('cmi.exit', 'suspend');
        commit();
      }
    } else {
      initialized = true; // Standalone / preview mode
    }
    return initialized;
  }

  function getValue(param) {
    const handle = getAPI();
    if (handle && initialized && !terminated) {
      return handle.GetValue(param) || '';
    }
    try {
      const store = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      return store[param] || '';
    } catch (e) {
      return '';
    }
  }

  function setValue(param, val) {
    const strVal = String(val);
    const handle = getAPI();
    if (handle && initialized && !terminated) {
      return handle.SetValue(param, strVal) === 'true';
    }
    try {
      const store = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      store[param] = strVal;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      return false;
    }
  }

  function commit() {
    const handle = getAPI();
    if (handle && initialized && !terminated) {
      return handle.Commit('') === 'true';
    }
    return true;
  }

  function finish() {
    if (terminated) return true;
    commit();
    const handle = getAPI();
    if (handle && initialized) {
      const res = handle.Terminate('');
      terminated = (res === 'true' || res === true);
      return terminated;
    }
    terminated = true;
    return true;
  }

  function saveState(stateObj) {
    setValue('cmi.suspend_data', JSON.stringify(stateObj));
    if (stateObj.currentChapter !== undefined) {
      setValue('cmi.location', String(stateObj.currentChapter));
    }
    if (typeof stateObj.progressMeasure === 'number') {
      setValue('cmi.progress_measure', stateObj.progressMeasure.toFixed(2));
    }
    if (typeof stateObj.scoreScaled === 'number') {
      setValue('cmi.score.scaled', stateObj.scoreScaled.toFixed(2));
      setValue('cmi.score.raw', String(Math.round(stateObj.scoreScaled * 100)));
      setValue('cmi.score.min', '0');
      setValue('cmi.score.max', '100');
    }
    if (stateObj.completed) {
      setValue('cmi.completion_status', 'completed');
      setValue('cmi.success_status', stateObj.scoreScaled >= 0.6 ? 'passed' : 'completed');
      setValue('cmi.exit', 'normal');
    }
    commit();
  }

  function loadState() {
    const raw = getValue('cmi.suspend_data');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function isConnected() {
    return !!getAPI();
  }

  return { init, getValue, setValue, commit, finish, saveState, loadState, isConnected };
})();
if (typeof window !== 'undefined') window.SCORM2004 = SCORM2004;
  
;

var COURSE_CHAPTERS = [
  {
    "id": "ch0",
    "num": "00",
    "shortTitle": "Overview & Roadmap",
    "title": "Day 3: Products & Account Opening",
    "subtitle": "CASA  \u2022  Savings & Current Accounts  \u2022  CA Allied Products\nDebit & Credit Cards  \u2022  Documentation  \u2022  Account Opening",
    "blocks": [
      {
        "type": "think",
        "title": "Opening Reflection",
        "prompt": "How can understanding a customer\u2019s needs help you recommend a suitable savings account while also supporting the bank\u2019s CASA growth?",
        "hint": "Consider how clear explanations, responsible product recommendations, and a smooth account-opening experience can build trust and encourage customers to maintain balances."
      },
      {
        "type": "card",
        "tag": "Slide 1",
        "heading": "HDFC ACADEMY  \u2022  BANKING SALES EXCELLENCE",
        "body": "<p>Day 3: Products & Account Opening</p>",
        "bullets": [
          "<strong>CASA  \u2022  Savings & Current Accounts  \u2022  CA Allied Products</strong>",
          "<strong>Debit & Credit Cards  \u2022  Documentation  \u2022  Account Opening</strong>",
          "<strong>WBT</strong>",
          "<strong>10 Modules</strong>",
          "<strong>Sales Executives</strong>",
          "<strong>Product walkthroughs, step-by-step account opening journeys and a knowledge check in every module</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Open the Day 3 WBT and set the focus: knowing the liability, allied and card products well enough to recommend the right one, and opening the account correctly.\n\nFACILITATION GUIDANCE:\n- Welcome learners to Day 3 of Banking Sales Excellence."
        }
      },
      {
        "type": "card",
        "tag": "Slide 2",
        "heading": "Our Roadmap for Today",
        "body": "<p>Ten modules: product knowledge first, then documentation and account opening.</p>",
        "bullets": [
          "<strong>MODULE 1</strong>",
          "<strong>Importance of CASA</strong>",
          "<strong>Liabilities, NIM and CASA growth levers</strong>",
          "<strong>MODULE 2</strong>",
          "<strong>Savings Accounts</strong>",
          "<strong>Regular, Savings Max, Speciale range, Kids</strong>",
          "<strong>MODULE 3</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Give learners a map of Day 3.\n\nFACILITATION GUIDANCE:\n- Modules 1 to 6 build product knowledge: why CASA matters, then Savings Accounts, Current Accounts, CA allied products, Debit Cards and Credit Cards.\n- Modules 7 to 10 cover documentatio"
        }
      },
      {
        "type": "accordion",
        "tag": "Curriculum Objectives \u00b7 Slide 3",
        "heading": "Learning Objectives",
        "items": [
          {
            "title": "IDENTIFY \u2014 Core Outcomes",
            "content": "<ul class=\"rich-list\"><li>Why CASA drives the bank's profitability</li><li>The right Savings or Current Account variant and card for each customer</li><li>The documents needed for each type of non-individual entity</li></ul>"
          },
          {
            "title": "EXPLAIN \u2014 Core Outcomes",
            "content": "<ul class=\"rich-list\"><li>Features, eligibility and benefits of Savings, Current, Debit and Credit Card products</li><li>How CA allied products support business customers</li><li>The rules and steps for each mode of account opening</li></ul>"
          },
          {
            "title": "APPLY \u2014 Core Outcomes",
            "content": "<ul class=\"rich-list\"><li>Recommend and cross-sell products that match the customer's need</li><li>Collect complete, correct documents the first time</li><li>Open accounts through the physical form, Insta Account, SmartApp or Video KYC without errors</li></ul>"
          }
        ]
      }
    ]
  },
  {
    "id": "ch1",
    "num": "M1",
    "shortTitle": "Why CASA deposits matter",
    "title": "Module 1: Importance of CASA: Why CASA deposits matter to the bank, and how every employee helps grow them",
    "subtitle": "Roadmap",
    "blocks": [
      {
        "type": "think",
        "title": "Module 1: Importance of CASA",
        "prompt": "Why CASA deposits matter to the bank, and how every employee helps grow them",
        "hint": "PURPOSE: Signal the start of Module 1.\n\nFACILITATION GUIDANCE:\n- Introduce the module: before learning individual products, we need to know why CASA deposits matter so much to the bank.\n- The THINK question appears on the slide: take two or three responses (aloud or in chat) to connect with the next slide.\n- The \"Roadmap\" button (top right) returns to the roadmap slide.\n\nSUGGESTED ANSWERS / DEBRIEF POINTS:\n- The bank deploys deposits as loans and investments, earning more than it pays out on deposits."
      },
      {
        "type": "card",
        "tag": "Slide 5",
        "heading": "Types of Liabilities in Banking",
        "body": "<p>Where a bank's funds come from</p>",
        "bullets": [
          "<strong>Liabilities are the primary source of funds for the bank.</strong>",
          "<strong>Liabilities</strong>",
          "<strong>Customer Deposits</strong>",
          "<strong>Savings Accounts</strong>",
          "<strong>Savings Accounts</strong>",
          "<strong>CASA \u2713</strong>",
          "<strong>Current Accounts</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Show where a bank's funds come from and how deposits turn into income.\n\nFACILITATION GUIDANCE:\n- Read the definition banner, then walk the hierarchy: liabilities split into customer deposits (in red, the most important group), borrowings, an"
        }
      },
      {
        "type": "card",
        "tag": "Slide 6",
        "heading": "Why Liabilities Matter",
        "body": "<p>Deposits, especially CASA, are the most cost-effective funding source. Lower cost of funds means higher profitability for the bank.</p>",
        "bullets": [
          "<strong>Four reasons a strong deposit base is critical to the bank.</strong>",
          "<strong>LIABILITIES</strong>",
          "<strong>Cheap Source of Funds</strong>",
          "<strong>Cheap Source of Funds</strong>",
          "<strong>Interest Spread</strong>",
          "<strong>Interest Spread</strong>",
          "<strong>Liquidity Management</strong>",
          "<strong>Liquidity Management</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Explain the four ways deposits strengthen the bank.\n\nFACILITATION GUIDANCE:\n- Start with cheap source of funds. This answers the question from the previous slide.\n- Interest spread: explain NIM in simple terms. The bank earns interest on loa"
        }
      },
      {
        "type": "card",
        "tag": "Slide 7",
        "heading": "CASA & Bank Profitability",
        "body": "<p>How the CASA ratio changes the bank's economics.</p>",
        "bullets": [
          "<strong>Particulars</strong>",
          "<strong>High CASA Bank</strong>",
          "<strong>Low CASA Bank</strong>",
          "<strong>Cost of Funds</strong>",
          "<strong>?</strong>",
          "<strong>?</strong>",
          "<strong>Lower</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Compare a high-CASA bank with a low-CASA bank to show why CASA drives profitability.\n\nFACILITATION GUIDANCE:\n- For each row, ask learners to predict Higher or Lower for a high-CASA and a low-CASA bank before you explain the answer.\n- Answers"
        }
      },
      {
        "type": "card",
        "tag": "Slide 8",
        "heading": "Every Employee Drives CASA Growth",
        "body": "<p>Open new Savings and Current Accounts. Generate referrals from existing customers. Every new account strengthens our CASA base.</p>",
        "bullets": [
          "<strong>Four levers every employee can use to grow the CASA base.</strong>",
          "<strong>01</strong>",
          "<strong>Customer Acquisition</strong>",
          "<strong>02</strong>",
          "<strong>Relationship Building</strong>",
          "<strong>Enhance customer experience to increase account activation and usage. A happy customer is a loyal customer.</strong>",
          "<strong>03</strong>",
          "<strong>Cross-Selling</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Show the four practical levers through which every employee contributes to CASA growth.\n\nFACILITATION GUIDANCE:\n- Point to the team illustration: CASA growth is a whole-branch effort, not only the sales team's job.\n- Go through the four leve"
        }
      },
      {
        "type": "quiz_mcq",
        "id": "quiz_s9",
        "title": "Knowledge Check: Importance of CASA",
        "questions": [
          {
            "q": "Which of these is the most cost-effective source of funds for a bank?",
            "options": [
              "Interbank borrowings",
              "Bonds issued",
              "CASA deposits",
              "RBI borrowings"
            ],
            "correct": 2,
            "explanation": "Verified against official bank guidelines in Knowledge Check: Importance of CASA."
          }
        ]
      },
      {
        "type": "kyc_sorter",
        "id": "ai_drag_sorter",
        "title": "KYC Document Sorter",
        "instruction": "Classify each item as Valid or Invalid for the stated KYC purpose. Follow current bank policy and verify documents through the required process.",
        "docs": [
          {
            "name": "A current, unexpired passport verified as an acceptable Officially Valid Document under bank policy",
            "valid": true,
            "note": "A current acceptable document can support KYC verification when checked as required."
          },
          {
            "name": "An expired driving licence submitted as current identity proof",
            "valid": false,
            "note": "An expired document should not be accepted as current identity proof."
          },
          {
            "name": "A PAN card presented for PAN verification",
            "valid": true,
            "note": "Use it for PAN verification in line with the applicable process; it does not by itself establish an address."
          },
          {
            "name": "A handwritten note of an address with no supporting document",
            "valid": false,
            "note": "A handwritten note alone is not supporting address documentation."
          }
        ]
      },
      {
        "type": "quiz_mcq",
        "id": "ai_scenario_quiz",
        "title": "A Needs-Based Account Opening",
        "questions": [
          {
            "q": "A customer visits the branch to open a savings account. They are unsure which product to choose and have not yet provided all required KYC information. What should you do?",
            "options": [
              "Recommend the product with the highest balance requirement without asking about the customer\u2019s needs.",
              "Understand the customer\u2019s banking needs, explain suitable product features and applicable terms, and complete the required KYC process before proceeding.",
              "Open an account immediately and collect any missing KYC information later without following the applicable process.",
              "Promise specific benefits without checking current eligibility, fees, or product terms."
            ],
            "correct": 1,
            "explanation": "A responsible account-opening journey starts with understanding the customer\u2019s needs, explaining relevant features and terms accurately, and following the required KYC and account-opening process."
          }
        ]
      }
    ]
  },
  {
    "id": "ch2",
    "num": "M2",
    "shortTitle": "Know Your Product \u2013 Savi",
    "title": "Module 2: Savings Accounts: Know Your Product \u2013 Saving Bank Account (SB)",
    "subtitle": "Roadmap",
    "blocks": [
      {
        "type": "card",
        "tag": "Slide 10",
        "heading": "Module 2: Savings Accounts",
        "body": "<p>Know Your Product \u2013 Saving Bank Account (SB)</p>",
        "bullets": [
          "<strong>Roadmap</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Signal the start of Module 2: the savings account range.\n\nFACILITATION GUIDANCE:\n- Explain the flow of the module: Regular Savings, Savings Max, the Speciale premium range (Activ, Gold Women's, Platinum & Gold, Senior Citizen) and Super Kids"
        }
      }
    ]
  },
  {
    "id": "ch3",
    "num": "M3",
    "shortTitle": "Regular Savings Account",
    "title": "MODULE 2: Regular Savings Account",
    "subtitle": "Everyday banking with 24x7 access to your bank",
    "blocks": [
      {
        "type": "card",
        "tag": "Slide 11",
        "heading": "MODULE 2  \u2022  SAVINGS ACCOUNTS",
        "body": "<p>Regular Savings Account</p>",
        "bullets": [
          "<strong>Everyday banking with 24x7 access to your bank</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Introduce the Regular Savings Account section.\n\nFACILITATION GUIDANCE:\n- Position the Regular Savings Account as the everyday account; the premium variants that follow build on it."
        }
      },
      {
        "type": "card",
        "tag": "Slide 12",
        "heading": "Regular Savings Account: Key Features",
        "body": "<p>AMB Requirement of Rs.10,000 in Metro and Urban, Rs.5,000 in Semi-Urban and AQB of Rs.2,500 or FD Cushion of Rs.25,000 in Rural</p>",
        "bullets": [
          "<strong>A savings account designed to meet your day to day banking needs while giving you 24X7 access to your bank.</strong>",
          "<strong>Balance Requirement</strong>",
          "<strong>Demat Benefit</strong>",
          "<strong>Waiver on annual maintenance charges on new Demat Account for 1st year</strong>",
          "<strong>ATM Transactions Limits per Month</strong>",
          "<strong>HDFC Bank: Financial 5 free; Non Financial \u2013 Free</strong>",
          "<strong>Non HDFC Bank: 5 free (3 free in top 6 Metros)</strong>",
          "<strong>Debit Card</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Explain the features of the Regular Savings Account.\n\nFACILITATION GUIDANCE:\n- Start with the balance requirement: it changes by branch location (Metro/Urban, Semi-Urban, Rural).\n- Explain FD Cushion: the customer can maintain the requisite "
        }
      },
      {
        "type": "quiz_blanks",
        "id": "ai_blanks_drill",
        "title": "Savings Account Essentials",
        "wordBank": [
          "CASA",
          "Savings Bank Account",
          "KYC",
          "Nomination"
        ],
        "items": [
          {
            "prompt": "Current and savings account deposits are commonly grouped as _______ deposits.",
            "answer": "CASA"
          },
          {
            "prompt": "Before opening an account, the bank completes _______ checks to establish and verify the customer\u2019s identity.",
            "answer": "KYC"
          },
          {
            "prompt": "A _______ allows a customer to name a person who may receive the account proceeds in accordance with applicable rules.",
            "answer": "Nomination"
          }
        ]
      }
    ]
  },
  {
    "id": "ch4",
    "num": "M4",
    "shortTitle": "Savings Max",
    "title": "MODULE 2: Savings Max",
    "subtitle": "Premium benefits with an AMB of just Rs. 25,000",
    "blocks": [
      {
        "type": "card",
        "tag": "Slide 13",
        "heading": "MODULE 2  \u2022  SAVINGS ACCOUNTS",
        "body": "<p>Savings Max</p>",
        "bullets": [
          "<strong>Premium benefits with an AMB of just Rs. 25,000</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Introduce the Savings Max section.\n\nFACILITATION GUIDANCE:\n- Savings Max sits above the Regular account: higher balance, richer debit card and insurance benefits."
        }
      },
      {
        "type": "card",
        "tag": "Slide 14",
        "heading": "Savings Max Account: Key USPs",
        "body": "<p>Metro / Urban: AMB Requirement 25K or FD Relationship of 1.50L      Semi Urban / Rural: AMB Requirement 25K or FD Relationship of 1 L</p>",
        "bullets": [
          "<strong>AMB Requirement of Just Rs.25K | Debit card, account, other product and loan benefits</strong>",
          "<strong>DEBIT CARD BENEFITS</strong>",
          "<strong>Free lifetime Platinum Debit Card for the primary account holder</strong>",
          "<strong>Daily cash withdrawal limit of Rs.\u00a01L & shopping limit of Rs.\u00a05L</strong>",
          "<strong>Up to 1% CashBack on every Platinum Debit Card transaction</strong>",
          "<strong>Unlimited Free ATM transactions on HDFC and Non-HDFC bank ATMs</strong>",
          "<strong>Free lifetime Woman's Advantage/International Debit Card for all account holders</strong>",
          "<strong>Insurance Cover of up to 3.29\u00a0Crs.</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Detail the Savings Max benefits by category so learners can match them to customer needs.\n\nFACILITATION GUIDANCE:\n- Open with the AMB requirement of just Rs. 25K, then walk the four categories: debit card, account, other products and loans.\n"
        }
      },
      {
        "type": "card",
        "tag": "Slide 15",
        "heading": "Savings Max: Eligibility & Balance",
        "body": "<p>Minor above the age of 10 years are eligible to open self operated minor account and an ATM/Debit card can be issued to the Minor</p>",
        "bullets": [
          "<strong>Savings Max Account (contd.): eligibility and minimum balance requirement</strong>",
          "<strong>ELIGIBILITY</strong>",
          "<strong>The following people are eligible to open a SavingsMax Account:</strong>",
          "<strong>Hindu Undivided Families</strong>",
          "<strong>Foreign Nationals Residing in India*</strong>",
          "<strong>MIN. BALANCE REQUIREMENT</strong>",
          "<strong>\u2265 Rs. 25,000 AMB</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Clarify who can open a Savings Max Account and the minimum balance rule.\n\nFACILITATION GUIDANCE:\n- Go through the three eligible categories, then the special condition for foreign nationals.\n- Ask: \"Can a 12-year-old open a self-operated Sav"
        }
      },
      {
        "type": "card",
        "tag": "Slide 16",
        "heading": "Savings Max: TnC",
        "body": "<p>Insurance cover break-up and activation conditions</p>",
        "bullets": null,
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Explain how the Rs. 3.29 Cr insurance cover is made up and what activates each cover.\n\nFACILITATION GUIDANCE:\n- Show that the total (3.29 Cr) = account-level cover (0.11 Cr) + Platinum Debit Card cover (3.18 Cr).\n- Stress the activation cond"
        }
      },
      {
        "type": "quiz_match",
        "id": "ai_match_drill",
        "title": "Match the Customer Need to the Savings Product",
        "options": [
          "Regular Savings Account",
          "Savings Max",
          "Speciale Savings"
        ],
        "pairs": [
          {
            "left": "A customer is looking for a straightforward account for routine savings and everyday banking.",
            "answer": "Regular Savings Account"
          },
          {
            "left": "A customer wants to explore a savings account with enhanced features, subject to current product terms and eligibility.",
            "answer": "Savings Max"
          },
          {
            "left": "A customer is interested in a savings account positioned with premium privileges, subject to current product terms and eligibility.",
            "answer": "Speciale Savings"
          }
        ]
      }
    ]
  },
  {
    "id": "ch5",
    "num": "M5",
    "shortTitle": "Speciale Savings",
    "title": "MODULE 2: Speciale Savings",
    "subtitle": "The premium savings range",
    "blocks": [
      {
        "type": "card",
        "tag": "Slide 17",
        "heading": "MODULE 2  \u2022  SAVINGS ACCOUNTS",
        "body": "<p>Speciale Savings</p>",
        "bullets": [
          "<strong>The premium savings range</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Introduce the Speciale premium savings range.\n\nFACILITATION GUIDANCE:\n- Explain that the Speciale range offers premium, profile-based benefits; the next two slides show the range and why it is worth pitching."
        }
      },
      {
        "type": "card",
        "tag": "Slide 18",
        "heading": "New Premium Savings Offerings",
        "body": "<p>What are the new premium product Savings offerings?</p>",
        "bullets": [
          "<strong>NEW PREMIUM PRODUCTS</strong>",
          "<strong>Speciale Activ A/c (HL Nav Enabler)</strong>",
          "<strong>Speciale Salary A/c (Platinum & Gold)</strong>",
          "<strong>Savings Plus (5 pe 5)</strong>",
          "<strong>Speciale Women\u2019s Gold A/c</strong>",
          "<strong>OTHER PREMIUM PRODUCTS</strong>",
          "<strong>Speciale Premium Savings A/c (Platinum/Gold)</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Give an overview of the premium savings range before going product by product.\n\nFACILITATION GUIDANCE:\n- Separate the new premium products from the other premium products.\n- Use the campaign highlights to show how each product is positioned "
        }
      },
      {
        "type": "card",
        "tag": "Slide 19",
        "heading": "Why Pitch a Speciale Account?",
        "body": "<p>Benefits of pitching a Speciale Savings A/c, for the customer and for the bank</p>",
        "bullets": [
          "<strong>Exclusive benefits as per his profile/profession</strong>",
          "<strong>Higher bundling opportunity</strong>",
          "<strong>2.5 X</strong>",
          "<strong>Higher Average Ticket Size (ATS), in lacs</strong>"
        ],
        "callout": {
          "type": "tip",
          "text": "<strong>Facilitator Insight:</strong> PURPOSE: Show why pitching a Speciale account benefits both the customer and the bank.\n\nFACILITATION GUIDANCE:\n- Customer side: exclusive benefits matched to profile or profession.\n- Bank side: much higher Average Ticket Size (for example, Speciale P"
        }
      }
    ]
  },
  {
    "id": "ch6",
    "num": "M6",
    "shortTitle": "Account Opening",
    "title": "Module 3: Account Opening Journey & Video",
    "subtitle": "Physical and digital account opening workflows & checkpoints",
    "blocks": [
      {
        "type": "video_placeholder",
        "id": "vid_s20",
        "badge": "WALKTHROUGH VIDEO",
        "duration": "4m 30s",
        "title": "How to Open the Physical Account",
        "embedUrl": "media/media1.mp4",
        "watchFor": [
          "Physical Account Opening Form (AOF) step-by-step completion.",
          "Mandatory customer signature verification and OVD self-attestation.",
          "Zero-defect Maker-Checker authorization workflow before dispatch."
        ]
      },
      {
        "type": "video_placeholder",
        "id": "vid_s21",
        "badge": "WALKTHROUGH VIDEO",
        "duration": "6m 15s",
        "title": "One Account Four Checkpoints",
        "embedUrl": "media/media2.mp4",
        "watchFor": [
          "Physical Account Opening Form (AOF) step-by-step completion.",
          "Mandatory customer signature verification and OVD self-attestation.",
          "Zero-defect Maker-Checker authorization workflow before dispatch."
        ]
      },
      {
        "type": "action_commitment",
        "id": "action_s22",
        "title": "Course Completion & Action Commitment",
        "prompt": "Commit to your top sales priorities and need-discovery questions for account opening this week:"
      }
    ]
  }
];
window.COURSE_CHAPTERS = COURSE_CHAPTERS;
window.COURSE_CHAPTERS_DAY2 = COURSE_CHAPTERS;
  
;

/**
 * HDFC Academy Day 2 — Mobile-First SCORM 2004 Interactive Engine
 */
(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isDay3 = urlParams.get('course') === 'day3';
  const COURSE_CHAPTERS = (isDay3 && window.COURSE_CHAPTERS_DAY3)
    ? window.COURSE_CHAPTERS_DAY3
    : (window.COURSE_CHAPTERS_DAY2 || window.COURSE_CHAPTERS || []);

  if (!COURSE_CHAPTERS || !COURSE_CHAPTERS.length) {
    console.error('Course data not found!');
    return;
  }

  if (isDay3) {
    document.title = "HDFC Academy · Day 3: Know Your Product — CASA & Savings Mastery";
    const kicker = document.querySelector('.drawer-kicker');
    if (kicker) kicker.textContent = "DAY 3 CURRICULUM";
  }

  const scormApi = (typeof window !== 'undefined' && window.SCORM2004)
    ? window.SCORM2004
    : (typeof SCORM2004 !== 'undefined' ? SCORM2004 : {
        init: () => true,
        loadState: () => null,
        saveState: () => {},
        finish: () => {},
        isConnected: () => false
      });

  scormApi.init();

  const saved = scormApi.loadState() || {};
  const state = {
    currentChapter: typeof saved.currentChapter === 'number' ? saved.currentChapter : 0,
    visited: Array.isArray(saved.visited) ? saved.visited : [0],
    answers: saved.answers || {},
    notes: saved.notes || '',
    videoPreviews: saved.videoPreviews || {},
    completed: !!saved.completed
  };

  const els = {
    main: document.getElementById('mainContent'),
    headerTitle: document.getElementById('headerTitle'),
    scorePill: document.getElementById('scorePill'),
    progressFill: document.getElementById('progressFill'),
    stepIndicator: document.getElementById('stepIndicator'),
    lmsBadge: document.getElementById('lmsBadge'),
    bottomTag: document.getElementById('bottomChapterTag'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    nextLabel: document.getElementById('nextBtnLabel'),
    menuBtn: document.getElementById('menuBtn'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawer: document.getElementById('navDrawer'),
    backdrop: document.getElementById('drawerBackdrop'),
    moduleList: document.getElementById('moduleList'),
    drawerCompleted: document.getElementById('drawerCompleted'),
    drawerScore: document.getElementById('drawerScore'),
    finishCourseBtn: document.getElementById('finishCourseBtn'),
    quickIndexBtn: document.getElementById('quickIndexBtn')
  };

  els.lmsBadge.textContent = scormApi.isConnected() ? 'LMS SCORM 2004 Connected' : 'SCORM 2004 Ready';

  function computeScore() {
    let total = 0;
    let correct = 0;
    COURSE_CHAPTERS.forEach(ch => {
      ch.blocks.forEach(b => {
        if (b.type === 'quiz_mcq') {
          b.questions.forEach((q, qi) => {
            total++;
            const key = `${b.id}_q${qi}`;
            if (state.answers[key] === q.correct) correct++;
          });
        } else if (b.type === 'quiz_blanks') {
          b.items.forEach((it, bi) => {
            total++;
            const key = `${b.id}_b${bi}`;
            const val = (state.answers[key] || '').trim().toLowerCase();
            if (val === it.answer.trim().toLowerCase()) correct++;
          });
        } else if (b.type === 'quiz_match') {
          b.pairs.forEach((p, pi) => {
            total++;
            const key = `${b.id}_m${pi}`;
            if (state.answers[key] === p.answer) correct++;
          });
        } else if (b.type === 'kyc_sorter') {
          b.docs.forEach((d, di) => {
            total++;
            const key = `${b.id}_s${di}`;
            if (state.answers[key] === d.valid) correct++;
          });
        }
      });
    });
    return { total, correct, pct: total ? Math.round((correct / total) * 100) : 0 };
  }

  function persist() {
    if (!state.visited.includes(state.currentChapter)) {
      state.visited.push(state.currentChapter);
    }
    const { pct } = computeScore();
    const progressMeasure = state.visited.length / COURSE_CHAPTERS.length;
    if (progressMeasure >= 1 && !state.completed) {
      state.completed = true;
    }
    scormApi.saveState({
      currentChapter: state.currentChapter,
      visited: state.visited,
      answers: state.answers,
      notes: state.notes,
      videoPreviews: state.videoPreviews,
      completed: state.completed,
      progressMeasure,
      scoreScaled: pct / 100
    });
    updateChrome();
  }

  function updateChrome() {
    const ch = COURSE_CHAPTERS[state.currentChapter];
    const { pct } = computeScore();
    const visitedCount = state.visited.length;
    const progPct = Math.round((visitedCount / COURSE_CHAPTERS.length) * 100);

    els.headerTitle.textContent = ch.shortTitle;
    els.scorePill.textContent = `${pct}%`;
    els.progressFill.style.width = `${progPct}%`;
    els.stepIndicator.textContent = `Chapter ${state.currentChapter + 1} of ${COURSE_CHAPTERS.length} · ${visitedCount} Visited`;
    els.bottomTag.textContent = `${String(state.currentChapter + 1).padStart(2, '0')} / ${COURSE_CHAPTERS.length}`;
    els.drawerCompleted.textContent = `${visitedCount}/${COURSE_CHAPTERS.length}`;
    els.drawerScore.textContent = `${pct}%`;

    const drawerTitleEl = document.querySelector('.drawer-title');
    if (drawerTitleEl) {
      drawerTitleEl.textContent = `All ${COURSE_CHAPTERS.length} Chapters`;
    }
    const statBoxes = document.querySelectorAll('.drawer-stats .stat-box');
    if (statBoxes && statBoxes.length >= 3) {
      const vidCount = COURSE_CHAPTERS.reduce((cnt, c) => cnt + c.blocks.filter(b => b.type === 'video_placeholder').length, 0);
      const vidVal = statBoxes[2].querySelector('.stat-val');
      if (vidVal) vidVal.textContent = String(vidCount);
    }

    els.prevBtn.disabled = state.currentChapter === 0;
    if (state.currentChapter === COURSE_CHAPTERS.length - 1) {
      els.nextLabel.textContent = 'Finish ✓';
    } else {
      els.nextLabel.textContent = 'Next →';
    }
    renderDrawerList();
  }

  function renderDrawerList() {
    els.moduleList.innerHTML = COURSE_CHAPTERS.map((ch, idx) => {
      const isDone = state.visited.includes(idx);
      const isActive = idx === state.currentChapter;
      return `
        <button class="mod-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}" data-idx="${idx}">
          <span class="mod-num">${isDone && !isActive ? '✓' : ch.num}</span>
          <span class="mod-meta">
            <span class="mod-name">${ch.shortTitle}</span>
            <span class="mod-sub">${ch.title}</span>
          </span>
        </button>
      `;
    }).join('');

    els.moduleList.querySelectorAll('.mod-item').forEach(btn => {
      btn.addEventListener('click', () => {
        goToChapter(Number(btn.dataset.idx));
        closeDrawer();
      });
    });
  }

  function renderVideoStage(url) {
    if (!url) {
      return `
        <div class="play-medallion">▶</div>
        <div class="video-placeholder-text">Video Placeholder Ready to Embed</div>
        <div class="video-placeholder-sub">Set <code>embedUrl</code> in <code>js/courseData.js</code> or paste an MP4 / embed link below to preview</div>
      `;
    }
    const clean = url.trim();
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(clean)) {
      return `<video src="${escapeHtml(clean)}" controls playsinline preload="metadata"></video>`;
    }
    return `<iframe src="${escapeHtml(clean)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderBlock(block) {
    if (block.type === 'image') {
      return `
        <figure class="visual-card">
          <img src="${block.src}" alt="${escapeHtml(block.alt)}" loading="lazy" />
          ${block.caption ? `<figcaption class="visual-caption">📊 ${block.caption}</figcaption>` : ''}
        </figure>
      `;
    }

    if (block.type === 'think') {
      return `
        <section class="card">
          <span class="card-tag amber">Reflect &amp; Think</span>
          <h2>${block.title}</h2>
          <p><strong>${block.prompt}</strong></p>
          <details class="acc-item" style="margin-top:10px;">
            <summary>Tap to Reveal Key Mentor Takeaway</summary>
            <div class="acc-body">${block.hint}</div>
          </details>
        </section>
      `;
    }

    if (block.type === 'card') {
      const bulletsHtml = block.bullets
        ? `<ul class="rich-list ${block.listTone || ''}">${block.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
        : '';
      const tableHtml = block.table
        ? `<div class="table-wrap"><table class="data-table"><thead><tr>${block.table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${block.table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
        : '';
      const calloutHtml = block.callout
        ? `<div class="callout ${block.callout.type || ''}">${block.callout.text}</div>`
        : '';
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          <h2>${block.heading}</h2>
          ${block.body || ''}
          ${bulletsHtml}
          ${tableHtml}
          ${calloutHtml}
        </section>
      `;
    }

    if (block.type === 'accordion') {
      return `
        <section class="card">
          ${block.tag ? `<span class="card-tag">${block.tag}</span>` : ''}
          <h2>${block.heading}</h2>
          <div class="acc-group">
            ${block.items.map((it, idx) => `
              <details class="acc-item" ${idx === 0 ? 'open' : ''}>
                <summary>${it.title}</summary>
                <div class="acc-body">${it.content}</div>
              </details>
            `).join('')}
          </div>
        </section>
      `;
    }

    if (block.type === 'video_placeholder') {
      const activeUrl = state.videoPreviews[block.id] || block.embedUrl || '';
      return `
        <section class="video-embed-card" id="wrap_${block.id}">
          <div class="video-header">
            <span class="video-badge">${block.badge}</span>
            <span class="video-dur">⏱ ${block.duration}</span>
          </div>
          <h2 class="video-title">${block.title}</h2>
          <div class="video-stage" id="stage_${block.id}">
            ${renderVideoStage(activeUrl)}
          </div>
          <div class="video-watch-box">
            <div class="video-watch-title">What to Watch For in This Video</div>
            <ul>${block.watchFor.map(w => `<li>${w}</li>`).join('')}</ul>
          </div>
          <div class="video-embed-tools">
            <input type="text" class="video-url-input" id="input_${block.id}" value="${escapeHtml(activeUrl)}" placeholder="Paste .mp4 path or YouTube/Vimeo/LMS embed URL..." />
            <button type="button" class="video-load-btn" data-vid-id="${block.id}">Embed / Preview</button>
          </div>
        </section>
      `;
    }

    if (block.type === 'quiz_mcq') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header">
            <span class="quiz-badge">INTERACTIVE CHECK</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          ${block.questions.map((q, qi) => {
            const key = `${block.id}_q${qi}`;
            const chosen = state.answers[key];
            const answered = chosen !== undefined;
            return `
              <div class="q-block">
                <div class="q-text">${q.q}</div>
                <div class="opt-list">
                  ${q.options.map((opt, oi) => {
                    let cls = 'opt-btn';
                    if (answered) {
                      if (oi === q.correct) cls += ' correct';
                      else if (oi === chosen) cls += ' wrong';
                    }
                    return `<button type="button" class="${cls}" data-qid="${block.id}" data-qi="${qi}" data-oi="${oi}">${opt}</button>`;
                  }).join('')}
                </div>
                ${answered ? `<div class="q-feedback ${chosen === q.correct ? 'ok' : 'err'}">${chosen === q.correct ? '✓ Correct! ' : '✕ Review: '}${q.explanation}</div>` : ''}
              </div>
            `;
          }).join('')}
        </section>
      `;
    }

    if (block.type === 'quiz_blanks') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header"><span class="quiz-badge">FILL IN THE BLANKS</span></div>
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          <div class="word-bank">
            ${block.wordBank.map(w => `<span class="word-chip">${w}</span>`).join('')}
          </div>
          ${block.items.map((it, bi) => {
            const key = `${block.id}_b${bi}`;
            const val = state.answers[key] || '';
            const checked = state.answers[`${block.id}_checked`];
            const isOk = val.trim().toLowerCase() === it.answer.trim().toLowerCase();
            return `
              <div class="blank-row">
                <label style="font-size:14px;font-weight:600;">${it.prompt}</label>
                <select class="blank-input ${checked ? (isOk ? 'ok' : 'err') : ''}" data-bid="${block.id}" data-bi="${bi}">
                  <option value="">-- Select Answer from Word Bank --</option>
                  ${block.wordBank.map(opt => `<option value="${escapeHtml(opt)}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                ${checked && !isOk ? `<div class="q-feedback err">Correct answer: <strong>${it.answer}</strong></div>` : ''}
              </div>
            `;
          }).join('')}
          <button type="button" class="action-btn check-blanks-btn" data-bid="${block.id}">Check Answers</button>
        </section>
      `;
    }

    if (block.type === 'quiz_match') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header"><span class="quiz-badge">MATCH THE PAIR</span></div>
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          ${block.pairs.map((p, pi) => {
            const key = `${block.id}_m${pi}`;
            const val = state.answers[key] || '';
            const checked = state.answers[`${block.id}_checked`];
            const isOk = val === p.answer;
            return `
              <div class="match-row">
                <div style="font-size:14px;font-weight:700;color:var(--hdfc-navy);">${p.left}</div>
                <select class="match-select ${checked ? (isOk ? 'ok' : 'err') : ''}" data-mid="${block.id}" data-pi="${pi}">
                  <option value="">-- Choose Best Match --</option>
                  ${block.options.map(opt => `<option value="${escapeHtml(opt)}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                ${checked && !isOk ? `<div class="q-feedback err">Best match: <strong>${p.answer}</strong></div>` : ''}
              </div>
            `;
          }).join('')}
          <button type="button" class="action-btn check-match-btn" data-mid="${block.id}">Verify Matches</button>
        </section>
      `;
    }

    if (block.type === 'kyc_sorter') {
      return `
        <section class="quiz-card" id="${block.id}">
          <div class="quiz-header"><span class="quiz-badge">KYC DOCUMENT SORTER</span></div>
          <h2 style="margin:0 0 8px;font-size:17px;color:var(--hdfc-navy);">${block.title}</h2>
          <p style="font-size:14px;margin-bottom:10px;">${block.instruction}</p>
          ${block.docs.map((d, di) => {
            const key = `${block.id}_s${di}`;
            const chosen = state.answers[key];
            const answered = chosen !== undefined;
            const isCorrect = chosen === d.valid;
            return `
              <div class="sorter-item">
                <div class="sorter-doc">${d.name}</div>
                <div class="sorter-btns">
                  <button type="button" class="sort-choice ${answered && chosen === true ? (isCorrect ? 'selected-ok' : 'selected-err') : ''}" data-sid="${block.id}" data-di="${di}" data-val="true">✓ Valid Address OVD</button>
                  <button type="button" class="sort-choice ${answered && chosen === false ? (isCorrect ? 'selected-ok' : 'selected-err') : ''}" data-sid="${block.id}" data-di="${di}" data-val="false">✕ Not Address OVD</button>
                </div>
                ${answered ? `<div class="q-feedback ${isCorrect ? 'ok' : 'err'}">${isCorrect ? '✓ Spot on! ' : '✕ Note: '}${d.note}</div>` : ''}
              </div>
            `;
          }).join('')}
        </section>
      `;
    }

    if (block.type === 'flashcards') {
      return `
        <section class="card">
          <span class="card-tag green">Interactive Self-Test Cards</span>
          <h2>${block.title}</h2>
          <p style="font-size:13.5px;color:var(--muted);">Tap any card below to reveal the model answer:</p>
          ${block.cards.map(c => `
            <details class="flashcard">
              <summary class="fc-q">${c.q}</summary>
              <div class="fc-a">${c.a}</div>
            </details>
          `).join('')}
        </section>
      `;
    }

    if (block.type === 'action_commitment') {
      return `
        <section class="card">
          <span class="card-tag red">Personal Action Plan</span>
          <h2>${block.title}</h2>
          <p>${block.prompt}</p>
          <textarea id="actionNotes" class="notepad-area" placeholder="Example: Product — Current Account + Merchant QR. Q1: How do you currently accept customer UPI/card payments? ...">${escapeHtml(state.notes)}</textarea>
          <button type="button" id="saveNotesBtn" class="action-btn" style="background:var(--green);">Save Action Plan &amp; Complete Day 2 ✓</button>
        </section>
      `;
    }

    return '';
  }

  function renderChapter() {
    const ch = COURSE_CHAPTERS[state.currentChapter];
    const blocksHtml = ch.blocks.map(renderBlock).join('');
    els.main.innerHTML = `
      <div class="chapter-hero">
        <span class="hero-kicker">CHAPTER ${state.currentChapter + 1} OF ${COURSE_CHAPTERS.length} · ${ch.num}</span>
        <h1 class="hero-title">${ch.title}</h1>
        <p class="hero-desc">${ch.subtitle}</p>
      </div>
      ${blocksHtml}
    `;
    bindDynamicEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindDynamicEvents() {
    // Video Embed Preview Loader
    els.main.querySelectorAll('.video-load-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const vidId = btn.dataset.vidId;
        const input = document.getElementById(`input_${vidId}`);
        const stage = document.getElementById(`stage_${vidId}`);
        const url = input.value.trim();
        state.videoPreviews[vidId] = url;
        stage.innerHTML = renderVideoStage(url);
        persist();
      });
    });

    // MCQ
    els.main.querySelectorAll('.opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = `${btn.dataset.qid}_q${btn.dataset.qi}`;
        state.answers[key] = Number(btn.dataset.oi);
        persist();
        renderChapter();
      });
    });

    // Blanks
    els.main.querySelectorAll('.blank-input').forEach(sel => {
      sel.addEventListener('change', () => {
        state.answers[`${sel.dataset.bid}_b${sel.dataset.bi}`] = sel.value;
        persist();
      });
    });
    els.main.querySelectorAll('.check-blanks-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.answers[`${btn.dataset.bid}_checked`] = true;
        persist();
        renderChapter();
      });
    });

    // Match
    els.main.querySelectorAll('.match-select').forEach(sel => {
      sel.addEventListener('change', () => {
        state.answers[`${sel.dataset.mid}_m${sel.dataset.pi}`] = sel.value;
        persist();
      });
    });
    els.main.querySelectorAll('.check-match-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.answers[`${btn.dataset.mid}_checked`] = true;
        persist();
        renderChapter();
      });
    });

    // KYC Sorter
    els.main.querySelectorAll('.sort-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        state.answers[`${btn.dataset.sid}_s${btn.dataset.di}`] = (btn.dataset.val === 'true');
        persist();
        renderChapter();
      });
    });

    // Action Commitment Save
    const notesEl = document.getElementById('actionNotes');
    const saveBtn = document.getElementById('saveNotesBtn');
    if (notesEl && saveBtn) {
      saveBtn.addEventListener('click', () => {
        state.notes = notesEl.value;
        state.completed = true;
        persist();
        saveBtn.textContent = 'Saved & Marked Completed in LMS ✓';
      });
    }
  }

  function goToChapter(idx) {
    if (idx < 0 || idx >= COURSE_CHAPTERS.length) return;
    state.currentChapter = idx;
    persist();
    renderChapter();
  }

  function openDrawer() {
    els.drawer.classList.add('open');
    els.drawer.setAttribute('aria-hidden', 'false');
    els.backdrop.classList.remove('hidden');
  }

  function closeDrawer() {
    els.drawer.classList.remove('open');
    els.drawer.setAttribute('aria-hidden', 'true');
    els.backdrop.classList.add('hidden');
  }

  els.menuBtn.addEventListener('click', openDrawer);
  els.quickIndexBtn.addEventListener('click', openDrawer);
  els.closeDrawerBtn.addEventListener('click', closeDrawer);
  els.backdrop.addEventListener('click', closeDrawer);

  els.prevBtn.addEventListener('click', () => goToChapter(state.currentChapter - 1));
  els.nextBtn.addEventListener('click', () => {
    if (state.currentChapter < COURSE_CHAPTERS.length - 1) {
      goToChapter(state.currentChapter + 1);
    } else {
      state.completed = true;
      persist();
      scormApi.finish();
      const { pct } = computeScore();
      alert(`Congratulations! SCORM 2004 module submitted.\nChapters Completed: ${state.visited.length}/${COURSE_CHAPTERS.length}\nQuiz Score: ${pct}%`);
    }
  });

  els.finishCourseBtn.addEventListener('click', () => {
    state.completed = true;
    persist();
    scormApi.finish();
    closeDrawer();
    const { pct } = computeScore();
    alert(`Course status saved as COMPLETED in SCORM 2004.\nQuiz Score: ${pct}%`);
  });

  window.addEventListener('beforeunload', () => {
    persist();
  });

  persist();
  renderChapter();
})();
  