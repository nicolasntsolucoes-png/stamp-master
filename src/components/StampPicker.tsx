import { STAMP_DEFS, type StampKind } from "@/lib/stamps";

export function StampPicker({
  value,
  onChange,
}: {
  value: StampKind | null;
  onChange: (k: StampKind) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {STAMP_DEFS.map((def) => {
        const active = value === def.kind;
        return (
          <button
            key={def.kind}
            type="button"
            onClick={() => onChange(def.kind)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {def.target}
            </span>
            <p className="mt-1 text-base font-semibold text-foreground">{def.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{def.description}</p>
          </button>
        );
      })}
    </div>
  );
}
