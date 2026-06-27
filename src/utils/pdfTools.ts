import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple PDF files into a single PDF Uint8Array.
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Splits a PDF file into individual pages.
 * Returns an array of Uint8Arrays, one for each page.
 */
export async function splitPDF(file: File): Promise<{ pageNum: number; data: Uint8Array }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageCount = pdf.getPageCount();
  const result: { pageNum: number; data: Uint8Array }[] = [];

  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
    singlePagePdf.addPage(copiedPage);
    const data = await singlePagePdf.save();
    result.push({ pageNum: i + 1, data });
  }

  return result;
}

/**
 * Creates a PDF from an array of image files.
 */
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let embeddedImage;

    if (file.type === "image/png") {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      // For other formats, convert to standard JPG/PNG first via Canvas in UI,
      // or try to embed as standard jpg
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        continue; // Skip unsupported embed types
      }
    }

    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });
  }

  return await pdfDoc.save();
}

/**
 * Converts text drafted or parsed from docx to a PDF using basic pdf-lib text drawing.
 */
export async function textToPDF(title: string, text: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  
  // Simple layout
  page.drawText(title, {
    x: 50,
    y: height - 80,
    size: 24,
  });

  const lines = text.split("\n");
  let currentY = height - 130;
  
  for (const line of lines) {
    if (currentY < 50) {
      // Add a page if text overflows
      const newPage = pdfDoc.addPage([600, 800]);
      currentY = 750;
    }
    // Limit line width (simple wrapping helper)
    const words = line.split(" ");
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + " " + word).length > 60) {
        page.drawText(currentLine, { x: 50, y: currentY, size: 11 });
        currentY -= 18;
        currentLine = word;
      } else {
        currentLine = currentLine === "" ? word : currentLine + " " + word;
      }
    }
    if (currentLine !== "") {
      page.drawText(currentLine, { x: 50, y: currentY, size: 11 });
      currentY -= 22; // space after paragraph
    }
  }

  return await pdfDoc.save();
}
