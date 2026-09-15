import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { StampArt } from "./stamps";

export type StampPlacement = {
  pageIndex: number;
  /** position of the stamp top-left corner, in CSS pixels of the rendered preview */
  x: number;
  y: number;
  /** preview pixels per PDF point */
  previewScale: number;
  /** extra stamp scale chosen by the user */
  stampScale: number;
};

const INK = rgb(0.09, 0.11, 0.18);

export async function applyStamp(
  originalBytes: ArrayBuffer,
  art: StampArt,
  placement: StampPlacement,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPages()[placement.pageIndex];
  const { width: pw, height: ph } = page.getSize();
  const rotation = ((page.getRotation().angle % 360) + 360) % 360;

  const s = placement.stampScale;
  // top-left of the stamp in unrotated "view" coordinates (points, origin top-left)
  const vx = placement.x / placement.previewScale;
  const vy = placement.y / placement.previewScale;

  // view size depends on page rotation
  const viewW = rotation === 90 || rotation === 270 ? ph : pw;
  const viewH = rotation === 90 || rotation === 270 ? pw : ph;

  /** map a point inside the stamp (local px, origin top-left) to PDF user space */
  const toPdf = (lx: number, ly: number): [number, number] => {
    const X = vx + lx * s; // from left of the view
    const Y = vy + ly * s; // from top of the view
    switch (rotation) {
      case 90:
        return [Y, X];
      case 180:
        return [viewW - X, Y];
      case 270:
        return [ph - Y, pw - X];
      default:
        return [X, viewH - Y];
    }
  };
  const rot = degrees(rotation === 0 ? 0 : 360 - rotation);

  const w = art.width * s;
  const h = art.height * s;

  // border: draw as four thin rectangles so rotation stays simple
  const border = 1.2 * s;
  const edges: [number, number, number, number][] = [
    [0, 0, w, border],
    [0, h - border, w, border],
    [0, 0, border, h],
    [w - border, 0, border, h],
  ];
  for (const [ex, ey, ew, eh] of edges) {
    const [px, py] = toPdf(ex, ey + eh);
    page.drawRectangle({
      x: px,
      y: py,
      width: rotation === 90 || rotation === 270 ? eh : ew,
      height: rotation === 90 || rotation === 270 ? ew : eh,
      color: INK,
      opacity: 0.9,
      rotate: rot,
    });
  }

  for (const el of art.elements) {
    if (el.type === "text") {
      const [px, py] = toPdf(el.x, el.y);
      page.drawText(el.text, {
        x: px,
        y: py,
        size: el.size * s,
        font: el.bold === false ? font : bold,
        color: INK,
        opacity: 0.92,
        rotate: rot,
      });
    } else {
      const [px, py] = toPdf(el.x, el.y + 1);
      const lw = el.width * s;
      const lh = Math.max(0.8, 1 * s);
      page.drawRectangle({
        x: px,
        y: py,
        width: rotation === 90 || rotation === 270 ? lh : lw,
        height: rotation === 90 || rotation === 270 ? lw : lh,
        color: INK,
        opacity: 0.9,
        rotate: rot,
      });
    }
  }

  return pdfDoc.save();
}
