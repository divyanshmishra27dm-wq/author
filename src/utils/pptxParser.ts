import JSZip from 'jszip';
import { CourseData, CourseSlide, SlideContentBlock, SlideLayout, PositionedElement } from '../types/course';

interface ExtractedShape {
  text: string;
  isTitle: boolean;
  isSubtitle: boolean;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: number;
  paragraphs: {
    text: string;
    level: number;
    isBold: boolean;
    isItalic?: boolean;
    fontSize?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
  }[];
}

export async function parsePptxFile(file: File | Blob): Promise<CourseData> {
  const zip = await JSZip.loadAsync(file);

  // 1. Get presentation relationships and slide dimensions
  const presRelsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('text');
  const presentationXml = await zip.file('ppt/presentation.xml')?.async('text');

  let slideWidthEmu = 12192000; // default 16:9
  let slideHeightEmu = 6858000;

  if (presentationXml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(presentationXml, 'application/xml');
    const sldSz = doc.getElementsByTagName('p:sldSz')[0];
    if (sldSz) {
      const cx = parseInt(sldSz.getAttribute('cx') || '12192000', 10);
      const cy = parseInt(sldSz.getAttribute('cy') || '6858000', 10);
      if (cx > 0) slideWidthEmu = cx;
      if (cy > 0) slideHeightEmu = cy;
    }
  }

  const slideRelMap = new Map<string, string>();
  if (presRelsXml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(presRelsXml, 'application/xml');
    const rels = doc.getElementsByTagName('Relationship');
    for (let i = 0; i < rels.length; i++) {
      const rel = rels[i];
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      const type = rel.getAttribute('Type');
      if (id && target && type && type.includes('slide')) {
        const cleanTarget = target.startsWith('/') 
          ? target.slice(1) 
          : (target.startsWith('ppt/') ? target : `ppt/${target}`);
        slideRelMap.set(id, cleanTarget);
      }
    }
  }

  const slidePaths: string[] = [];
  if (presentationXml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(presentationXml, 'application/xml');
    const sldIds = doc.getElementsByTagName('p:sldId');
    for (let i = 0; i < sldIds.length; i++) {
      const rId = sldIds[i].getAttribute('r:id');
      if (rId && slideRelMap.has(rId)) {
        slidePaths.push(slideRelMap.get(rId)!);
      }
    }
  }

  if (slidePaths.length === 0) {
    zip.forEach((path) => {
      if (path.match(/ppt\/slides\/slide\d+\.xml$/)) {
        slidePaths.push(path);
      }
    });
    slidePaths.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/) ? a.match(/\d+/)![0] : '0', 10);
      const numB = parseInt(b.match(/\d+/) ? b.match(/\d+/)![0] : '0', 10);
      return numA - numB;
    });
  }

  const slides: CourseSlide[] = [];
  let courseTitle = file instanceof File ? file.name.replace(/\.[^/.]+$/, '') : 'Corporate Presentation';

  for (let index = 0; index < slidePaths.length; index++) {
    const slidePath = slidePaths[index];
    const slideXml = await zip.file(slidePath)?.async('text');
    if (!slideXml) continue;

    // Load relationships for images
    const slideRelPath = slidePath.replace('ppt/slides/', 'ppt/slides/_rels/').concat('.rels');
    const relsXml = await zip.file(slideRelPath)?.async('text');
    const imageMap = new Map<string, string>();

    if (relsXml) {
      const relDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
      const rels = relDoc.getElementsByTagName('Relationship');
      for (let i = 0; i < rels.length; i++) {
        const id = rels[i].getAttribute('Id');
        const target = rels[i].getAttribute('Target');
        const type = rels[i].getAttribute('Type');
        if (id && target && type && type.includes('image')) {
          const mediaPath = target.startsWith('..')
            ? `ppt/${target.replace('../', '')}`
            : (target.startsWith('/') ? target.slice(1) : `ppt/slides/${target}`);

          const mediaFile = zip.file(mediaPath);
          if (mediaFile) {
            const ext = mediaPath.split('.').pop()?.toLowerCase() || 'png';
            const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : (ext === 'svg' ? 'image/svg+xml' : `image/${ext}`);
            const base64 = await mediaFile.async('base64');
            imageMap.set(id, `data:${mimeType};base64,${base64}`);
          }
        }
      }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(slideXml, 'application/xml');

    const positionedElements: PositionedElement[] = [];
    const shapes: ExtractedShape[] = [];

    // Helper: read xfrm coordinates into percentages
    const parseXfrm = (parent: Element) => {
      const xfrm = parent.getElementsByTagName('a:xfrm')[0];
      if (!xfrm) return null;
      const off = xfrm.getElementsByTagName('a:off')[0];
      const ext = xfrm.getElementsByTagName('a:ext')[0];
      if (!off || !ext) return null;

      const x = parseInt(off.getAttribute('x') || '0', 10);
      const y = parseInt(off.getAttribute('y') || '0', 10);
      const cx = parseInt(ext.getAttribute('cx') || '0', 10);
      const cy = parseInt(ext.getAttribute('cy') || '0', 10);

      return {
        leftPct: Math.max(0, Math.min(100, (x / slideWidthEmu) * 100)),
        topPct: Math.max(0, Math.min(100, (y / slideHeightEmu) * 100)),
        widthPct: Math.max(1, Math.min(100, (cx / slideWidthEmu) * 100)),
        heightPct: Math.max(1, Math.min(100, (cy / slideHeightEmu) * 100))
      };
    };

    // Helper: read solid fill color
    const parseFillColor = (parent: Element): string | undefined => {
      const solidFill = parent.getElementsByTagName('a:solidFill')[0];
      if (solidFill) {
        const srgb = solidFill.getElementsByTagName('a:srgbClr')[0];
        if (srgb && srgb.getAttribute('val')) {
          return `#${srgb.getAttribute('val')}`;
        }
      }
      return undefined;
    };

    // 1. Extract Pictures with exact positioning
    const picElements = doc.getElementsByTagName('p:pic');
    for (let i = 0; i < picElements.length; i++) {
      const pic = picElements[i];
      const blip = pic.getElementsByTagName('a:blip')[0];
      const embedId = blip ? blip.getAttribute('r:embed') : null;
      if (embedId && imageMap.has(embedId)) {
        const imgUrl = imageMap.get(embedId)!;
        const coords = parseXfrm(pic) || { leftPct: 10, topPct: 20, widthPct: 30, heightPct: 40 };

        positionedElements.push({
          id: `pos-img-${i}`,
          type: 'image',
          leftPct: coords.leftPct,
          topPct: coords.topPct,
          widthPct: coords.widthPct,
          heightPct: coords.heightPct,
          imageUrl: imgUrl
        });
      }
    }

    // 2. Extract Tables with exact positioning
    const graphicFrames = doc.getElementsByTagName('p:graphicFrame');
    for (let i = 0; i < graphicFrames.length; i++) {
      const gf = graphicFrames[i];
      const tbl = gf.getElementsByTagName('a:tbl')[0];
      if (tbl) {
        const coords = parseXfrm(gf) || { leftPct: 5, topPct: 30, widthPct: 90, heightPct: 40 };
        const rows = tbl.getElementsByTagName('a:tr');
        const tableData: string[][] = [];

        for (let r = 0; r < rows.length; r++) {
          const cells = rows[r].getElementsByTagName('a:tc');
          const rowData: string[] = [];
          for (let c = 0; c < cells.length; c++) {
            const texts = cells[c].getElementsByTagName('a:t');
            let t = '';
            for (let k = 0; k < texts.length; k++) t += texts[k].textContent || '';
            rowData.push(t.trim());
          }
          if (rowData.some(cell => cell.length > 0)) tableData.push(rowData);
        }

        if (tableData.length > 0) {
          positionedElements.push({
            id: `pos-tbl-${i}`,
            type: 'table',
            leftPct: coords.leftPct,
            topPct: coords.topPct,
            widthPct: coords.widthPct,
            heightPct: coords.heightPct,
            tableData
          });
        }
      }
    }

    // 3. Extract Shapes & Text with coordinates and styles
    const spElements = doc.getElementsByTagName('p:sp');
    for (let i = 0; i < spElements.length; i++) {
      const sp = spElements[i];
      const ph = sp.getElementsByTagName('p:ph')[0];
      const phType = ph ? ph.getAttribute('type') : null;
      const isTitle = phType === 'title' || phType === 'ctrTitle';
      const isSubtitle = phType === 'subTitle';

      const coords = parseXfrm(sp) || {
        leftPct: isTitle ? 8 : 8,
        topPct: isTitle ? 10 : 30 + (i * 12),
        widthPct: 84,
        heightPct: isTitle ? 14 : 10
      };

      const spPr = sp.getElementsByTagName('p:spPr')[0];
      let bgColor = spPr ? parseFillColor(spPr) : undefined;
      // Do not use pure black backgrounds for shapes unless intentional
      if (bgColor === '#000000' && !isTitle) bgColor = undefined;

      const txBody = sp.getElementsByTagName('p:txBody')[0];
      if (!txBody) continue;

      const pTags = txBody.getElementsByTagName('a:p');
      const paragraphs: ExtractedShape['paragraphs'] = [];
      let fullShapeText = '';

      for (let j = 0; j < pTags.length; j++) {
        const pTag = pTags[j];
        const pPr = pTag.getElementsByTagName('a:pPr')[0];
        const lvl = pPr ? parseInt(pPr.getAttribute('lvl') || '0', 10) : 0;
        const algn = pPr?.getAttribute('algn');
        const align = algn === 'ctr' ? 'center' : (algn === 'r' ? 'right' : 'left');

        const rTags = pTag.getElementsByTagName('a:r');
        let pText = '';
        let isBold = false;
        let isItalic = false;
        let fontSize: number | undefined;
        let textColor: string | undefined;

        for (let k = 0; k < rTags.length; k++) {
          const r = rTags[k];
          const t = r.getElementsByTagName('a:t')[0]?.textContent || '';
          const rPr = r.getElementsByTagName('a:rPr')[0];
          if (rPr) {
            if (rPr.getAttribute('b') === '1') isBold = true;
            if (rPr.getAttribute('i') === '1') isItalic = true;
            const sz = rPr.getAttribute('sz');
            if (sz) fontSize = Math.round(parseInt(sz, 10) / 100);
            const clr = parseFillColor(rPr);
            if (clr) textColor = clr;
          }
          pText += t;
        }

        pText = pText.trim();
        if (pText.length > 0) {
          paragraphs.push({
            text: pText,
            level: lvl,
            isBold: isBold || (isTitle && j === 0),
            isItalic,
            fontSize,
            color: textColor,
            align
          });
          fullShapeText += (fullShapeText ? '\n' : '') + pText;
        }
      }

      if (paragraphs.length > 0) {
        shapes.push({
          text: fullShapeText,
          isTitle,
          isSubtitle,
          leftPct: coords.leftPct,
          topPct: coords.topPct,
          widthPct: coords.widthPct,
          heightPct: coords.heightPct,
          bgColor,
          paragraphs
        });

        positionedElements.push({
          id: `pos-shape-${i}`,
          type: 'text',
          leftPct: coords.leftPct,
          topPct: coords.topPct,
          widthPct: coords.widthPct,
          heightPct: coords.heightPct,
          bgColor,
          borderRadius: 8,
          text: fullShapeText,
          isTitle,
          paragraphs
        });
      }
    }

    // Extract Facilitator & Speaker Notes
    let slideNotes = '';
    const notePath = `ppt/notesSlides/notesSlide${index + 1}.xml`;
    const noteXml = await zip.file(notePath)?.async('text');
    if (noteXml) {
      const noteDoc = new DOMParser().parseFromString(noteXml, 'application/xml');
      const noteTexts = noteDoc.getElementsByTagName('a:t');
      const parts: string[] = [];
      for (let n = 0; n < noteTexts.length; n++) {
        const txt = noteTexts[n].textContent?.trim();
        if (txt && !txt.match(/^\d+$/)) {
          parts.push(txt);
        }
      }
      slideNotes = parts.join(' ');
    }

    // Determine Slide Title and Subtitle
    let slideTitle = '';
    let slideSubtitle = '';

    const titleShapeIndex = shapes.findIndex(s => s.isTitle);
    if (titleShapeIndex >= 0) {
      slideTitle = shapes[titleShapeIndex].paragraphs[0]?.text || `Slide ${index + 1}`;
      if (shapes[titleShapeIndex].paragraphs.length > 1) {
        slideSubtitle = shapes[titleShapeIndex].paragraphs.slice(1).map(p => p.text).join(' • ');
      }
    } else if (shapes.length > 0) {
      slideTitle = shapes[0].paragraphs[0]?.text || `Slide ${index + 1}`;
    } else {
      slideTitle = `Module ${index + 1}`;
    }

    if (index === 0 && slideTitle && !slideTitle.startsWith('Slide')) {
      courseTitle = slideTitle;
    }

    // Build structured semantic blocks for Mobile Re-imagination mode
    const blocks: SlideContentBlock[] = [];
    const nonTitleShapes = shapes.filter(s => !s.isTitle);

    for (const sh of nonTitleShapes) {
      const bulletItems: string[] = [];
      for (const p of sh.paragraphs) {
        if (p.level > 0 || p.text.startsWith('•') || p.text.startsWith('-') || /^\d+\./.test(p.text)) {
          bulletItems.push(p.text.replace(/^[•\-\*]\s*/, ''));
        } else {
          if (bulletItems.length > 0) {
            blocks.push({ id: `blk-${Math.random().toString(36).slice(2)}`, type: 'bullet-list', items: [...bulletItems] });
            bulletItems.length = 0;
          }
          if (p.isBold && p.text.length < 80) {
            blocks.push({ id: `blk-${Math.random().toString(36).slice(2)}`, type: 'subheading', text: p.text });
          } else {
            blocks.push({ id: `blk-${Math.random().toString(36).slice(2)}`, type: 'paragraph', text: p.text });
          }
        }
      }
      if (bulletItems.length > 0) {
        blocks.push({ id: `blk-${Math.random().toString(36).slice(2)}`, type: 'bullet-list', items: bulletItems });
      }
    }

    // Append images & tables to blocks for mobile view
    for (const posEl of positionedElements) {
      if (posEl.type === 'image' && posEl.imageUrl) {
        blocks.push({ id: `blk-img-${posEl.id}`, type: 'image', imageUrl: posEl.imageUrl });
      } else if (posEl.type === 'table' && posEl.tableData) {
        blocks.push({ id: `blk-tbl-${posEl.id}`, type: 'table', tableData: posEl.tableData });
      }
    }

    let layout: SlideLayout = index === 0 ? 'title' : (blocks.some(b => b.type === 'bullet-list') ? 'bullets' : 'content');

    slides.push({
      id: `slide-${index + 1}`,
      slideNumber: index + 1,
      title: slideTitle,
      subtitle: slideSubtitle || undefined,
      layout,
      blocks,
      positionedElements,
      notes: slideNotes || undefined
    });
  }

  if (slides.length === 0) {
    slides.push({
      id: 'slide-1',
      slideNumber: 1,
      title: 'Course Introduction',
      layout: 'title',
      blocks: [{ id: 'blk-1', type: 'paragraph', text: 'Welcome to this interactive learning experience.' }],
      positionedElements: []
    });
  }

  return {
    title: courseTitle,
    subtitle: 'B2B Enterprise Interactive Presentation',
    description: `SCORM 2004 4th Edition interactive course containing ${slides.length} modules with facilitator notes.`,
    author: 'Enterprise Learning Division',
    slides,
    theme: {
      id: 'b2b-corporate',
      name: 'B2B Corporate Blue',
      primaryColor: '#2563eb',
      primaryLight: '#eff6ff',
      accentColor: '#10b981',
      backgroundColor: '#eef2f5',
      cardBackground: '#ffffff',
      textColor: '#1e293b',
      textMuted: '#64748b',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    },
    scormSettings: {
      version: '2004 4th Edition',
      identifier: `B2B_COURSE_${Date.now()}`,
      title: courseTitle,
      description: `B2B SCORM 2004 4th Edition module for ${courseTitle}`,
      passingScore: 80,
      masteryScore: 80,
      allowRetake: true,
      requireQuizPass: true,
      author: 'Enterprise Learning'
    },
    slideWidth: slideWidthEmu,
    slideHeight: slideHeightEmu
  };
}
