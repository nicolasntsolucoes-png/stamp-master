import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Download, Printer, RotateCcw, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfDropzone } from "@/components/PdfDropzone";
import { PdfStage, type StagePosition } from "@/components/PdfStage";
import { StampForm } from "@/components/StampForm";
import { StampPicker } from "@/components/StampPicker";
import { applyStamp } from "@/lib/pdf-stamp";
import { buildStampArt, getStampDef, type StampKind, type StampValues } from "@/lib/stamps";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Carimbo Eletrônico | Classificação de notas fiscais" },
      {
        name: "description",
        content:
          "Aplique carimbos de lançamento, classificação e vencimento em notas fiscais e boletos em PDF, direto no navegador.",
      },
      { property: "og:title", content: "Carimbo Eletrônico | Classificação de notas fiscais" },
      {
        property: "og:description",
        content: "Carimbe notas fiscais e boletos em PDF e baixe o documento pronto.",
      },
    ],
  }),
  component: Index,
});

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [kind, setKind] = useState<StampKind | null>(null);
  const [values, setValues] = useState<StampValues>({});
  const [position, setPosition] = useState<StagePosition>({ pageIndex: 0, x: 40, y: 40 });
  const [stampScale, setStampScale] = useState(1);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previewScaleRef = useRef(1);

  const art = useMemo(() => buildStampArt(kind ?? "lancamento", values), [kind, values]);

  const handleFile = async (f: File) => {
    setFile(f);
    setBytes(await f.arrayBuffer());
    setResultUrl(null);
    setPosition({ pageIndex: 0, x: 40, y: 40 });
  };

  const onPreviewScale = useCallback((s: number) => {
    previewScaleRef.current = s;
  }, []);

  const confirm = async () => {
    if (!bytes || !kind) return;
    setBusy(true);
    try {
      const out = await applyStamp(bytes, art, {
        pageIndex: position.pageIndex,
        x: position.x,
        y: position.y,
        previewScale: previewScaleRef.current,
        stampScale,
      });
      const blob = new Blob([out as unknown as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setBytes(null);
    setKind(null);
    setValues({});
    setResultUrl(null);
    setStampScale(1);
  };

  const outName = file ? file.name.replace(/\.pdf$/i, "") + "-carimbado.pdf" : "documento-carimbado.pdf";

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stamp className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Carimbo Eletrônico</h1>
            <p className="text-sm text-muted-foreground">
              Classificação de notas fiscais e boletos — tudo processado no seu computador.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <Section step={1} title="Documento">
          {!file ? (
            <PdfDropzone onFile={handleFile} />
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
              <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="size-4" /> Trocar
              </Button>
            </div>
          )}
        </Section>

        {file && (
          <Section step={2} title="Carimbo">
            <StampPicker value={kind} onChange={setKind} />
          </Section>
        )}

        {file && kind && (
          <Section step={3} title={`Dados — ${getStampDef(kind).title}`}>
            <StampForm kind={kind} values={values} onChange={setValues} />
          </Section>
        )}

        {file && kind && bytes && (
          <Section step={4} title="Posicione o carimbo na página">
            <PdfStage
              fileBytes={bytes}
              art={art}
              position={position}
              onPositionChange={(p) => {
                setPosition(p);
                setResultUrl(null);
              }}
              stampScale={stampScale}
              onStampScaleChange={setStampScale}
              onPreviewScale={onPreviewScale}
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={confirm} disabled={busy}>
                <Stamp className="size-4" /> {busy ? "Gerando…" : "Confirmar e gerar PDF"}
              </Button>
              {resultUrl && (
                <>
                  <Button variant="outline" asChild>
                    <a href={resultUrl} download={outName}>
                      <Download className="size-4" /> Baixar PDF
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const w = window.open(resultUrl, "_blank");
                      w?.addEventListener("load", () => w.print());
                    }}
                  >
                    <Printer className="size-4" /> Imprimir
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    <RotateCcw className="size-4" /> Carimbar outro
                  </Button>
                </>
              )}
            </div>
            {resultUrl && (
              <p className="mt-3 text-sm text-muted-foreground">
                PDF carimbado pronto. O conteúdo original foi mantido intacto.
              </p>
            )}
          </Section>
        )}
      </div>
    </main>
  );
}
