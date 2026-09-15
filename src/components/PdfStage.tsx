import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Move, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StampArtwork } from "@/components/StampArtwork";
import type { StampArt } from "@/lib/stamps";

export type StagePosition = { pageIndex: number; x: number; y: number };

type Props = {
  fileBytes: ArrayBuffer;
  art: StampArt;
  position: StagePosition;
  onPositionChange: (p: StagePosition) => void;
  stampScale: number;
  onStampScaleChange: (s: number) => void;
  onPreviewScale: (s: number) => void;
};

export function PdfStage({
  fileBytes,
  art,
  position,
  onPositionChange,
  stampScale,
  onStampScaleChange,
  onPreviewScale,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<any>(null);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const pdfjs: any = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      const doc = await pdfjs.getDocument({ data: fileBytes.slice(0) }).promise;
      if (cancelled) return;
      docRef.current = doc;
      setNumPages(doc.numPages);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fileBytes]);

  const render = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!doc || !canvas || !wrap) return;
    const page = await doc.getPage(position.pageIndex + 1);
    const base = page.getViewport({ scale: 1 });
    const available = wrap.clientWidth || 700;
    const s = Math.min(available / base.width, 1.6);
    const viewport = page.getViewport({ scale: s });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    await page.render({ canvasContext: ctx, viewport }).promise;
    setScale(s);
    onPreviewScale(s);
    setSize({ width: viewport.width, height: viewport.height });
  }, [position.pageIndex, onPreviewScale]);

  useEffect(() => {
    if (!loading) void render();
  }, [loading, render]);

  useEffect(() => {
    const onResize = () => void render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  const stampW = art.width * scale * stampScale;
  const stampH = art.height * scale * stampScale;

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { dx: e.clientX - position.x, dy: e.clientY - position.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const x = Math.min(Math.max(e.clientX - dragRef.current.dx, 0), Math.max(size.width - stampW, 0));
    const y = Math.min(Math.max(e.clientY - dragRef.current.dy, 0), Math.max(size.height - stampH, 0));
    onPositionChange({ ...position, x, y });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={position.pageIndex === 0}
            onClick={() => onPositionChange({ ...position, pageIndex: position.pageIndex - 1 })}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            Página {position.pageIndex + 1} de {numPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={position.pageIndex >= numPages - 1}
            onClick={() => onPositionChange({ ...position, pageIndex: position.pageIndex + 1 })}
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onStampScaleChange(Math.max(0.5, +(stampScale - 0.1).toFixed(2)))}
            aria-label="Diminuir carimbo"
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="w-14 text-center text-sm text-muted-foreground">
            {Math.round(stampScale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onStampScaleChange(Math.min(2, +(stampScale + 0.1).toFixed(2)))}
            aria-label="Aumentar carimbo"
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>

      <div ref={wrapRef} className="overflow-auto rounded-lg border bg-muted/40 p-3">
        <div className="relative mx-auto" style={{ width: size.width || "100%" }}>
          <canvas ref={canvasRef} className="block rounded-sm shadow-sm" />
          {loading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Carregando documento…</p>
          ) : null}
          {size.width > 0 && (
            <div
              role="button"
              tabIndex={0}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="group absolute cursor-grab touch-none select-none active:cursor-grabbing"
              style={{ left: position.x, top: position.y }}
            >
              <div className="opacity-90">
                <StampArtwork art={art} scale={scale * stampScale} />
              </div>
              <span className="pointer-events-none absolute -top-6 left-0 hidden items-center gap-1 rounded bg-foreground px-2 py-0.5 text-[11px] text-background group-hover:inline-flex">
                <Move className="size-3" /> arraste para posicionar
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
