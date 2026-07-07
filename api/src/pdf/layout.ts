import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb, RGB } from "pdf-lib";

export const COLORS = {
  unBlue: rgb(0, 0.6196, 0.8588), // #009EDB
  unBlueDark: rgb(0, 0.4471, 0.7373), // #0072BC
  navy: rgb(0.1216, 0.2471, 0.4667), // #1F3F77
  text: rgb(0.15, 0.15, 0.15),
  muted: rgb(0.42, 0.45, 0.49),
  border: rgb(0.82, 0.85, 0.88),
  white: rgb(1, 1, 1),
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
export const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
}

export class PdfLayout {
  doc: PDFDocument;
  fonts: Fonts;
  page!: PDFPage;
  y = 0;
  pageNumber = 0;

  constructor(doc: PDFDocument, fonts: Fonts) {
    this.doc = doc;
    this.fonts = fonts;
    this.addPage();
  }

  addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pageNumber += 1;
    this.y = PAGE_HEIGHT - MARGIN;
    this.drawFooter();
  }

  private drawFooter() {
    const label = String(this.pageNumber);
    const size = 9;
    const width = this.fonts.regular.widthOfTextAtSize(label, size);
    this.page.drawText(label, {
      x: PAGE_WIDTH / 2 - width / 2,
      y: MARGIN / 2,
      size,
      font: this.fonts.regular,
      color: COLORS.muted,
    });
  }

  ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.addPage();
    }
  }

  spacer(height: number) {
    this.y -= height;
  }

  headerImage(image: PDFImage, caption?: string) {
    const width = PAGE_WIDTH;
    const height = (image.height / image.width) * width;
    this.ensureSpace(height);
    const top = this.y;
    this.page.drawImage(image, { x: 0, y: top - height, width, height });
    if (caption) {
      this.page.drawText(caption, {
        x: MARGIN,
        y: top - height * 0.9,
        size: 20,
        font: this.fonts.bold,
        color: COLORS.white,
      });
    }
    this.spacer(height + 20);
  }

  sectionHeading(text: string) {
    this.ensureSpace(34);
    this.page.drawRectangle({ x: MARGIN, y: this.y - 20, width: 4, height: 20, color: COLORS.unBlue });
    this.page.drawText(text, { x: MARGIN + 12, y: this.y - 17, size: 14, font: this.fonts.bold, color: COLORS.navy });
    this.spacer(30);
  }

  subHeading(text: string) {
    const lines = wrapText(text, this.fonts.bold, 11.5, CONTENT_WIDTH);
    this.ensureSpace(lines.length * 15 + 6);
    for (const line of lines) {
      this.page.drawText(line, { x: MARGIN, y: this.y - 12, size: 11.5, font: this.fonts.bold, color: COLORS.unBlueDark });
      this.spacer(15);
    }
    this.spacer(2);
  }

  paragraph(text: string, opts: { size?: number; color?: RGB } = {}) {
    const size = opts.size ?? 10.5;
    const color = opts.color ?? COLORS.text;
    const lines = wrapText(text, this.fonts.regular, size, CONTENT_WIDTH);
    for (const line of lines) {
      this.ensureSpace(size + 4);
      this.page.drawText(line, { x: MARGIN, y: this.y - size, size, font: this.fonts.regular, color });
      this.spacer(size + 4);
    }
    this.spacer(6);
  }

  bullet(headline: string, detail: string) {
    const bulletIndent = 14;
    const textWidth = CONTENT_WIDTH - bulletIndent;
    const combined = headline ? `${headline} ${detail}` : detail;
    const lines = wrapText(combined, this.fonts.regular, 10.5, textWidth);
    this.ensureSpace(lines.length * 14 + 4);
    this.page.drawCircle({ x: MARGIN + 3, y: this.y - 6, size: 2, color: COLORS.unBlue });
    let first = true;
    for (const line of lines) {
      this.ensureSpace(14);
      if (headline && first) {
        const headlineWidth = this.fonts.bold.widthOfTextAtSize(headline + " ", 10.5);
        if (headlineWidth < textWidth) {
          this.page.drawText(headline, {
            x: MARGIN + bulletIndent,
            y: this.y - 10.5,
            size: 10.5,
            font: this.fonts.bold,
            color: COLORS.navy,
          });
          const rest = line.slice(headline.length).trim();
          this.page.drawText(rest, {
            x: MARGIN + bulletIndent + headlineWidth,
            y: this.y - 10.5,
            size: 10.5,
            font: this.fonts.regular,
            color: COLORS.text,
          });
          this.spacer(14);
          first = false;
          continue;
        }
      }
      this.page.drawText(line, { x: MARGIN + bulletIndent, y: this.y - 10.5, size: 10.5, font: this.fonts.regular, color: COLORS.text });
      this.spacer(14);
      first = false;
    }
    this.spacer(4);
  }

  simpleBullet(text: string) {
    this.bullet("", text);
  }

  table(headers: string[], rows: string[][], opts: { boldLastRow?: boolean; boldLastCol?: boolean } = {}) {
    const colCount = headers.length;
    const firstColWidth = CONTENT_WIDTH * 0.34;
    const otherColWidth = (CONTENT_WIDTH - firstColWidth) / (colCount - 1);
    const colWidths = [firstColWidth, ...Array(colCount - 1).fill(otherColWidth)];
    const lineHeight = 11;
    const vPad = 10;

    const drawRow = (cells: string[], opts2: { header?: boolean; boldRow?: boolean }) => {
      const size = 9.5;
      const cellLines = cells.map((cell, i) => {
        const font = opts2.header || opts2.boldRow || (opts.boldLastCol && i === cells.length - 1) ? this.fonts.bold : this.fonts.regular;
        return wrapText(cell, font, size, colWidths[i] - 8);
      });
      const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
      const rowHeight = maxLines * lineHeight + vPad;

      this.ensureSpace(rowHeight);
      const rowTop = this.y;
      let x = MARGIN;
      if (opts2.header) {
        this.page.drawRectangle({ x: MARGIN, y: rowTop - rowHeight, width: CONTENT_WIDTH, height: rowHeight, color: COLORS.unBlueDark });
      }
      cells.forEach((cell, i) => {
        const font = opts2.header || opts2.boldRow || (opts.boldLastCol && i === cells.length - 1) ? this.fonts.bold : this.fonts.regular;
        const color = opts2.header ? COLORS.white : COLORS.text;
        cellLines[i].forEach((line, li) => {
          this.page.drawText(line, { x: x + 4, y: rowTop - 14 - li * lineHeight, size, font, color });
        });
        this.page.drawRectangle({
          x,
          y: rowTop - rowHeight,
          width: colWidths[i],
          height: rowHeight,
          borderColor: COLORS.border,
          borderWidth: 0.75,
        });
        x += colWidths[i];
      });
      this.y -= rowHeight;
    };

    drawRow(headers, { header: true });
    rows.forEach((row, idx) => {
      drawRow(row, { boldRow: opts.boldLastRow && idx === rows.length - 1 });
    });
    this.spacer(10);
  }
}
