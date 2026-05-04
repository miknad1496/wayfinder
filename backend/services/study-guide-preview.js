// PATCH98: graceful degradation when pdf-lib/adm-zip aren't installed.
// Imports are dynamic so missing deps don't crash server boot - the route
// handler treats "preview module unavailable" as a 503 with an actionable
// error message.

let _pdfLib = null;
let _admZip = null;
let _initOnce = null;

async function _ensureDeps() {
  if (_pdfLib && _admZip) return { pdfLib: _pdfLib, AdmZip: _admZip };
  if (_initOnce) return _initOnce;
  _initOnce = (async () => {
    try { _pdfLib = await import('pdf-lib'); }
    catch (e) { console.warn('[study-guide-preview] pdf-lib unavailable:', e.message); }
    try { const m = await import('adm-zip'); _admZip = m.default || m; }
    catch (e) { console.warn('[study-guide-preview] adm-zip unavailable:', e.message); }
    return { pdfLib: _pdfLib, AdmZip: _admZip };
  })();
  return _initOnce;
}

export async function previewFromPdf(srcBuffer) {
  const { pdfLib } = await _ensureDeps();
  if (!pdfLib) {
    const err = new Error('preview library (pdf-lib) not installed');
    err.code = 'PREVIEW_LIB_MISSING';
    throw err;
  }
  const { PDFDocument, rgb, StandardFonts } = pdfLib;
  const src = await PDFDocument.load(srcBuffer);
  const pageCount = src.getPageCount();
  if (pageCount === 0) throw new Error('PDF has no pages');

  const keep = Math.max(1, Math.ceil(pageCount * 0.5));
  const out = await PDFDocument.create();
  const indices = Array.from({ length: keep }, (_, i) => i);
  const copied = await out.copyPages(src, indices);
  for (const p of copied) out.addPage(p);

  const lastPage = out.getPages()[out.getPageCount() - 1];
  const { width, height } = lastPage.getSize();
  const stripCount = 24;
  const stripHeight = (height * 0.45) / stripCount;
  for (let i = 0; i < stripCount; i++) {
    const opacity = 1 - (i / stripCount) * 1.0;
    lastPage.drawRectangle({
      x: 0,
      y: i * stripHeight,
      width,
      height: stripHeight + 0.5,
      color: rgb(1, 1, 1),
      opacity,
    });
  }

  try {
    const font = await out.embedFont(StandardFonts.HelveticaBold);
    const footerText = 'Free preview — upgrade for the full guide';
    const fontSize = 12;
    const textWidth = font.widthOfTextAtSize(footerText, fontSize);
    lastPage.drawRectangle({
      x: 0, y: 0, width, height: 38,
      color: rgb(0.12, 0.227, 0.541),
      opacity: 1,
    });
    lastPage.drawText(footerText, {
      x: (width - textWidth) / 2,
      y: 14,
      size: fontSize,
      font,
      color: rgb(1, 1, 1),
    });
  } catch (footerErr) {}

  return Buffer.from(await out.save());
}

export async function previewFromDocx(srcBuffer) {
  const { AdmZip } = await _ensureDeps();
  if (!AdmZip) {
    const err = new Error('preview library (adm-zip) not installed');
    err.code = 'PREVIEW_LIB_MISSING';
    throw err;
  }
  const zip = new AdmZip(srcBuffer);
  const docEntry = zip.getEntry('word/document.xml');
  if (!docEntry) throw new Error('docx has no word/document.xml');
  const xml = docEntry.getData().toString('utf8');

  const bodyOpenIdx = xml.indexOf('<w:body>');
  const bodyCloseIdx = xml.lastIndexOf('</w:body>');
  if (bodyOpenIdx < 0 || bodyCloseIdx < 0 || bodyCloseIdx < bodyOpenIdx) return srcBuffer;
  const before = xml.slice(0, bodyOpenIdx + '<w:body>'.length);
  const body = xml.slice(bodyOpenIdx + '<w:body>'.length, bodyCloseIdx);
  const after = xml.slice(bodyCloseIdx);

  const paragraphs = body.split(/(?<=<\/w:p>)/);
  const keep = Math.max(1, Math.ceil(paragraphs.length * 0.5));
  const truncated = paragraphs.slice(0, keep).join('');

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

export async function generatePreview(srcBuffer, extension) {
  const ext = (extension || '').toLowerCase().replace(/^\./, '');
  if (ext === 'pdf') {
    const buf = await previewFromPdf(srcBuffer);
    return { buf, contentType: 'application/pdf', extension: 'pdf' };
  }
  if (ext === 'docx') {
    const buf = await previewFromDocx(srcBuffer);
    return {
      buf,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
    };
  }
  throw new Error('Unsupported extension for preview: ' + ext);
}
