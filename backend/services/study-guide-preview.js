// PATCH97: study-guide preview generator.
// Free tier downloads HALF of one study guide (their choosing); paid users
// get the full file. Two preview paths: PDF (via pdf-lib, with fade gradient
// on the last visible page) and DOCX fallback (paragraph-level truncation
// via adm-zip on word/document.xml).

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import AdmZip from 'adm-zip';

/**
 * Generate a preview PDF: keep first ~50% pages, draw a white-to-transparent
 * fade gradient over the bottom 40% of the LAST included page so the cutoff
 * looks intentional / teases the rest. Add a small footer overlay nudging
 * the user to upgrade.
 */
export async function previewFromPdf(srcBuffer) {
  const src = await PDFDocument.load(srcBuffer);
  const pageCount = src.getPageCount();
  if (pageCount === 0) throw new Error('PDF has no pages');

  const keep = Math.max(1, Math.ceil(pageCount * 0.5));
  const out = await PDFDocument.create();
  const indices = Array.from({ length: keep }, (_, i) => i);
  const copied = await out.copyPages(src, indices);
  for (const p of copied) out.addPage(p);

  // Apply fade gradient to the LAST kept page
  const lastPage = out.getPages()[out.getPageCount() - 1];
  const { width, height } = lastPage.getSize();
  // Fade gradient: simulate using ~20 thin horizontal strips with increasing opacity
  const stripCount = 24;
  const stripHeight = (height * 0.45) / stripCount;
  const baseY = height * 0.0; // start at bottom
  for (let i = 0; i < stripCount; i++) {
    // i=0 is most opaque (bottom); approaches 0 opacity at top of fade region
    const opacity = 1 - (i / stripCount) * 1.0;
    lastPage.drawRectangle({
      x: 0,
      y: baseY + i * stripHeight,
      width,
      height: stripHeight + 0.5, // tiny overlap to avoid hairlines
      color: rgb(1, 1, 1),
      opacity,
    });
  }

  // Footer overlay
  try {
    const font = await out.embedFont(StandardFonts.HelveticaBold);
    const footerText = 'Free preview — upgrade for the full guide';
    const fontSize = 12;
    const textWidth = font.widthOfTextAtSize(footerText, fontSize);
    lastPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 38,
      color: rgb(0.12, 0.227, 0.541), // navy
      opacity: 1,
    });
    lastPage.drawText(footerText, {
      x: (width - textWidth) / 2,
      y: 14,
      size: fontSize,
      font,
      color: rgb(1, 1, 1),
    });
  } catch (footerErr) {
    // Non-fatal; fade still applied
  }

  return Buffer.from(await out.save());
}

/**
 * Generate a preview DOCX: keep first ~50% of <w:p> paragraphs, append a
 * "TO CONTINUE: upgrade to Coach or Consultant" notice paragraph.
 * This is the fallback for as long as a particular exam has only a .docx
 * committed (not a .pdf).
 */
export function previewFromDocx(srcBuffer) {
  const zip = new AdmZip(srcBuffer);
  const docEntry = zip.getEntry('word/document.xml');
  if (!docEntry) throw new Error('docx has no word/document.xml');
  const xml = docEntry.getData().toString('utf8');

  // Split paragraphs while preserving text-section markers.
  // Naive but workable: pull out the body content between <w:body> ... </w:body>,
  // then split paragraphs by the closing </w:p>.
  const bodyOpenIdx = xml.indexOf('<w:body>');
  const bodyCloseIdx = xml.lastIndexOf('</w:body>');
  if (bodyOpenIdx < 0 || bodyCloseIdx < 0 || bodyCloseIdx < bodyOpenIdx) {
    return srcBuffer; // can't safely truncate; return original
  }
  const before = xml.slice(0, bodyOpenIdx + '<w:body>'.length);
  const body = xml.slice(bodyOpenIdx + '<w:body>'.length, bodyCloseIdx);
  const after = xml.slice(bodyCloseIdx);

  // Split into paragraph chunks
  const paragraphs = body.split(/(?<=<\/w:p>)/);
  const keep = Math.max(1, Math.ceil(paragraphs.length * 0.5));
  const truncated = paragraphs.slice(0, keep).join('');

  // Tease paragraph (uses minimal Word XML; avoids needing styles defined)
  const teaseXml = [
    '<w:p>',
    '<w:pPr><w:spacing w:before="240" w:after="120"/><w:jc w:val="center"/></w:pPr>',
    '<w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E3A8A"/></w:rPr>',
    '<w:t xml:space="preserve">--- Free preview ends here ---</w:t>',
    '</w:r>',
    '</w:p>',
    '<w:p>',
    '<w:pPr><w:jc w:val="center"/></w:pPr>',
    '<w:r><w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="475569"/></w:rPr>',
    '<w:t xml:space="preserve">Upgrade to Coach or Consultant for the full guide.</w:t>',
    '</w:r>',
    '</w:p>',
  ].join('');

  const newXml = before + truncated + teaseXml + after;
  zip.updateFile('word/document.xml', Buffer.from(newXml, 'utf8'));
  return zip.toBuffer();
}

/**
 * Pick the right preview generator based on the file extension.
 * Returns { buf, contentType, extension } or throws.
 */
export async function generatePreview(srcBuffer, extension) {
  const ext = (extension || '').toLowerCase().replace(/^\./, '');
  if (ext === 'pdf') {
    const buf = await previewFromPdf(srcBuffer);
    return { buf, contentType: 'application/pdf', extension: 'pdf' };
  }
  if (ext === 'docx') {
    const buf = previewFromDocx(srcBuffer);
    return {
      buf,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
    };
  }
  throw new Error('Unsupported extension for preview: ' + ext);
}
