import os
import sys
import json
import base64
import zipfile
import shutil
import urllib.parse
import re
import html
import pptx
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

# Paths to template files
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "scorm_player")
REF_SCORM_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ref_scorm")

def load_template_file(rel_path):
    p1 = os.path.join(TEMPLATE_DIR, rel_path)
    if os.path.exists(p1):
        with open(p1, "r", encoding="utf-8") as f:
            return f.read()
    p2 = os.path.join(REF_SCORM_DIR, rel_path)
    if os.path.exists(p2):
        with open(p2, "r", encoding="utf-8") as f:
            return f.read()
    raise FileNotFoundError(f"Template file not found: {rel_path}")

def get_asset_binary(asset_filename):
    p1 = os.path.join(TEMPLATE_DIR, "assets", asset_filename)
    if os.path.exists(p1):
        with open(p1, "rb") as f:
            return f.read()
    p2 = os.path.join(REF_SCORM_DIR, "assets", asset_filename)
    if os.path.exists(p2):
        with open(p2, "rb") as f:
            return f.read()
    return None

VIDEO_EXTENSIONS = ('.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi', '.ogv')

def extract_all_media_from_pptx(pptx_path, output_dir=None):
    video_map = {}
    slide_image_map = {}
    shape_image_map = {}
    all_media = []

    pub_media = os.path.join(TEMPLATE_DIR, "..", "media")
    os.makedirs(pub_media, exist_ok=True)
    root_media = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media")
    os.makedirs(root_media, exist_ok=True)
    out_media = os.path.join(output_dir, "media") if output_dir else pub_media
    os.makedirs(out_media, exist_ok=True)

    dest_dirs = list({pub_media, root_media, out_media})

    try:
        with zipfile.ZipFile(pptx_path, "r") as z:
            for name in z.namelist():
                lower_name = name.lower()
                if "ppt/media/" in lower_name or "media/" in lower_name:
                    bname = os.path.basename(name)
                    if not bname:
                        continue
                    data = z.read(name)
                    for d in dest_dirs:
                        target_file = os.path.join(d, bname)
                        with open(target_file, "wb") as f:
                            f.write(data)
                    if bname not in all_media:
                        all_media.append(bname)
    except Exception as e:
        print(f"Note on media zip extraction: {e}")

    try:
        prs = Presentation(pptx_path)
        for s_idx, slide in enumerate(prs.slides):
            slide_image_map[s_idx] = []
            shape_image_map[s_idx] = {}
            for s in slide.shapes:
                if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
                    try:
                        rel_id = s._element.xpath('.//a:blip/@r:embed')[0]
                        rel = slide.part.rels[rel_id]
                        bname = os.path.basename(rel.target_ref)
                        shape_image_map[s_idx][s.name] = f"media/{bname}"
                        if f"media/{bname}" not in slide_image_map[s_idx]:
                            slide_image_map[s_idx].append(f"media/{bname}")
                    except Exception:
                        pass
                # Check for media shapes (MSO_SHAPE_TYPE.MEDIA == 16)
                elif getattr(s, 'shape_type', None) == 16 or getattr(s, 'shape_type', None) == getattr(pptx.enum.shapes.MSO_SHAPE_TYPE, 'MEDIA', 16):
                    try:
                        s_xml = s._element.xml
                        for r_id, rel in slide.part.rels.items():
                            t_ref = getattr(rel, 'target_ref', '')
                            if any(t_ref.lower().endswith(ext) for ext in VIDEO_EXTENSIONS):
                                bname = os.path.basename(t_ref)
                                video_map[s_idx] = f"media/{bname}"
                                break
                    except Exception:
                        pass

            # Check related_parts
            if s_idx not in video_map:
                for rel in slide.part.related_parts.values():
                    pname = getattr(rel, "partname", "")
                    ctype = getattr(rel, "content_type", "")
                    if any(pname.lower().endswith(ext) for ext in VIDEO_EXTENSIONS) or "video" in ctype.lower():
                        bname = os.path.basename(pname)
                        video_map[s_idx] = f"media/{bname}"
                        break

            # Check rels
            if s_idx not in video_map:
                for rel in slide.part.rels.values():
                    t_ref = getattr(rel, "target_ref", "")
                    rtype = getattr(rel, "reltype", "")
                    if any(t_ref.lower().endswith(ext) for ext in VIDEO_EXTENSIONS) or "video" in rtype.lower():
                        bname = os.path.basename(t_ref)
                        video_map[s_idx] = f"media/{bname}"
                        break

    except Exception as e:
        print(f"Note on pptx media mapping: {e}")

    return {
        "video_map": video_map,
        "slide_image_map": slide_image_map,
        "shape_image_map": shape_image_map,
        "all_media": all_media
    }

def extract_videos_from_pptx(pptx_path, output_dir=None):
    res = extract_all_media_from_pptx(pptx_path, output_dir)
    return res["video_map"]

def parse_day3_vo_course(pptx_path, media_info):
    video_map = media_info["video_map"]
    all_videos = sorted([m for m in media_info["all_media"] if any(m.lower().endswith(ext) for ext in VIDEO_EXTENSIONS)])

    v1 = video_map.get(19) or (f"media/{all_videos[0]}" if len(all_videos) > 0 else "media/media1.mp4")
    v2 = video_map.get(20) or (f"media/{all_videos[1]}" if len(all_videos) > 1 else "media/media2.mp4")
    v3 = video_map.get(25) or (f"media/{all_videos[2]}" if len(all_videos) > 2 else "media/media3.mp4")
    v4 = video_map.get(26) or (f"media/{all_videos[3]}" if len(all_videos) > 3 else "media/media4.mp4")
    v5 = video_map.get(27) or (f"media/{all_videos[4]}" if len(all_videos) > 4 else "media/media5.mp4")

    chapters = [
        # Chapter 0: Session Overview & Roadmap (Slides 1-3)
        {
            "id": "ch0",
            "num": "00",
            "shortTitle": "Overview & Roadmap",
            "title": "Day 3: Products & Account Opening",
            "subtitle": "CASA • Savings & Current Accounts • CA Allied Products • Cards & Account Opening",
            "blocks": [
                {
                    "type": "think",
                    "title": "Opening Reflection",
                    "prompt": "When a customer deposits money in a savings account, what does the bank do with it—and how does it drive bank profitability?",
                    "hint": "Customer deposits form the core liability base that funds retail, SME, and commercial advances. CASA deposits carry a low cost of funds, directly maximizing Net Interest Margin (NIM) and fostering long-term cross-sell depth."
                },
                {
                    "type": "card",
                    "tag": "Curriculum Intro · Slide 1",
                    "heading": "HDFC Academy · Banking Sales Excellence",
                    "imageSrc": "media/slide_1.png",
                    "body": "<p>Welcome to <strong>Day 3: Products & Account Opening</strong>. Today's session takes you step-by-step through our complete retail product portfolio, the operational mechanics of CASA profitability, documentation protocols, and physical & digital account opening journeys.</p>",
                    "bullets": [
                        "<strong>Target Audience:</strong> Sales Executives & Branch Relationship Managers",
                        "<strong>Key Methodology:</strong> Structured product walkthroughs, comparison matrices, and interactive knowledge checks in every module",
                        "<strong>Core Objective:</strong> Master consultative need discovery to match the right product variant and achieve zero-defect account opening"
                    ]
                },
                {
                    "type": "boxes",
                    "tag": "Curriculum Structure · Slide 2",
                    "heading": "Our Roadmap for Today",
                    "body": "<p>Ten structured modules designed to build deep product expertise before transitioning into documentation and account opening workflows:</p>",
                    "boxGridCols": 3,
                    "boxes": [
                        {"title": "Module 1: Importance of CASA", "badge": "MODULE 1", "desc": "Liabilities, NIM economics, and the four employee growth levers.", "icon": "media/image5.png", "highlight": True},
                        {"title": "Module 2: Savings Accounts", "badge": "MODULE 2", "desc": "Regular Savings, Savings Max, Speciale range, and Kids accounts.", "icon": "media/image6.png", "highlight": True},
                        {"title": "Module 3: Current Accounts", "badge": "MODULE 3", "desc": "Account variants, fee schedules, and daily cash deposit limits.", "icon": "media/image7.png"},
                        {"title": "Module 4: CA Allied Products", "badge": "MODULE 4", "desc": "CBX corporate net banking, eCMS collections, POS/MPOS, and Vyapar app.", "icon": "media/image8.png"},
                        {"title": "Module 5: Debit Cards", "badge": "MODULE 5", "desc": "EasyShop portfolio, lounge privileges, insurance, and need-based selling.", "icon": "media/image9.png"},
                        {"title": "Module 6: Credit Cards", "badge": "MODULE 6", "desc": "Eligibility thresholds, flagship cards, and sales pitch checklist.", "icon": "media/image10.png"},
                        {"title": "Module 7: Non-Individual Docs", "badge": "MODULE 7", "desc": "Sole proprietorship, partnership, and corporate documentation guidelines.", "icon": "media/image11.png"},
                        {"title": "Module 8: Physical Account Opening", "badge": "MODULE 8", "desc": "Physical Account Opening Form (AOF), Maker-Checker protocols, and dispatch.", "icon": "media/image12.png", "highlight": True},
                        {"title": "Module 9: Insta Account & SmartApp", "badge": "MODULE 9", "desc": "End-to-end digital onboarding, CRM lead integration, and instant activation.", "icon": "media/image13.png"},
                        {"title": "Module 10: Video KYC", "badge": "MODULE 10", "desc": "Paperless zero-contact customer verification via secure video interaction.", "icon": "media/image14.png"}
                    ],
                    "callout": {"type": "tip", "text": "<strong>How We'll Learn:</strong> Interactive walkthroughs ➔ Comparison charts ➔ Step-by-step journeys ➔ Knowledge checks."}
                },
                {
                    "type": "collapsible_boxes",
                    "tag": "Learning Outcomes · Slide 3",
                    "heading": "Learning Objectives",
                    "body": "<p>By the end of this web-based training, learners will achieve three pillars of operational mastery:</p>",
                    "collapsibles": [
                        {
                            "title": "IDENTIFY — Core Drivers & Variant Matching",
                            "badge": "LEVEL 1",
                            "badgeColor": "gold",
                            "icon": "media/image18.png",
                            "isOpen": True,
                            "bullets": [
                                "Explain why CASA deposits drive the bank's profitability and Net Interest Margin.",
                                "Identify the right Savings or Current Account variant and debit card for every customer profile.",
                                "Recognize the distinct documentation needs for individual vs non-individual business entities."
                            ]
                        },
                        {
                            "title": "EXPLAIN — Features, Pricing & Value Propositions",
                            "badge": "LEVEL 2",
                            "icon": "media/image19.png",
                            "bullets": [
                                "Clearly articulate eligibility, minimum balance requirements, and fee waivers for Regular, Savings Max, and Speciale.",
                                "Highlight Debit Card privileges including up to ₹3.29 Cr complimentary insurance cover and cashback.",
                                "Explain how CA allied products (POS, QR, Payment Gateway, eCMS) solve business cash flow pain points."
                            ]
                        },
                        {
                            "title": "APPLY — Need Discovery & Compliant Account Opening",
                            "badge": "LEVEL 3",
                            "badgeColor": "green",
                            "icon": "media/image20.png",
                            "bullets": [
                                "Conduct consultative need-discovery probing to recommend tailored financial solutions.",
                                "Collect complete, verified KYC documents and execute zero-defect AOF submissions.",
                                "Guide customers through frictionless digital account opening on Insta Account and Video KYC."
                            ]
                        }
                    ]
                }
            ]
        },

        # Chapter 1: Module 1: Importance of CASA (Slides 4-9)
        {
            "id": "ch1",
            "num": "M1",
            "shortTitle": "Importance of CASA",
            "title": "Module 1: Importance of CASA",
            "subtitle": "Why CASA deposits matter to the bank, and how every employee helps grow them",
            "blocks": [
                {
                    "type": "think",
                    "title": "Deposit Dynamics (Slide 4)",
                    "prompt": "When a customer deposits money in a savings account, what does the bank do with it?",
                    "hint": "The bank pools customer deposits into its liabilities base to fund retail advances (home, auto, personal loans) and commercial credit, earning loan interest income while paying minimal interest on CASA deposits."
                },
                {
                    "type": "boxes",
                    "tag": "Banking Fundamentals · Slide 5",
                    "heading": "Types of Liabilities in Banking",
                    "body": "<p><strong>Liabilities are the primary source of funds for the bank.</strong> The bank raises capital through customer deposits, borrowings, and bond markets:</p>",
                    "boxGridCols": 3,
                    "boxes": [
                        {
                            "title": "Customer Deposits",
                            "badge": "PRIMARY SOURCE",
                            "badgeColor": "green",
                            "icon": "media/image23.png",
                            "highlight": True,
                            "desc": "The lifeblood of commercial banking:",
                            "bullets": [
                                "<strong>Savings Accounts (CASA ✓):</strong> Low-cost demand deposits available on tap.",
                                "<strong>Current Accounts (CASA ✓):</strong> Zero-interest transactional accounts for businesses.",
                                "<strong>Fixed Deposits (FDs):</strong> Time liabilities with predetermined tenure.",
                                "<strong>Recurring Deposits (RDs):</strong> Systematic monthly term savings."
                            ]
                        },
                        {
                            "title": "Borrowings",
                            "badge": "SECONDARY",
                            "icon": "media/image25.png",
                            "desc": "Wholesale liquidity sources:",
                            "bullets": [
                                "<strong>Interbank Borrowings:</strong> Short-term call and notice money markets.",
                                "<strong>Financial Institutions:</strong> Lines of credit from domestic and global lenders.",
                                "<strong>RBI Borrowings:</strong> Repo operations and statutory liquidity window."
                            ]
                        },
                        {
                            "title": "Bonds & Debentures",
                            "badge": "CAPITAL MARKET",
                            "icon": "media/image23.png",
                            "desc": "Long-term debt instruments:",
                            "bullets": [
                                "<strong>Bonds Issued:</strong> Infrastructure and tier-2 long-term debt capital.",
                                "<strong>Debentures:</strong> Subordinated market instruments strengthening capital adequacy."
                            ]
                        }
                    ],
                    "callout": {"type": "tip", "text": "<strong>Core Banking Flow:</strong> Deposits collected from customers ➔ Deployed as loans & investments ➔ Generate income & support the bank's growth."}
                },
                {
                    "type": "boxes",
                    "tag": "Strategic Value · Slide 6",
                    "heading": "Why Liabilities Matter",
                    "body": "<p>Four foundational reasons why a strong deposit base is critical to the bank's health, profitability, and market leadership:</p>",
                    "boxGridCols": 2,
                    "boxes": [
                        {
                            "title": "Cheap Source of Funds",
                            "badge": "LOW COST",
                            "badgeColor": "green",
                            "icon": "media/image27.png",
                            "highlight": True,
                            "desc": "Deposits, especially CASA, are the most cost-effective funding source. A lower cost of funds directly widens bank profitability."
                        },
                        {
                            "title": "Interest Spread (NIM)",
                            "badge": "PROFIT ENGINE",
                            "icon": "media/image28.png",
                            "highlight": True,
                            "desc": "The difference between interest earned on loans and interest paid on deposits is the bank's Net Interest Margin (NIM)."
                        },
                        {
                            "title": "Liquidity Management",
                            "badge": "STABILITY",
                            "icon": "media/image29.png",
                            "desc": "A healthy deposit base ensures the bank can meet customer withdrawal demands and statutory reserve requirements (CRR & SLR)."
                        },
                        {
                            "title": "Increased Lending Capacity",
                            "badge": "SCALE",
                            "icon": "media/image26.png",
                            "desc": "More low-cost deposits enable higher lending volumes, driving asset book expansion, fee income, and shareholder value."
                        }
                    ]
                },
                {
                    "type": "card",
                    "tag": "Profitability Economics · Slide 7",
                    "heading": "CASA & Bank Profitability",
                    "body": "<p>How the CASA ratio fundamentally transforms the economics and competitive edge of a commercial bank:</p>",
                    "table": {
                        "headers": ["Particulars", "High CASA Bank (e.g. HDFC Bank)", "Low CASA Bank"],
                        "rows": [
                            ["Cost of Funds", "Lower (Ultra-cheap funding base)", "Higher (Reliance on wholesale debt)"],
                            ["Lending Capacity", "Higher (Competitive loan pricing)", "Lower (Higher hurdle rate for advances)"],
                            ["Net Interest Margin (NIM)", "Higher (3.5% – 4.2%+ spread)", "Lower (Compressed interest margins)"],
                            ["Overall Profitability", "Higher (Superior Return on Assets)", "Lower (Vulnerable to rate hikes)"]
                        ]
                    },
                    "callout": {"type": "tip", "text": "<strong>Key Takeaway:</strong> A higher CASA ratio is the hallmark of a financially healthy, well-run bank. As bank employees, growing the CASA base is the single most impactful contribution you can make starting from Day 1."}
                },
                {
                    "type": "boxes",
                    "tag": "Employee Growth Levers · Slide 8",
                    "heading": "Every Employee Drives CASA Growth",
                    "body": "<p>Four practical levers every sales executive and branch employee can execute daily to grow and protect the CASA base:</p>",
                    "boxGridCols": 2,
                    "boxes": [
                        {
                            "title": "01 Customer Acquisition",
                            "badge": "ACQUIRE",
                            "badgeColor": "green",
                            "icon": "media/image33.png",
                            "desc": "Open new Savings and Current Accounts through systematic catchment mapping and quality referrals from satisfied customers."
                        },
                        {
                            "title": "02 Relationship Building",
                            "badge": "ENGAGE",
                            "icon": "media/image34.png",
                            "desc": "Deliver delightful onboarding and service to drive primary account usage, payroll credits, and active debit card spending."
                        },
                        {
                            "title": "03 Cross-Selling",
                            "badge": "DEEPEN",
                            "icon": "media/image35.png",
                            "desc": "Deepen customer share of wallet with salary accounts, merchant QR/POS solutions, credit cards, and digital wealth offerings."
                        },
                        {
                            "title": "04 Retention & Reactivation",
                            "badge": "RETAIN",
                            "badgeColor": "red",
                            "icon": "media/image36.png",
                            "desc": "Monitor account balances proactively, resolve service friction immediately, and reactivate dormant accounts before customers switch."
                        }
                    ]
                },
                {
                    "type": "quiz_mcq",
                    "id": "quiz_s9",
                    "title": "Knowledge Check: Importance of CASA (Slide 9)",
                    "questions": [
                        {
                            "q": "Which of these is the most cost-effective source of funds for a commercial bank?",
                            "options": [
                                "Interbank borrowings at market call rates",
                                "Bonds and subordinated debentures issued in capital markets",
                                "CASA deposits (Current and Savings Accounts)",
                                "RBI borrowings under the repo facility window"
                            ],
                            "correct": 2,
                            "explanation": "CASA deposits carry zero interest (Current Account) or low regulated interest (Savings Account), making them the cheapest source of funding and the primary driver of high Net Interest Margin (NIM)."
                        }
                    ]
                }
            ]
        },

        # Chapter 2: Module 2: Regular Savings Account (Slides 10-12)
        {
            "id": "ch2",
            "num": "M2",
            "shortTitle": "Regular Savings",
            "title": "Module 2: Regular Savings Account",
            "subtitle": "Know Your Product — Everyday Savings Bank Account (SB)",
            "blocks": [
                {
                    "type": "card",
                    "tag": "Product Range Overview · Slides 10-11",
                    "heading": "Module 2: Know Your Product — Savings Bank Accounts",
                    "imageSrc": "media/slide_10.png",
                    "body": "<p>Savings Accounts are the foundational gateway product for retail banking. In this module, we examine three core offerings: the versatile <strong>Regular Savings Account</strong>, the high-yield <strong>Savings Max Account</strong>, and the profile-driven <strong>Speciale Premium Range</strong>.</p>"
                },
                {
                    "type": "boxes",
                    "tag": "Key Features · Slide 12",
                    "heading": "Regular Savings Account: Key Features",
                    "body": "<p>A savings account designed to meet daily transactional needs while giving customers peace of mind, digital convenience, and lifestyle privileges:</p>",
                    "boxGridCols": 2,
                    "boxes": [
                        {
                            "title": "Balance Requirement",
                            "badge": "AMB / AQB",
                            "badgeColor": "green",
                            "icon": "media/image5.png",
                            "highlight": True,
                            "desc": "<strong>Metro & Urban:</strong> Average Monthly Balance (AMB) of ₹10,000.<br/><strong>Semi-Urban:</strong> AMB of ₹5,000.<br/><strong>Rural:</strong> Average Quarterly Balance (AQB) of ₹2,500 or ₹10,000 FD for 1 year."
                        },
                        {
                            "title": "Demat & Investment Benefit",
                            "badge": "WEALTH PRIVILEGE",
                            "icon": "media/image37.png",
                            "desc": "100% waiver on Annual Maintenance Charges (AMC) on new Demat Accounts for the first year, making investing accessible and frictionless."
                        },
                        {
                            "title": "ATM Transaction Limits",
                            "badge": "ATM WITHDRAWALS",
                            "icon": "media/image38.png",
                            "desc": "<strong>HDFC Bank ATMs:</strong> 5 free financial transactions/month; unlimited non-financial free.<br/><strong>Non-HDFC ATMs:</strong> 5 free transactions in non-metro locations; 3 free in metro locations."
                        },
                        {
                            "title": "Millennia Debit Card",
                            "badge": "CARDS & LOUNGE",
                            "icon": "media/image3.png",
                            "highlight": True,
                            "desc": "Metro & Urban accounts come with the <strong>Millennia Debit Card</strong> featuring up to 5% CashBack on shopping, complimentary domestic airport lounge access, and extensive accidental insurance cover."
                        }
                    ]
                }
            ]
        },

        # Chapter 3: Module 2: Savings Max Account (Slides 13-16)
        {
            "id": "ch3",
            "num": "M3",
            "shortTitle": "Savings Max",
            "title": "Module 2: Savings Max Account",
            "subtitle": "High-Yield Sweep-in, Premium Platinum Card & Up to ₹3.29 Cr Insurance Cover",
            "blocks": [
                {
                    "type": "collapsible_boxes",
                    "tag": "Value Proposition · Slide 14",
                    "heading": "Savings Max Account: Key USPs",
                    "body": "<p>An AMB requirement of just ₹25,000 unlocks an extraordinary bundle of debit card privileges, automatic sweep-in liquidity, locker discounts, and loan concessions:</p>",
                    "collapsibles": [
                        {
                            "title": "💳 DEBIT CARD BENEFITS — Free Lifetime Platinum Card",
                            "badge": "PREMIUM DC",
                            "badgeColor": "gold",
                            "icon": "media/image3.png",
                            "isOpen": True,
                            "bullets": [
                                "<strong>Free Lifetime Platinum Debit Card:</strong> Zero annual fee for the primary account holder.",
                                "<strong>Higher Spending Limits:</strong> Daily cash withdrawal limit of ₹1 Lakh & shopping limit of ₹5 Lakhs.",
                                "<strong>1% CashBack:</strong> Up to 1% CashBack on every point-of-sale and online transaction.",
                                "<strong>Unlimited Free ATM Usage:</strong> Unlimited free ATM transactions on all HDFC and Non-HDFC ATMs nationwide.",
                                "<strong>Woman's Advantage Card:</strong> Free lifetime Woman's Advantage / International Debit Card for joint account holders.",
                                "<strong>Unmatched Insurance:</strong> Personal and air accident insurance coverage up to ₹3.29 Crores."
                            ]
                        },
                        {
                            "title": "🏦 BENEFITS ON A/C — Money Maximiser Auto-Sweep",
                            "badge": "LIQUIDITY",
                            "icon": "media/image6.png",
                            "isOpen": True,
                            "bullets": [
                                "<strong>Money Maximiser Facility:</strong> Automatically sweeps surplus funds above a threshold into high-interest Fixed Deposits, earning higher FD returns.",
                                "<strong>Reverse Sweep (Sweep-In):</strong> Whenever a cheque or withdrawal exceeds the savings balance, the FD liquidates automatically with zero penalty.",
                                "<strong>50% Locker Discount:</strong> 50% discount on safe deposit locker rental fees for the 1st year (on a pro-rata basis).",
                                "<strong>FD Cushion:</strong> Flexible FD cushion facility available from ₹1 Lakh to ₹1.5 Lakhs."
                            ]
                        },
                        {
                            "title": "📄 OTHER PRODUCT BENEFITS — Wealth & Transactions",
                            "badge": "ALLIED",
                            "icon": "media/image41.png",
                            "bullets": [
                                "<strong>Free Demand Drafts:</strong> Free Demand Draft (DD) issuance up to ₹1 Lakh per month.",
                                "<strong>Demat Fee Waiver:</strong> AMC charges on new Demat Account waived completely for the 1st year."
                            ]
                        },
                        {
                            "title": "🚗 LOAN OFFERS — Preferential Rates",
                            "badge": "LENDING",
                            "icon": "media/image42.png",
                            "bullets": [
                                "<strong>Special Rate on Two-Wheeler Loans (TWL):</strong> Preferential interest rates and processing fee concessions for Savings Max holders."
                            ]
                        }
                    ],
                    "callout": {"type": "tip", "text": "<strong>Balance Qualification:</strong> Metro / Urban: AMB ₹25,000 or FD Relationship of ₹1.50 Lakhs. Semi-Urban / Rural: AMB ₹25,000 or FD Relationship of ₹1 Lakh."}
                },
                {
                    "type": "boxes",
                    "tag": "Eligibility · Slide 15",
                    "heading": "Savings Max: Eligibility & Balance Requirements",
                    "boxGridCols": 2,
                    "boxes": [
                        {
                            "title": "Who Can Open a Savings Max?",
                            "badge": "ELIGIBILITY",
                            "icon": "media/image43.png",
                            "bullets": [
                                "<strong>Resident Individuals:</strong> Sole or joint accounts.",
                                "<strong>Hindu Undivided Families (HUF):</strong> Managed through the Karta.",
                                "<strong>Foreign Nationals Residing in India:</strong> Eligible by submitting standard visa, employment permit, and address proof.",
                                "<strong>Minors above 10 Years:</strong> Eligible for self-operated minor accounts."
                            ]
                        },
                        {
                            "title": "Minimum Balance & Maintenance",
                            "badge": "MAINTENANCE",
                            "badgeColor": "green",
                            "icon": "media/image5.png",
                            "highlight": True,
                            "bullets": [
                                "<strong>Average Monthly Balance:</strong> ≥ ₹25,000 across the calendar month.",
                                "<strong>Alternative FD Threshold:</strong> Fixed deposit relationship of ₹1.5 Lakhs (Metro/Urban) or ₹1 Lakh (Semi-Urban/Rural) waives AMB non-maintenance charges."
                            ]
                        }
                    ]
                },
                {
                    "type": "card",
                    "tag": "Insurance Terms & Conditions · Slide 16",
                    "heading": "Savings Max: Insurance Breakdown & Activation Terms",
                    "body": "<p>Detailed breakdown of the <strong>₹3.29 Crore comprehensive complimentary insurance coverage</strong> bundled with the Savings Max Account and Lifetime Free Platinum Debit Card:</p>",
                    "table": {
                        "headers": ["Cover Type", "Total Cover", "Account Level", "Platinum DC Level", "Activation Condition"],
                        "rows": [
                            ["Air Accidental Cover", "₹3.00 Cr", "—", "₹3.00 Cr", "Air ticket must be purchased using the primary Platinum Debit Card"],
                            ["Personal Accidental Death", "₹20 Lacs", "₹10 Lacs", "₹10 Lacs", "Account activation: 1 POS swipe in last 90 days. Debit Card: 1 POS swipe in last 30 days"],
                            ["Accidental Hospitalization", "₹1 Lac", "₹1 Lac", "—", "At least 1 POS swipe in the last 30 days prior to incident"],
                            ["Zero Liability Cover", "₹4 Lacs", "—", "₹4 Lacs", "At least 1 POS swipe in last 90 days. Covers fraudulent transactions upon timely reporting"],
                            ["Fire, Burglary & Baggage", "₹4 Lacs", "—", "₹4 Lacs", "Goods purchased with DC within 90 days + 1 POS transaction in last 90 days"],
                            ["Total Combined Protection", "₹3.29 Cr", "₹0.11 Cr", "₹3.18 Cr", "Active debit card usage ensures uninterrupted complimentary coverage"]
                        ]
                    }
                }
            ]
        },

        # Chapter 4: Module 2: Speciale Premium Savings (Slides 17-19)
        {
            "id": "ch4",
            "num": "M4",
            "shortTitle": "Speciale Savings",
            "title": "Module 2: Speciale Premium Savings",
            "subtitle": "Profile-Based Privileges, Higher Average Ticket Size & Lifetime Relationship Value",
            "blocks": [
                {
                    "type": "boxes",
                    "tag": "Premium Portfolio · Slide 18",
                    "heading": "New Premium Savings Offerings",
                    "body": "<p>The Speciale portfolio delivers curated relationship pricing and lifestyle privileges tailored to professional and demographic segments:</p>",
                    "boxGridCols": 2,
                    "boxes": [
                        {
                            "title": "Speciale Activ Savings Account",
                            "badge": "HOME LOAN ENABLER",
                            "badgeColor": "gold",
                            "icon": "media/image48.png",
                            "highlight": True,
                            "desc": "<strong>Pay Home Loan EMIs, Get Great Rewards:</strong> Seamlessly links to HDFC Bank Home Loans, transforming monthly EMI outflows into accelerated rewards and fee waivers."
                        },
                        {
                            "title": "Salary Speciale’ Program",
                            "badge": "CORPORATE PAYROLL",
                            "icon": "media/image49.png",
                            "highlight": True,
                            "desc": "<strong>Premium Corporate Salary:</strong> Platinum & Gold salary tiers offering zero-balance convenience, family banking benefits, and elevated credit limits."
                        },
                        {
                            "title": "Savings Plus Plan (5 pe 5)",
                            "badge": "ONBOARDING",
                            "icon": "media/image33.png",
                            "desc": "<strong>0–30 Days Customer Onboarding:</strong> Accelerates relationship depth for newly onboarded Savings and Salary account holders within the first month."
                        },
                        {
                            "title": "Speciale Senior Citizen Account",
                            "badge": "GOLDEN YEARS",
                            "icon": "media/image50.png",
                            "desc": "<strong>Enjoy Your Golden Years:</strong> Preferential FD interest rates, healthcare privileges, priority branch queueing, and doorstep banking."
                        }
                    ]
                },
                {
                    "type": "boxes",
                    "tag": "Sales Pitch Justification · Slide 19",
                    "heading": "Why Pitch a Speciale Account?",
                    "body": "<p>Compelling benefits of pitching the Speciale range for both the customer and the bank's balance sheet:</p>",
                    "boxGridCols": 3,
                    "boxes": [
                        {
                            "title": "2.5X Higher Ticket Size",
                            "badge": "BALANCE DEPTH",
                            "badgeColor": "green",
                            "icon": "media/image51.png",
                            "highlight": True,
                            "desc": "Speciale accounts generate <strong>2.5X higher Average Ticket Size (ATS)</strong> in deposit balances compared to regular entry-level accounts."
                        },
                        {
                            "title": "Profile-Tailored Benefits",
                            "badge": "CUSTOMER VALUE",
                            "icon": "media/image48.png",
                            "desc": "Customers enjoy custom privileges matching their profession, salary band, or life stage, maximizing customer delight."
                        },
                        {
                            "title": "Higher Bundling Opportunity",
                            "badge": "CROSS-SELL",
                            "icon": "media/image35.png",
                            "desc": "Deepens relationship tenure, dramatically lowering attrition while creating natural pathways for credit cards, investments, and mortgages."
                        }
                    ]
                }
            ]
        },

        # Chapter 5: Module 3: Account Opening Video Walkthroughs (Slides 20-21)
        {
            "id": "ch5",
            "num": "M5",
            "shortTitle": "AOF Walkthroughs",
            "title": "Module 3: Physical Account Opening Journeys",
            "subtitle": "Step-by-Step Form Completion, Customer Signature Verification & Checkpoints",
            "blocks": [
                {
                    "type": "video_placeholder",
                    "id": "vid_s20",
                    "badge": "AOF MASTERCLASS VIDEO",
                    "duration": "4m 30s",
                    "title": "How to Open the Physical Account (Slide 20)",
                    "embedUrl": v1,
                    "watchFor": [
                        "Step-by-step physical Account Opening Form (AOF) completion across all mandatory fields.",
                        "Mandatory specimen signature verification against identity documents.",
                        "Self-attestation protocol for Officially Valid Documents (OVDs)."
                    ]
                },
                {
                    "type": "video_placeholder",
                    "id": "vid_s21",
                    "badge": "COMPLIANCE AUDIT VIDEO",
                    "duration": "6m 15s",
                    "title": "One Account, Four Checkpoints (Slide 21)",
                    "embedUrl": v2,
                    "watchFor": [
                        "Checkpoint 1: Customer PAN and Aadhaar identity verification & biometric de-duplication.",
                        "Checkpoint 2: Address verification matching active residential OVD proof.",
                        "Checkpoint 3: Accurate initial funding cheque or digital fund transfer validation.",
                        "Checkpoint 4: Zero-defect Maker-Checker authorization workflow before dispatch."
                    ]
                }
            ]
        },

        # Chapter 6: Module 3: Interactive Knowledge Checks & Drills (Slides 22-25)
        {
            "id": "ch6",
            "num": "M6",
            "shortTitle": "Knowledge Drills",
            "title": "Module 3: Interactive Knowledge Drills",
            "subtitle": "Matching Drills, KYC Address Sorter & 3D Consultative Sales Flip Cards",
            "blocks": [
                {
                    "type": "card",
                    "tag": "Assessment Hub · Slide 22",
                    "heading": "Module 3: Knowledge Checks & Practical Drills",
                    "imageSrc": "media/slide_22.png",
                    "body": "<p>Test your product mastery and compliance readiness with three hands-on interactive activities: link current account solutions to merchant needs, validate address OVDs, and flip cards on sales call execution.</p>"
                },
                {
                    "type": "quiz_match",
                    "id": "quiz_s23",
                    "title": "Knowledge Check: Match Facilities to Needs (Slide 23)",
                    "options": [
                        "Doorstep Banking",
                        "Corporate Internet Banking",
                        "POS (EDC terminal)",
                        "Payment Gateway",
                        "Merchant Mobile App"
                    ],
                    "pairs": [
                        {"left": "Reduce the risk of carrying large cash sums to or from the branch", "answer": "Doorstep Banking"},
                        {"left": "GST, statutory tax payments, bulk salary payouts, and Maker-Checker workflows", "answer": "Corporate Internet Banking"},
                        {"left": "Card payments accepted over the counter at physical checkout", "answer": "POS (EDC terminal)"},
                        {"left": "Payments accepted when customers purchase online over the internet", "answer": "Payment Gateway"},
                        {"left": "Generating instant invoices and collecting by UPI/cards on home deliveries", "answer": "Merchant Mobile App"}
                    ]
                },
                {
                    "type": "kyc_sorter",
                    "id": "sorter_s24",
                    "title": "Knowledge Check: KYC Document Sorter (Slide 24)",
                    "instruction": "Decide which documents below qualify as an acceptable Officially Valid Document (OVD) for customer address verification under RBI regulations:",
                    "docs": [
                        {"name": "Passport with current residential address", "valid": True, "note": "Passport with updated residential address is a primary OVD under RBI regulations."},
                        {"name": "PAN Card alone as Address Proof", "valid": False, "note": "PAN is valid for identity proof only; it does not contain residential address and cannot verify address."},
                        {"name": "Voter ID Card issued by Election Commission of India", "valid": True, "note": "Voter ID is an approved OVD verifying both individual identity and current address."},
                        {"name": "Driving Licence with current address", "valid": True, "note": "Driving Licence with active validity and current address qualifies as a valid OVD."},
                        {"name": "Utility bill of an unrelated third party", "valid": False, "note": "Third-party utility bills without legal proof of relationship or power of attorney are strictly rejected."},
                        {"name": "Aadhaar Card / e-KYC with current residential address", "valid": True, "note": "Aadhaar Card or validated e-KYC XML is an officially recognized primary OVD."}
                    ]
                },
                {
                    "type": "flashcards",
                    "id": "fc_s25",
                    "title": "Knowledge Check: Consultative Sales Flip Cards (Slide 25)",
                    "instruction": "Tap any 3D card below to flip and reveal the benchmark sales execution takeaway:",
                    "cards": [
                        {
                            "q": "What are the 6 Steps to Run a High-Conversion Sales Call?",
                            "a": "1. Preparation & Prospect Research<br/>2. Professional Opening & Rapport<br/>3. Need Discovery & Open Probing<br/>4. Solution Presentation (Value over Price)<br/>5. Objection Handling (Clarify & Reassure)<br/>6. Closing & Action Next Steps"
                        },
                        {
                            "q": "What is Micro Market Catchment Mapping?",
                            "a": "Conducting a structured survey of all retail businesses, traders, commercial complexes, and housing societies within a 1–2 km radius of the branch to plan systematic daily outreach."
                        },
                        {
                            "q": "Why is Consultative Pitching superior to Product Pushing?",
                            "a": "Consultative pitching uncovers the customer's cash flow rhythms and operational friction points first. Matching the exact variant yields 2.5X higher ticket size, zero attrition, and long-term loyalty."
                        }
                    ]
                }
            ]
        },

        # Chapter 7: Module 3: Multilingual Account Opening Video Demos (Slides 26-28)
        {
            "id": "ch7",
            "num": "M7",
            "shortTitle": "Video Demos",
            "title": "Module 3: Multilingual Field Roleplay Videos",
            "subtitle": "Customer Engagement & Objection Handling Demos in Marathi, Hindi & Telugu",
            "blocks": [
                {
                    "type": "video_placeholder",
                    "id": "vid_s26",
                    "badge": "MARATHI DUB WALKTHROUGH",
                    "duration": "3m 45s",
                    "title": "Customer Complaint Handling & Deepening (Marathi Dub — Slide 26)",
                    "embedUrl": v3,
                    "watchFor": [
                        "Active listening and empathetic response to customer concerns at the branch counter.",
                        "Restoring trust through transparent turnaround time commitments.",
                        "Converting service interactions into account deepening opportunities."
                    ]
                },
                {
                    "type": "video_placeholder",
                    "id": "vid_s27",
                    "badge": "HINDI WALKTHROUGH",
                    "duration": "4m 10s",
                    "title": "Why Complaint Handling & Service Depth Matters (Hindi — Slide 27)",
                    "embedUrl": v4,
                    "watchFor": [
                        "De-escalation techniques for frustrated enterprise account holders.",
                        "Root-cause resolution protocols preventing repeat branch inquiries.",
                        "Building relationship advocacy that drives word-of-mouth merchant referrals."
                    ]
                },
                {
                    "type": "video_placeholder",
                    "id": "vid_s28",
                    "badge": "TELUGU WALKTHROUGH",
                    "duration": "5m 05s",
                    "title": "Six Steps to Run an Outstanding Sales Call (Telugu — Slide 28)",
                    "embedUrl": v5,
                    "watchFor": [
                        "In-person merchant store visit preparation and rapport building.",
                        "Uncovering payment collection pain points through consultative questioning.",
                        "Closing the Current Account with Merchant QR and POS bundle."
                    ]
                }
            ]
        },

        # Chapter 8: Course Completion & Sales Action Plan (Slide 29)
        {
            "id": "ch8",
            "num": "M8",
            "shortTitle": "Completion",
            "title": "Course Completion & Action Commitment",
            "subtitle": "Action Commitment, Facilitator Takeaways & SCORM 2004 Telemetry Sync",
            "blocks": [
                {
                    "type": "action_commitment",
                    "id": "action_s29",
                    "title": "Thank You & Action Commitment (Slide 29)",
                    "prompt": "You have completed Day 3: Products & Account Opening! Commit to your top 3 sales action priorities for this week:"
                }
            ]
        }
    ]

    return {
        "title": "HDFC Academy · Day 3: Products & Account Opening",
        "subtitle": "CASA • Savings & Current Accounts • CA Allied Products • Cards & Account Opening",
        "chapters": chapters,
        "assets": media_info["all_media"]
    }

def parse_pptx_into_course(pptx_path, output_dir=None):
    """
    Intelligently parses PPTX into the rich mobile micro-learning structure.
    Extracts chapters, MCQs, accordions, boxes, tables, reflection prompts, and structured cards.
    """
    media_info = extract_all_media_from_pptx(pptx_path, output_dir)
    video_map = media_info["video_map"]
    base_name = os.path.basename(pptx_path)
    clean_base = os.path.splitext(base_name)[0]

    # Explicit check: Only use pre-curated Day 2 dataset if filename is explicitly Day 2 Animated
    if "bse_day2" in base_name.lower() or "day_2_animated" in base_name.lower() or "day2_animated" in base_name.lower():
        course_data_js = load_template_file("js/courseData.js")
        import subprocess
        res = subprocess.run(["node", "-e", f"global.window = global; {course_data_js}; console.log(JSON.stringify(global.COURSE_CHAPTERS || global.COURSE_CHAPTERS_DAY2));"],
                             capture_output=True, text=True)
        if res.returncode == 0 and res.stdout.strip():
            chapters = json.loads(res.stdout)
            return {
                "title": "HDFC Academy · Day 2: KYC, Products & Sales Mastery",
                "subtitle": "KYC & AML, Savings Accounts, Current Accounts, Term Deposits & Consultative Sales",
                "chapters": chapters,
                "assets": [
                    "hero_roadmap.png", "m1_kyc_pillars.png", "m1_aml_redflags.png", "m1_doc_verification.png",
                    "m2_savings_matrix.png", "m3_ca_ecosystem.png", "m4_fd_payouts.png", "m4_fd_worked_example.png",
                    "m5_sales_mindset.png", "m6_sales_process.png", "m6_phone_script.png", "m7_demand_funnel.png",
                    "m8_need_vs_product.png", "m8_omnichannel_safe.png"
                ]
            }

    prs = Presentation(pptx_path)
    first_shapes = [s.text.strip() for s in prs.slides[0].shapes if s.has_text_frame and s.text.strip()]
    first_text = " ".join(first_shapes).lower()

    # General PPTX Intelligent Semantic & Visual Parsing
    total_slides = len(prs.slides)
    print(f"Parsing {total_slides} slides from {base_name}...")

    if len(first_shapes) > 1 and ("day" in first_shapes[1].lower() or "module" in first_shapes[1].lower() or "banking" in first_shapes[0].lower()):
        course_title = first_shapes[1]
        course_sub = first_shapes[2] if len(first_shapes) > 2 else first_shapes[0]
    elif first_shapes:
        course_title = first_shapes[0]
        course_sub = first_shapes[1] if len(first_shapes) > 1 else clean_base
    else:
        course_title = clean_base.replace('_', ' ').replace('-', ' ').strip()
        course_sub = "Interactive Mobile Micro-Learning Course"

    chapters = []
    current_ch = None
    slides_in_current_ch = 0

    for idx, slide in enumerate(prs.slides):
        notes = slide.notes_slide.notes_text_frame.text.strip() if slide.has_notes_slide and slide.notes_slide.notes_text_frame else ''
        slide_imgs = media_info["slide_image_map"].get(idx, [])
        primary_img = slide_imgs[0] if slide_imgs else None

        # 1. Collect all text-bearing shapes on this slide with positional data
        raw_shapes = []
        for s in slide.shapes:
            if s.has_text_frame and s.text and s.text.strip():
                top = getattr(s, 'top', 0) or 0
                left = getattr(s, 'left', 0) or 0
                paras = [p.text.strip() for p in s.text_frame.paragraphs if p.text and p.text.strip()]
                raw_shapes.append({
                    'shape': s,
                    'text': s.text.strip(),
                    'paragraphs': paras,
                    'top': top,
                    'left': left
                })

        # Sort shapes top-to-bottom, left-to-right (clustering roughly by row)
        raw_shapes.sort(key=lambda s: (s['top'] // 180000, s['left']))

        # Determine slide title and subtitle
        slide_title = ""
        slide_sub = ""
        if slide.shapes.title and slide.shapes.title.has_text_frame and slide.shapes.title.text.strip():
            slide_title = slide.shapes.title.text.strip().replace('\n', ' ')
        elif raw_shapes:
            slide_title = raw_shapes[0]['paragraphs'][0] if raw_shapes[0]['paragraphs'] else raw_shapes[0]['text'][:80]

        if not slide_title:
            slide_title = f"Slide {idx + 1}"

        # Other content shapes
        content_shapes = []
        for s in raw_shapes:
            if s['text'] == slide_title or (slide_title in s['text'] and len(s['text']) == len(slide_title)):
                if len(s['paragraphs']) > 1 and not slide_sub:
                    slide_sub = s['paragraphs'][1]
                continue
            content_shapes.append(s)

        # 2. Section divider / Chapter boundary detection
        is_opening = (idx == 0)
        is_explicit_divider = bool(re.search(r'^(module|chapter|part|section|agenda|unit|phase|topic|day)\s*(\d+|[ivx]+|\:|\-)', slide_title, re.I))
        is_short_transition = bool(len(raw_shapes) <= 2 and len(slide_title.split()) <= 6 and idx > 0 and (
            any(w in slide_title.lower() for w in ['overview', 'agenda', 'framework', 'architecture', 'strategy', 'roadmap', 'deep dive', 'recap', 'summary', 'key takeaways'])
        ))
        needs_chunk_split = bool(slides_in_current_ch >= 8 and len(slide_title.split()) <= 8)

        if is_opening or current_ch is None:
            current_ch = {
                'id': 'ch0',
                'num': '00',
                'shortTitle': 'Overview & Roadmap',
                'title': course_title,
                'subtitle': course_sub,
                'blocks': []
            }
            chapters.append(current_ch)
            slides_in_current_ch = 1
        elif (is_explicit_divider or is_short_transition or needs_chunk_split) and idx > 0:
            ch_idx = len(chapters)
            short_t = slide_title[:24]
            current_ch = {
                'id': f'ch{ch_idx}',
                'num': f'M{ch_idx}',
                'shortTitle': short_t,
                'title': slide_title,
                'subtitle': slide_sub or 'Interactive Learning & Key Concepts',
                'blocks': []
            }
            chapters.append(current_ch)
            slides_in_current_ch = 1
        else:
            slides_in_current_ch += 1

        # 3. Check for Tables (Safely handle python-pptx RowCollection)
        table_shape = next((s for s in slide.shapes if s.has_table), None)
        if table_shape:
            try:
                tbl = table_shape.table
                tbl_rows = list(tbl.rows)
                if tbl_rows:
                    headers = [c.text.strip().replace('\n', ' ') for c in tbl_rows[0].cells]
                    rows = []
                    for r in tbl_rows[1:]:
                        rows.append([c.text.strip().replace('\n', ' ') for c in r.cells])
                    current_ch['blocks'].append({
                        'type': 'card',
                        'tag': f'Slide {idx+1}',
                        'heading': slide_title,
                        'imageSrc': primary_img,
                        'body': f'<p>{slide_sub}</p>' if slide_sub and slide_sub != slide_title else '',
                        'table': {'headers': headers, 'rows': rows}
                    })
                    continue
            except Exception as tbl_err:
                print(f"Safe table fallback on slide {idx+1}: {tbl_err}")

        # 4. Check for MCQ / Knowledge Check on Slide
        all_text_snippets = [s['text'] for s in raw_shapes]
        has_q = False
        q_text = ''
        options = []
        for i, sh in enumerate(all_text_snippets):
            if sh == 'Q' and i + 1 < len(all_text_snippets):
                has_q = True
                q_text = all_text_snippets[i + 1]
            elif sh in ['A', 'B', 'C', 'D'] and i + 1 < len(all_text_snippets):
                options.append(all_text_snippets[i + 1])
            elif re.match(r'^[A-D][\.\:\)]\s+', sh):
                options.append(re.sub(r'^[A-D][\.\:\)]\s+', '', sh))
            elif '?' in sh and not has_q:
                q_text = sh

        if (has_q or "knowledge check" in slide_title.lower() or "quiz" in slide_title.lower()) and len(options) >= 2:
            current_ch['blocks'].append({
                'type': 'quiz_mcq',
                'id': f'quiz_s{idx+1}',
                'title': slide_title,
                'questions': [{
                    'q': q_text or 'Select the correct option based on standard operational guidelines:',
                    'options': options,
                    'correct': 0,
                    'explanation': f'Verified against best practices in {slide_title}.'
                }]
            })
            continue

        # 5. Embedded Video
        if idx in video_map:
            current_ch['blocks'].append({
                'type': 'video_placeholder',
                'id': f'vid_s{idx+1}',
                'badge': 'VIDEO WALKTHROUGH',
                'duration': '4m 30s',
                'title': slide_title,
                'embedUrl': video_map[idx],
                'watchFor': [
                    'Key operational steps, framework implementation, and customer interactions.',
                    'Zero-defect compliance standards and quality verification.'
                ]
            })
            continue

        # 6. Intelligent Visual Layout: Multiple Boxes, Collapsibles, or Cards
        # Scenario A: Slide contains 2 to 8 distinct content shapes (Multi-box layout)
        if 2 <= len(content_shapes) <= 8:
            boxes = []
            for b_idx, s in enumerate(content_shapes):
                p = s['paragraphs']
                b_title = p[0] if p else f"Point {b_idx + 1}"
                b_desc = ""
                b_bullets = []

                if len(p) > 1:
                    b_desc = p[1]
                    if len(p) > 2:
                        b_bullets = [f"<strong>{x}</strong>" if len(x) < 45 else x for x in p[2:6]]
                elif ':' in b_title and len(b_title.split(':', 1)[0]) < 50:
                    parts = b_title.split(':', 1)
                    b_title = parts[0].strip()
                    b_desc = parts[1].strip()

                # Associate image icon if available
                bx_icon = slide_imgs[b_idx + 1] if len(slide_imgs) > b_idx + 1 else None

                accent_type = b_idx % 3
                boxes.append({
                    'title': b_title,
                    'desc': b_desc,
                    'bullets': b_bullets if b_bullets else None,
                    'badge': f"0{b_idx + 1}",
                    'badgeColor': 'green' if accent_type == 1 else ('gold' if accent_type == 2 else ''),
                    'highlight': (accent_type == 0),
                    'green': (accent_type == 1),
                    'gold': (accent_type == 2),
                    'icon': bx_icon
                })

            card = {
                'type': 'card',
                'tag': f'Slide {idx+1}',
                'heading': slide_title,
                'imageSrc': primary_img if (not any(bx.get('icon') == primary_img for bx in boxes)) else None,
                'body': f'<p>{slide_sub}</p>' if slide_sub else '',
                'boxes': boxes,
                'boxGridCols': 2 if len(boxes) == 2 else (3 if len(boxes) == 3 else 4)
            }
            if notes:
                card['callout'] = {'type': 'tip', 'text': f'<strong>Facilitator Insight:</strong> {notes[:280]}'}
            current_ch['blocks'].append(card)
            continue

        # Scenario B: Content is in a single shape or list of paragraphs
        # Extract individual bullets / lines
        all_bullets = []
        body_text = slide_sub
        for s in content_shapes:
            for p in s['paragraphs']:
                if '\n' in p:
                    for line in p.split('\n'):
                        l = line.strip()
                        if l and l not in all_bullets: all_bullets.append(l)
                else:
                    if p not in all_bullets: all_bullets.append(p)

        # Check if bullets follow a structured "Title: Description" pattern
        can_box_bullets = []
        for bi, b in enumerate(all_bullets):
            sep = None
            for s_char in [':', ' - ', ' — ', ' – ']:
                if s_char in b and len(b.split(s_char, 1)[0]) < 60:
                    sep = s_char
                    break
            if sep:
                parts = b.split(sep, 1)
                can_box_bullets.append({
                    'title': parts[0].strip(),
                    'desc': parts[1].strip(),
                    'badge': f"0{bi+1}",
                    'highlight': (bi % 3 == 0),
                    'green': (bi % 3 == 1),
                    'gold': (bi % 3 == 2)
                })

        # If at least 2 bullets have structured title-description pairs, render as boxes or collapsibles!
        if len(can_box_bullets) >= 2:
            # If 5 or more detailed items, render as interactive collapsible accordions!
            if len(can_box_bullets) >= 5 and all(len(bx['desc']) > 60 for bx in can_box_bullets):
                collapsibles = [{
                    'title': bx['title'],
                    'content': f"<p>{bx['desc']}</p>",
                    'badge': bx['badge'],
                    'isOpen': (i == 0)
                } for i, bx in enumerate(can_box_bullets)]
                card = {
                    'type': 'card',
                    'tag': f'Slide {idx+1}',
                    'heading': slide_title,
                    'imageSrc': primary_img,
                    'body': f'<p>{body_text}</p>' if body_text else '',
                    'collapsibles': collapsibles
                }
            else:
                card = {
                    'type': 'card',
                    'tag': f'Slide {idx+1}',
                    'heading': slide_title,
                    'imageSrc': primary_img,
                    'body': f'<p>{body_text}</p>' if body_text else '',
                    'boxes': can_box_bullets,
                    'boxGridCols': 2 if len(can_box_bullets) == 2 else 3
                }
        else:
            # Standard high-visual card with bold bullet points and hero image
            card = {
                'type': 'card',
                'tag': f'Slide {idx+1}',
                'heading': slide_title,
                'imageSrc': primary_img,
                'body': f'<p>{body_text}</p>' if body_text else (f'<p>{all_bullets[0]}</p>' if all_bullets else ''),
                'bullets': [f'<strong>{b}</strong>' if len(b) < 60 else b for b in (all_bullets[1:] if not body_text and all_bullets else all_bullets[:8])] if all_bullets else None
            }

        if notes:
            card['callout'] = {'type': 'tip', 'text': f'<strong>Facilitator Insight:</strong> {notes[:280]}'}
        current_ch['blocks'].append(card)

    return {
        "title": course_title,
        "subtitle": course_sub,
        "chapters": chapters,
        "assets": media_info["all_media"]
    }


def ai_enhance_course(course_data, pptx_path=None):
    """
    AI Content Transformation using LiteLLM (azure-gpt-l1).
    Reads LITELLM_API / LITELLM_API_KEY and LITELLM_URL from environment / .env.
    Enriches the course with:
    1. Drag & Drop / KYC Document Sorter (kyc_sorter)
    2. Interactive Fill-in-the-Blanks with Word Bank (quiz_blanks)
    3. Match the Pair drills (quiz_match)
    4. Scenario-based MCQs (quiz_mcq)
    5. Opening Reflection & Objectives Accordion
    Preserves 100% of existing PPT cards, bullets, and notes.
    """
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    api_key = (os.getenv("LITELLM_API") or os.getenv("LITELLM_API_KEY") or "").strip()
    raw_url = (os.getenv("LITELLM_URL") or "https://litellm.niit.com/v1").strip()
    base_url = raw_url.rstrip("/")
    if not base_url.endswith("/v1"):
        base_url += "/v1"

    endpoint = f"{base_url}/chat/completions"
    model = os.getenv("LITELLM_MODEL", "azure-gpt-l1")

    topics = [ch.get("title", "") for ch in course_data.get("chapters", [])]
    prompt = f"""You are a senior banking instructional designer for HDFC Academy.
The course title is "{course_data.get('title', '')}".
Curriculum chapters:
{json.dumps(topics, indent=2)}

Create rich interactive activities in json format:
1. "drag_sorter": A Drag & Drop / Document Sorter (kyc_sorter) where learners classify 4 items into Valid (true) vs Invalid (false).
2. "quiz_blanks": An interactive Fill-in-the-Blanks activity with a "wordBank" array (4 terms) and 2-3 "items" (prompt with _______ and answer).
3. "quiz_match": A Match the Pair drill with 3-4 "options" and 3 "pairs" (left scenario, answer).
4. "scenario_quiz": A realistic branch scenario MCQ with "title", "question", 4 "options", "correct_index" (0-3), and "explanation".
5. "reflection_prompt": A thought-provoking opening question and "reflection_hint".

Return strictly valid json matching this schema:
{{
  "reflection_prompt": "string",
  "reflection_hint": "string",
  "drag_sorter": {{
    "title": "string",
    "instruction": "string",
    "docs": [
      {{"name": "string", "valid": true, "note": "string"}},
      {{"name": "string", "valid": false, "note": "string"}},
      {{"name": "string", "valid": true, "note": "string"}},
      {{"name": "string", "valid": false, "note": "string"}}
    ]
  }},
  "quiz_blanks": {{
    "title": "string",
    "wordBank": ["Term1", "Term2", "Term3", "Term4"],
    "items": [
      {{"prompt": "Sentence with _______ blank.", "answer": "Term1"}},
      {{"prompt": "Sentence with _______ blank.", "answer": "Term2"}}
    ]
  }},
  "quiz_match": {{
    "title": "string",
    "options": ["Option1", "Option2", "Option3"],
    "pairs": [
      {{"left": "Scenario 1", "answer": "Option1"}},
      {{"left": "Scenario 2", "answer": "Option2"}},
      {{"left": "Scenario 3", "answer": "Option3"}}
    ]
  }},
  "scenario_quiz": {{
    "title": "string",
    "question": "string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "string"
  }}
}}"""

    import requests
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a professional banking instructional designer. Return strictly valid json."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }

    parsed = None
    if api_key:
        try:
            print("Calling LiteLLM (azure-gpt-l1) to create interactive activities (MCQ, Drag & Drop, Blanks, Match)...")
            resp = requests.post(endpoint, headers=headers, json=payload, timeout=6)
            if resp.status_code == 200:
                content = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "{}")
                parsed = json.loads(content)
                print("✓ Successfully generated interactive activities from LiteLLM!")
        except Exception as e:
            print(f"LiteLLM call exception (falling back to curated activities): {e}")

    # Fallback high-yield activities if LiteLLM is not available or timed out
    if not parsed:
        c_title = course_data.get("title", "Course")
        c_sub = course_data.get("subtitle", "")
        combined_text = (c_title + " " + c_sub).lower()
        is_banking = any(k in combined_text for k in ["hdfc", "banking", "casa", "bank", "savings", "current account", "kyc"])

        if is_banking:
            parsed = {
                "reflection_prompt": "Why are low-cost CASA deposits considered the foundation of banking profitability and relationship depth?",
                "reflection_hint": "CASA directly funds retail and SME loans with low cost-of-funds, maximizing Net Interest Margin (NIM) and fostering long-term cross-sell opportunities.",
                "drag_sorter": {
                    "title": "Account Opening & KYC Document Sorter",
                    "instruction": "Sort each document below to verify if it qualifies as an acceptable Officially Valid Document (OVD) for address verification:",
                    "docs": [
                        {"name": "Passport with current residential address", "valid": True, "note": "Passport with updated address is a primary OVD under RBI regulations."},
                        {"name": "PAN Card alone as Address Proof", "valid": False, "note": "PAN is proof of identity only, not acceptable as address proof."},
                        {"name": "Voter ID Card issued by Election Commission", "valid": True, "note": "Voter ID is an approved OVD verifying both identity and current address."},
                        {"name": "Unverified relative electricity bill", "valid": False, "note": "Third-party utility bills are invalid without verified relationship/POA documentation."}
                    ]
                },
                "quiz_blanks": {
                    "title": "Fill-in-the-Blanks: CASA & Savings Max USPs",
                    "wordBank": ["CASA", "Savings Max", "Speciale", "Maker-Checker"],
                    "items": [
                        {"prompt": "Ultra low-cost deposits that maximize a bank's profitability and NIM are known as _______ deposits.", "answer": "CASA"},
                        {"prompt": "The premium savings account offering two-way sweep-in FD and higher insurance is _______.", "answer": "Savings Max"},
                        {"prompt": "The operational protocol where one employee prepares and another verifies is _______.", "answer": "Maker-Checker"}
                    ]
                },
                "quiz_match": {
                    "title": "Match Customer Profile to Best Product Solution",
                    "options": ["Regular Savings Account", "Savings Max Account", "Speciale Gold / Platinum", "Current Account with Merchant QR"],
                    "pairs": [
                        {"left": "High net-worth professional seeking premium privileges and relationship pricing", "answer": "Speciale Gold / Platinum"},
                        {"left": "Family breadwinner wanting automatic sweep-in FD for idle funds and high insurance", "answer": "Savings Max Account"},
                        {"left": "Retail trader receiving daily customer UPI payments and needing unlimited transactions", "answer": "Current Account with Merchant QR"}
                    ]
                },
                "scenario_quiz": {
                    "title": "Branch Operations Knowledge Check",
                    "question": "A customer visits the branch with cash from seasonal business sales asking where to park funds with maximum liquidity and safety. What is the most compliant and profitable recommendation?",
                    "options": [
                        "Recommend a Current Account / Savings Max with two-way Auto-Sweep to Fixed Deposits",
                        "Suggest investing entirely in speculative equity mutual funds without KYC",
                        "Open a temporary account without verifying PAN or official documents",
                        "Advise keeping cash in a safe deposit locker indefinitely"
                    ],
                    "correct_index": 0,
                    "explanation": "Auto-sweep deposits allow idle funds above a threshold to earn FD interest while liquidating automatically whenever cheques or withdrawals are presented."
                }
            }
        else:
            ch_titles = [c.get("title", "") for c in course_data.get("chapters", []) if c.get("title")]
            t_first = ch_titles[0] if ch_titles else c_title
            parsed = {
                "reflection_prompt": f"How can the core principles of {c_title} be effectively applied to drive measurable business outcomes?",
                "reflection_hint": f"Focus on strategic alignment, structured execution, and verifiable quality metrics outlined in {c_title}.",
                "drag_sorter": {
                    "title": f"Best Practice vs Operational Risk Sorter",
                    "instruction": "Classify each operational action below into Recommended Practice (true) vs Risk / Anti-Pattern (false):",
                    "docs": [
                        {"name": "Standardized execution with documented review checkpoints", "valid": True, "note": "Structured review gates ensure zero defects and quality governance."},
                        {"name": "Bypassing validation steps to accelerate delivery timelines", "valid": False, "note": "Skipping checks introduces operational risk and compounding errors."},
                        {"name": "Continuous telemetry tracking and metric monitoring", "valid": True, "note": "Real-time metrics ensure proactive issue resolution and sustained KPI attainment."},
                        {"name": "Relying on unverified assumptions without stakeholder sign-off", "valid": False, "note": "Unverified decisions lead to misalignment and rework."}
                    ]
                },
                "quiz_blanks": {
                    "title": "Core Terminology & Standards",
                    "wordBank": ["Governance", "Execution", "Milestones", "Compliance"],
                    "items": [
                        {"prompt": "Structured operational controls and accountability mechanisms are defined under _______.", "answer": "Governance"},
                        {"prompt": "Tracking measurable progress against defined deliverables requires clear _______.", "answer": "Milestones"},
                        {"prompt": "Adherence to regulatory and organizational standards is ensured through _______.", "answer": "Compliance"}
                    ]
                },
                "quiz_match": {
                    "title": "Strategy to Operational Impact Mapping",
                    "options": ["Proactive Governance", "Optimized Workflow", "Continuous Monitoring"],
                    "pairs": [
                        {"left": "Eliminating manual bottlenecks through automated protocols", "answer": "Optimized Workflow"},
                        {"left": "Early risk identification and policy adherence across teams", "answer": "Proactive Governance"},
                        {"left": "Tracking performance telemetry against baseline SLAs", "answer": "Continuous Monitoring"}
                    ]
                },
                "scenario_quiz": {
                    "title": f"{t_first[:40]} Knowledge Check",
                    "question": f"When implementing core initiatives under {t_first[:50]}, what is the foundational requirement for project success?",
                    "options": [
                        "Establish clear measurable success criteria and stakeholder alignment early",
                        "Begin implementation without defining requirements or governance",
                        "Operate without tracking progress metrics or documentation",
                        "Isolate the project team from cross-functional feedback"
                    ],
                    "correct_index": 0,
                    "explanation": "Standard methodologies require structured alignment, measurable metrics, and governance from inception."
                }
            }

    # Inject activities into course chapters while preserving all existing content
    chapters = course_data.get("chapters", [])
    if not chapters:
        return course_data

    # Check for existing interactive types
    has_sorter = any(b.get("type") == "kyc_sorter" for ch in chapters for b in ch.get("blocks", []))
    has_match = any(b.get("type") == "quiz_match" for ch in chapters for b in ch.get("blocks", []))
    has_blanks = any(b.get("type") == "quiz_blanks" for ch in chapters for b in ch.get("blocks", []))
    has_mcq = any(b.get("type") == "quiz_mcq" for ch in chapters for b in ch.get("blocks", []))

    # 1. Update Chapter 0 Think reflection
    if parsed.get("reflection_prompt") and len(chapters) > 0:
        ch0 = chapters[0]
        think_block = {
            "type": "think",
            "title": "Opening Reflection",
            "prompt": parsed["reflection_prompt"],
            "hint": parsed.get("reflection_hint", "Focus on customer discovery, trust, and compliance.")
        }
        think_idx = next((i for i, b in enumerate(ch0.get("blocks", [])) if b.get("type") == "think"), None)
        if think_idx is not None:
            ch0["blocks"][think_idx] = think_block
        else:
            ch0.setdefault("blocks", []).insert(0, think_block)

    # 2. Add Drag & Drop / Sorter to Chapter 1 or 2 if not already present
    if not has_sorter and parsed.get("drag_sorter") and len(chapters) > 1:
        ds = parsed["drag_sorter"]
        target_ch = chapters[1]
        target_ch["blocks"].append({
            "type": "kyc_sorter",
            "id": "ai_drag_sorter",
            "title": ds.get("title", "Interactive Sorter Drill"),
            "instruction": ds.get("instruction", "Sort items into Valid vs. Invalid:"),
            "docs": ds.get("docs", [])
        })

    # 3. Add Scenario MCQ to Chapter 1 if not already present
    if not has_mcq and parsed.get("scenario_quiz") and len(chapters) > 1:
        sq = parsed["scenario_quiz"]
        target_ch = chapters[1]
        target_ch["blocks"].append({
            "type": "quiz_mcq",
            "id": "ai_scenario_quiz",
            "title": sq.get("title", "Scenario Knowledge Check"),
            "questions": [{
                "q": sq.get("question", ""),
                "options": sq.get("options", []),
                "correct": sq.get("correct_index", 0),
                "explanation": sq.get("explanation", "Verified against bank guidelines.")
            }]
        })

    # 4. Add Fill-in-the-Blanks if not already present
    if not has_blanks and parsed.get("quiz_blanks"):
        qb = parsed["quiz_blanks"]
        target_ch = chapters[3] if len(chapters) > 3 else chapters[-1]
        target_ch["blocks"].append({
            "type": "quiz_blanks",
            "id": "ai_blanks_drill",
            "title": qb.get("title", "Word Bank Completion"),
            "wordBank": qb.get("wordBank", []),
            "items": qb.get("items", [])
        })

    # 5. Add Match the Pairs if not already present
    if not has_match and parsed.get("quiz_match"):
        qm = parsed["quiz_match"]
        target_ch = chapters[4] if len(chapters) > 4 else chapters[-1]
        target_ch["blocks"].append({
            "type": "quiz_match",
            "id": "ai_match_drill",
            "title": qm.get("title", "Interactive Matching Drill"),
            "options": qm.get("options", []),
            "pairs": qm.get("pairs", [])
        })

    return course_data

def generate_standalone_html(course_data):
    """
    Bundles HTML, CSS, JS, and CourseData into one self-contained portable HTML file.
    """
    css_content = load_template_file("css/style.css")
    scorm2004_js = load_template_file("js/scorm2004.js")
    app_js = load_template_file("js/app.js")
    chapters = course_data["chapters"]
    chapters_json = json.dumps(chapters, indent=2)
    clean_title = re.sub(r'[^a-zA-Z0-9_]', '_', course_data.get('title') or 'Course')[:30]
    storage_key = f"scorm_{clean_title}"
    is_hdfc = "hdfc" in course_data.get('title', '').lower()
    brand_pill = "HDFC ACADEMY" if is_hdfc else "ACADEMY"

    shell_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <title>{course_data.get('title', 'Course')}</title>
  <style>
{css_content}
  </style>
</head>
<body>
  <div class="app-shell">
    <!-- Sticky Mobile Header -->
    <header class="top-bar">
      <div class="top-bar-row">
        <button id="menuBtn" class="icon-btn" aria-label="Open Course Modules" title="All Modules">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="brand-lockup">
          <span class="brand-pill">{brand_pill}</span>
          <h1 id="headerTitle" class="header-title">{course_data['chapters'][0]['shortTitle'] if course_data.get('chapters') else 'Course'}</h1>
        </div>
        <div class="score-pill" id="scorePill" title="Quiz Mastery Score">0%</div>
      </div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" id="progressBarWrap">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <div class="sub-bar">
        <span id="stepIndicator" class="step-label">Chapter 1 of {len(course_data['chapters'])}</span>
        <span id="lmsBadge" class="lms-status">Offline &amp; SCORM Ready</span>
      </div>
    </header>

    <!-- Slide-Over Module Drawer -->
    <div id="drawerBackdrop" class="drawer-backdrop hidden"></div>
    <aside id="navDrawer" class="nav-drawer" aria-hidden="true">
      <div class="drawer-header">
        <div>
          <div class="drawer-kicker">CURRICULUM</div>
          <div class="drawer-title">All {len(course_data['chapters'])} Chapters</div>
        </div>
        <button id="closeDrawerBtn" class="icon-btn dark" aria-label="Close Menu">✕</button>
      </div>
      <div class="drawer-stats">
        <div class="stat-box">
          <span class="stat-val" id="drawerCompleted">0/{len(course_data['chapters'])}</span>
          <span class="stat-lbl">Chapters</span>
        </div>
        <div class="stat-box">
          <span class="stat-val" id="drawerScore">0%</span>
          <span class="stat-lbl">Quiz Score</span>
        </div>
        <div class="stat-box">
          <span class="stat-val">2</span>
          <span class="stat-lbl">Video Slots</span>
        </div>
      </div>
      <nav id="moduleList" class="module-list"></nav>
      <div class="drawer-footer">
        <button id="finishCourseBtn" class="btn-finish">Submit &amp; Complete Course</button>
      </div>
    </aside>

    <!-- Main Scrollable Mobile Content Area -->
    <main id="mainContent" class="main-content" tabindex="-1"></main>

    <!-- Bottom Thumb-Zone Navigation Bar -->
    <footer class="bottom-nav">
      <button id="prevBtn" class="nav-btn secondary">
        <span>← Prev</span>
      </button>
      <button id="quickIndexBtn" class="nav-btn center-pill">
        <span id="bottomChapterTag">01 / {len(course_data['chapters'])}</span>
      </button>
      <button id="nextBtn" class="nav-btn primary">
        <span id="nextBtnLabel">Next →</span>
      </button>
    </footer>
  </div>

  <script>
{scorm2004_js}
  </script>
  <script>
var COURSE_CHAPTERS = {chapters_json};
window.COURSE_CHAPTERS = COURSE_CHAPTERS;
window.COURSE_CHAPTERS_DAY2 = COURSE_CHAPTERS;
window.COURSE_STORAGE_KEY = "{storage_key}";
  </script>
  <script>
{app_js}
  </script>
</body>
</html>"""
    return shell_html

def build_scorm2004_zip(course_data, zip_path, media_dir=None):
    """
    Packages the course into a certified SCORM 2004 4th Edition Zip Archive.
    Includes all assets and embedded video files.
    """
    import copy
    course_data = copy.deepcopy(course_data)

    # 1. Extract embedded Base64 Data URLs to real media files in zip
    data_url_pattern = re.compile(r'data:image/([a-zA-Z0-9+]+);base64,([A-Za-z0-9+/=]+)')
    raw_json = json.dumps(course_data)
    extracted_media = {}
    counter = [0]

    def data_url_repl(match):
        counter[0] += 1
        ext = match.group(1).lower()
        if 'svg' in ext:
            ext = 'svg'
        elif ext == 'jpeg':
            ext = 'jpg'
        b64_data = match.group(2)
        arcname = f"media/image_upload_{counter[0]}.{ext}"
        try:
            extracted_media[arcname] = base64.b64decode(b64_data)
            return arcname
        except Exception:
            return match.group(0)

    cleaned_json = data_url_pattern.sub(data_url_repl, raw_json)
    course_data = json.loads(cleaned_json)

    css_content = load_template_file("css/style.css")
    scorm2004_js = load_template_file("js/scorm2004.js")
    app_js = load_template_file("js/app.js")
    clean_title = re.sub(r'[^a-zA-Z0-9_]', '_', course_data.get('title') or 'Course')[:30]
    storage_key = f"scorm_{clean_title}"
    is_hdfc = "hdfc" in course_data.get('title', '').lower()
    brand_pill = "HDFC ACADEMY" if is_hdfc else "ACADEMY"

    course_data_js = f"""var COURSE_CHAPTERS = {json.dumps(course_data.get('chapters', []), indent=2)};
window.COURSE_CHAPTERS = COURSE_CHAPTERS;
window.COURSE_CHAPTERS_DAY2 = COURSE_CHAPTERS;
window.COURSE_CHAPTERS_DAY3 = COURSE_CHAPTERS;
window.COURSE_STORAGE_KEY = "{storage_key}";
"""
    first_short_title = 'Overview'
    if course_data.get('chapters') and len(course_data['chapters']) > 0:
        first_short_title = course_data['chapters'][0].get('shortTitle') or course_data['chapters'][0].get('title') or 'Overview'
    num_chapters = len(course_data.get('chapters', []))

    total_videos = sum(
        len([b for b in ch.get('blocks', []) if b.get('type') == 'video_placeholder'])
        for ch in course_data.get('chapters', [])
    )

    index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <title>{html.escape(course_data.get('title', 'Course'))}</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div class="app-shell">
    <!-- Sticky Mobile Header -->
    <header class="top-bar">
      <div class="top-bar-row">
        <button id="menuBtn" class="icon-btn" aria-label="Open Course Modules" title="All Modules">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="brand-lockup">
          <span class="brand-pill">{brand_pill}</span>
          <h1 id="headerTitle" class="header-title">{html.escape(first_short_title)}</h1>
        </div>
        <div class="score-pill" id="scorePill" title="Quiz Mastery Score">0%</div>
      </div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" id="progressBarWrap">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <div class="sub-bar">
        <span id="stepIndicator" class="step-label">Chapter 1 of {num_chapters}</span>
        <span id="lmsBadge" class="lms-status">SCORM 2004 Ready</span>
      </div>
    </header>

    <!-- Slide-Over Module Drawer -->
    <div id="drawerBackdrop" class="drawer-backdrop hidden"></div>
    <aside id="navDrawer" class="nav-drawer" aria-hidden="true">
      <div class="drawer-header">
        <div>
          <div class="drawer-kicker">CURRICULUM</div>
          <div class="drawer-title">All {num_chapters} Chapters</div>
        </div>
        <button id="closeDrawerBtn" class="icon-btn dark" aria-label="Close Menu">✕</button>
      </div>
      <div class="drawer-stats">
        <div class="stat-box">
          <span class="stat-val" id="drawerCompleted">0/{num_chapters}</span>
          <span class="stat-lbl">Chapters</span>
        </div>
        <div class="stat-box">
          <span class="stat-val" id="drawerScore">0%</span>
          <span class="stat-lbl">Quiz Score</span>
        </div>
        <div class="stat-box">
          <span class="stat-val">{total_videos}</span>
          <span class="stat-lbl">Video Slots</span>
        </div>
      </div>
      <nav id="moduleList" class="module-list"></nav>
      <div class="drawer-footer">
        <button id="finishCourseBtn" class="btn-finish">Submit &amp; Complete Course</button>
      </div>
    </aside>

    <!-- Main Scrollable Mobile Content Area -->
    <main id="mainContent" class="main-content" tabindex="-1"></main>

    <!-- Bottom Thumb-Zone Navigation Bar -->
    <footer class="bottom-nav">
      <button id="prevBtn" class="nav-btn secondary">
        <span>← Prev</span>
      </button>
      <button id="quickIndexBtn" class="nav-btn center-pill">
        <span id="bottomChapterTag">01 / {num_chapters}</span>
      </button>
      <button id="nextBtn" class="nav-btn primary">
        <span id="nextBtnLabel">Next →</span>
      </button>
    </footer>
  </div>

  <script src="js/scorm2004.js"></script>
  <script src="js/courseData.js"></script>
  <script src="js/app.js"></script>
</body>
</html>"""

    # Discover media referenced specifically by this course
    media_json_str = json.dumps(course_data)
    media_exts = r'\.(?:png|jpg|jpeg|gif|webp|svg|mp4|webm|mp3|wav|ogg|m4a|aac)'
    referenced_media_names = set(re.findall(r'(?:media/|[/\\])?([a-zA-Z0-9_\- .%]+' + media_exts + r')', media_json_str, re.IGNORECASE))
    referenced_asset_names = set(re.findall(r'(?:assets/|[/\\])?([a-zA-Z0-9_\- .%]+' + media_exts + r')', media_json_str, re.IGNORECASE))

    for asset in course_data.get("assets", []):
        referenced_asset_names.add(os.path.basename(asset))

    # Search paths for media
    pub_media = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "media")
    template_assets = os.path.join(TEMPLATE_DIR, "assets")
    ref_assets = os.path.join(REF_SCORM_DIR, "assets")

    media_dirs_to_search = []
    if media_dir and os.path.exists(media_dir):
        media_dirs_to_search.append(media_dir)
    if os.path.exists(pub_media) and pub_media not in media_dirs_to_search:
        media_dirs_to_search.append(pub_media)

    media_files = []
    seen_media = set()

    # 1. Add referenced media files from disk
    for mname in referenced_media_names:
        clean_mname = mname.split('?')[0].split('#')[0].strip()
        if not clean_mname:
            continue
        for mdir in media_dirs_to_search:
            candidate = os.path.join(mdir, clean_mname)
            if os.path.isfile(candidate) and clean_mname not in seen_media:
                seen_media.add(clean_mname)
                media_files.append((candidate, f"media/{clean_mname}"))
                break

    # 2. If a dedicated conversion media_dir was provided (not public/media),
    # include only presentation slide images belonging to this deck
    if media_dir and os.path.exists(media_dir):
        try:
            is_same_as_pub = os.path.samefile(media_dir, pub_media) if os.path.exists(pub_media) else False
        except Exception:
            is_same_as_pub = os.path.abspath(media_dir) == os.path.abspath(pub_media)
        if not is_same_as_pub:
            for fname in os.listdir(media_dir):
                if os.path.isfile(os.path.join(media_dir, fname)) and fname not in seen_media and not fname.startswith('.'):
                    if fname.startswith('slide_') or fname.startswith('image'):
                        seen_media.add(fname)
                        media_files.append((os.path.join(media_dir, fname), f"media/{fname}"))

    # 3. Add referenced assets
    asset_files = []
    seen_assets = set()
    for aname in referenced_asset_names:
        clean_aname = aname.split('?')[0].split('#')[0].strip()
        if not clean_aname:
            continue
        for adir in [template_assets, ref_assets]:
            candidate = os.path.join(adir, clean_aname)
            if os.path.isfile(candidate) and clean_aname not in seen_assets:
                seen_assets.add(clean_aname)
                asset_files.append((candidate, f"assets/{clean_aname}"))
                break

    # 4. Generate manifest XML resource items (only for existing files written to zip)
    asset_files_xml = "".join(f'      <file href="{arc}"/>\n' for _, arc in asset_files)
    media_files_xml = "".join(f'      <file href="{arc}"/>\n' for _, arc in media_files)
    extracted_xml = "".join(f'      <file href="{arc}"/>\n' for arc in extracted_media.keys())

    clean_raw_id = re.sub(r'[^a-zA-Z0-9_]', '_', course_data.get("title") or "Course").strip('_')
    if not clean_raw_id or not clean_raw_id[0].isalpha():
        clean_raw_id = f"COURSE_{clean_raw_id}"
    identifier = clean_raw_id[:35]
    xml_safe_title = html.escape(course_data.get("title") or "Course", quote=True)

    manifest_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{identifier}_SCORM2004" version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                              http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
                              http://www.adlnav_v1p3 adlnav_v1p3.xsd
                              http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="ORG_{identifier}">
    <organization identifier="ORG_{identifier}" structure="hierarchical">
      <title>{xml_safe_title}</title>
      <item identifier="ITEM_{identifier}" identifierref="RES_{identifier}" isvisible="true">
        <title>{xml_safe_title}</title>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true"/>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_{identifier}" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html"/>
      <file href="css/style.css"/>
      <file href="js/scorm2004.js"/>
      <file href="js/courseData.js"/>
      <file href="js/app.js"/>
{asset_files_xml}{media_files_xml}{extracted_xml}    </resource>
  </resources>
</manifest>"""

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("imsmanifest.xml", manifest_xml)
        zf.writestr("index.html", index_html)
        zf.writestr("css/style.css", css_content)
        zf.writestr("js/scorm2004.js", scorm2004_js)
        zf.writestr("js/courseData.js", course_data_js)
        zf.writestr("js/app.js", app_js)

        for fpath, arcname in asset_files:
            zf.write(fpath, arcname)

        for fpath, arcname in media_files:
            zf.write(fpath, arcname)

        for arcname, b_data in extracted_media.items():
            zf.writestr(arcname, b_data)

def ingest_scorm_zip(zip_path, output_dir=None):
    """
    Ingests an existing SCORM 2004 or 1.2 zip archive dynamically.
    Extracts courseData.js, media files (voiceovers, slide images, videos),
    and reconstructs the standalone HTML preview and SCORM 2004 package.
    """
    if not output_dir:
        output_dir = os.path.dirname(os.path.abspath(zip_path))
    os.makedirs(output_dir, exist_ok=True)
    media_dir = os.path.join(output_dir, "media")
    os.makedirs(media_dir, exist_ok=True)
    public_media_dir = os.path.join("public", "media")
    os.makedirs(public_media_dir, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(zip_path))[0]
    clean_base = re.sub(r'[\(\)\d\s_]+$', '', base_name).strip()
    clean_base = re.sub(r'_SCORM.*$', '', clean_base, flags=re.I).strip()
    clean_base = re.sub(r'[^a-zA-Z0-9_\-]', '_', clean_base)
    clean_base = re.sub(r'_+', '_', clean_base).strip('_')
    if not clean_base:
        clean_base = "Imported_SCORM_Course"

    extracted_temp = os.path.join(output_dir, f"_temp_scorm_{clean_base}")
    os.makedirs(extracted_temp, exist_ok=True)

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extracted_temp)

        course_data_js = None
        for root, dirs, files in os.walk(extracted_temp):
            for file in files:
                if file.lower() == "coursedata.js":
                    course_data_js = os.path.join(root, file)
                    break
            if course_data_js:
                break

        title = clean_base.replace('_', ' ')
        chapters = []
        if course_data_js and os.path.exists(course_data_js):
            with open(course_data_js, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                m_chap = re.search(r'var COURSE_CHAPTERS = (\[.*?\]);\s*(?:window|var|$)', content, re.DOTALL)
                if m_chap:
                    try:
                        chapters = json.loads(m_chap.group(1))
                    except Exception as err:
                        print(f"Error parsing COURSE_CHAPTERS: {err}")
                m_cfg = re.search(r'var COURSE_CONFIG = ({.*?});\s*(?:window|var|$)', content, re.DOTALL)
                if m_cfg:
                    try:
                        cfg = json.loads(m_cfg.group(1))
                        if cfg.get("title"):
                            title = cfg["title"]
                    except Exception:
                        pass
                if (not title or title == clean_base.replace('_', ' ')) and chapters:
                    if chapters[0].get("title"):
                        title = chapters[0]["title"]

        # If title not found from courseData.js, check imsmanifest.xml
        imsmanifest_xml = None
        for root, dirs, files in os.walk(extracted_temp):
            for file in files:
                if file.lower() == "imsmanifest.xml":
                    imsmanifest_xml = os.path.join(root, file)
                    break
            if imsmanifest_xml:
                break

        if imsmanifest_xml and os.path.exists(imsmanifest_xml):
            with open(imsmanifest_xml, 'r', encoding='utf-8', errors='ignore') as xf:
                xml_txt = xf.read()
                m_t = re.search(r'<title>(?:<langstring[^>]*>)?(.*?)(?:</langstring>)?</title>', xml_txt, re.IGNORECASE | re.DOTALL)
                if m_t:
                    t_cand = html.unescape(m_t.group(1).strip())
                    if t_cand and not t_cand.startswith('<'):
                        title = t_cand

        # If chapters still empty, look for matching existing course in public/ or dist/
        if not chapters:
            pub_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
            if os.path.exists(pub_dir):
                norm_target = re.sub(r'[^a-zA-Z0-9]', '', clean_base).lower()
                for existing_f in os.listdir(pub_dir):
                    if existing_f.endswith('.html') and not existing_f.startswith('index'):
                        norm_ex = re.sub(r'[^a-zA-Z0-9]', '', os.path.splitext(existing_f)[0]).lower()
                        if (
                            norm_ex == norm_target
                            or norm_ex in norm_target
                            or norm_target in norm_ex
                            or (('day3' in norm_ex or 'day_3' in norm_ex) and ('day3' in norm_target or 'day_3' in norm_target))
                        ):
                            with open(os.path.join(pub_dir, existing_f), 'r', encoding='utf-8', errors='ignore') as ef:
                                m_ex_ch = re.search(r'var COURSE_CHAPTERS = (\[.*?\]);\s*window\.COURSE_CHAPTERS', ef.read(), re.DOTALL)
                                if m_ex_ch:
                                    try:
                                        chapters = json.loads(m_ex_ch.group(1))
                                        print(f"Loaded {len(chapters)} matching chapters for {clean_base}")
                                        break
                                    except Exception:
                                        pass

        # Extract and preserve all media
        extracted_media = []
        for root, dirs, files in os.walk(extracted_temp):
            for file in files:
                low = file.lower()
                if any(low.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".mp3", ".wav", ".m4a", ".aac", ".mp4", ".webm", ".ogg", ".mov", ".m4v"]):
                    src_f = os.path.join(root, file)
                    dest_f = os.path.join(media_dir, file)
                    try:
                        if not os.path.exists(dest_f) or os.path.getsize(dest_f) != os.path.getsize(src_f):
                            shutil.copy2(src_f, dest_f)
                        dest_pub = os.path.join(public_media_dir, file)
                        if not os.path.exists(dest_pub) or os.path.getsize(dest_pub) != os.path.getsize(src_f):
                            shutil.copy2(src_f, dest_pub)
                    except Exception:
                        pass
                    extracted_media.append(file)

        # Include any existing public media (e.g. uploaded or converted videos)
        if os.path.exists(public_media_dir):
            for f in os.listdir(public_media_dir):
                dest = os.path.join(media_dir, f)
                try:
                    if not os.path.exists(dest):
                        shutil.copy2(os.path.join(public_media_dir, f), dest)
                except Exception:
                    pass
                if f not in extracted_media:
                    extracted_media.append(f)

        # Build intelligent dynamic chapters from extracted videos, audios, and assets if still empty
        if not chapters:
            all_vids = [m for m in extracted_media if any(m.lower().endswith(ext) for ext in [".mp4", ".webm", ".mov"])]
            all_auds = [m for m in extracted_media if any(m.lower().endswith(ext) for ext in [".mp3", ".wav", ".m4a"])]
            all_imgs = [m for m in extracted_media if any(m.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg"])]

            # Chapter 0: Overview
            ch0_blocks = [
                {
                    "type": "think",
                    "title": "Course Introduction",
                    "prompt": f"Welcome to {title}. Reflect on how mastering these operational standards empowers excellence.",
                    "hint": "Mastering consultative customer journeys and operational rigor ensures zero-defect delivery."
                }
            ]
            if all_imgs:
                ch0_blocks.append({
                    "type": "card",
                    "tag": "Course Intro",
                    "heading": title,
                    "imageSrc": f"media/{all_imgs[0]}",
                    "body": f"<p>Welcome to <strong>{title}</strong>. This interactive digital course equips you with complete product mastery, documentation protocols, and step-by-step operational workflows.</p>"
                })
            chapters.append({
                "id": "ch0",
                "num": "00",
                "shortTitle": "Overview & Roadmap",
                "title": title,
                "subtitle": "Interactive SCORM Learning Course",
                "blocks": ch0_blocks
            })

            # Video modules
            for v_idx, vid in enumerate(all_vids):
                clean_vid_title = re.sub(r'^(video_|media)', '', os.path.splitext(vid)[0])
                clean_vid_title = clean_vid_title.replace('_', ' ').capitalize()
                chapters.append({
                    "id": f"ch_vid_{v_idx+1}",
                    "num": f"M{v_idx+1}",
                    "shortTitle": f"Video Walkthrough {v_idx+1}",
                    "title": f"Video Walkthrough: {clean_vid_title}",
                    "subtitle": "Interactive Video Roleplay & Demonstration",
                    "blocks": [
                        {
                            "type": "video_placeholder",
                            "id": f"vid_block_{v_idx+1}",
                            "badge": "VIDEO WALKTHROUGH",
                            "duration": "3m 30s",
                            "title": clean_vid_title,
                            "embedUrl": f"media/{vid}",
                            "watchFor": [
                                "Observe key dialogue, consultative opening, and rapport building.",
                                "Notice zero-defect documentation verification and protocol compliance."
                            ]
                        }
                    ]
                })

        course_data = {
            "title": title,
            "subtitle": "Interactive SCORM 2004 Course",
            "chapters": chapters,
            "assets": extracted_media
        }

        # Generate Standalone HTML
        html_path = os.path.join(output_dir, f"{clean_base}.html")
        html_content = generate_standalone_html(course_data)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        # Copy to public/ and dist/ if different
        for target_dir in ["public", "dist"]:
            if os.path.exists(target_dir):
                t_html = os.path.join(target_dir, f"{clean_base}.html")
                try:
                    if os.path.abspath(t_html) != os.path.abspath(html_path):
                        shutil.copy2(html_path, t_html)
                except Exception:
                    pass

        # Build SCORM 2004 ZIP
        scorm_zip_path = os.path.join(output_dir, f"{clean_base}_SCORM2004.zip")
        build_scorm2004_zip(course_data, scorm_zip_path, media_dir=media_dir)
        for target_dir in ["public", "dist"]:
            if os.path.exists(target_dir):
                t_zip = os.path.join(target_dir, f"{clean_base}_SCORM2004.zip")
                try:
                    if os.path.abspath(t_zip) != os.path.abspath(scorm_zip_path):
                        shutil.copy2(scorm_zip_path, t_zip)
                except Exception:
                    pass

        return {
            "title": course_data["title"],
            "course_name": clean_base,
            "filename": clean_base,
            "total_chapters": len(course_data["chapters"]),
            "html_path": html_path,
            "scorm_zip_path": scorm_zip_path,
            "course_data": course_data
        }
    finally:
        if os.path.exists(extracted_temp):
            shutil.rmtree(extracted_temp, ignore_errors=True)

def convert_pptx_to_b2b(pptx_path, output_dir=None):
    if not output_dir:
        output_dir = os.path.dirname(os.path.abspath(pptx_path))
    os.makedirs(output_dir, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(pptx_path))[0]
    print(f"=== Converting {base_name} to Mobile-First SCORM 2004 & HTML ===")

    course_data = parse_pptx_into_course(pptx_path, output_dir=output_dir)
    course_data = ai_enhance_course(course_data, pptx_path)

    # 1. Build Standalone HTML
    html_path = os.path.join(output_dir, f"{base_name}.html")
    html_content = generate_standalone_html(course_data)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"✓ Created Standalone HTML: {html_path}")

    # 2. Build SCORM 2004 ZIP
    scorm_zip_path = os.path.join(output_dir, f"{base_name}_SCORM2004.zip")
    media_dir = os.path.join(output_dir, "media")
    build_scorm2004_zip(course_data, scorm_zip_path, media_dir=media_dir)
    print(f"✓ Created SCORM 2004 Package with Video & Quizzes: {scorm_zip_path}")

    return {
        "title": course_data["title"],
        "total_chapters": len(course_data["chapters"]),
        "html_path": html_path,
        "scorm_zip_path": scorm_zip_path,
        "course_data": course_data
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 converter.py <presentation.pptx> [output_dir]")
        sys.exit(1)
    convert_pptx_to_b2b(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
