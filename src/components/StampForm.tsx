import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStampDef, type StampKind, type StampValues } from "@/lib/stamps";

export function StampForm({
  kind,
  values,
  onChange,
}: {
  kind: StampKind;
  values: StampValues;
  onChange: (v: StampValues) => void;
}) {
  const def = getStampDef(kind);
  const set = (name: string, value: string) => onChange({ ...values, [name]: value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {def.fields.map((field) => (
        <div key={field.name} className={field.type === "choice" ? "sm:col-span-2" : ""}>
          <Label htmlFor={field.name} className="text-sm">
            {field.label}
          </Label>
          {field.type === "choice" ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {field.options?.map((opt) => {
                const active = values[field.name] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set(field.name, active ? "" : opt)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <Input
              id={field.name}
              type={field.type === "date" ? "date" : "text"}
              className="mt-2"
              value={values[field.name] ?? ""}
              onChange={(e) => set(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
