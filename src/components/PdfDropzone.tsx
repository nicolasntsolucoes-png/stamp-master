import { useRef, useState } from "react";
import { FileUp } from "lucide-react";

export function PdfDropzone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handle = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type === "application/pdf") onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
        over ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/60"
      }`}
    >
      <FileUp className="size-8 text-muted-foreground" />
      <div>
        <p className="font-medium text-foreground">Arraste o PDF aqui</p>
        <p className="text-sm text-muted-foreground">ou clique para escolher a nota fiscal ou o boleto</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}
