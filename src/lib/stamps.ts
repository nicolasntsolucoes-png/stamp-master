export type StampKind = "lancamento" | "classificacao" | "vencimento";

export type StampElement =
  | { type: "text"; x: number; y: number; size: number; text: string; bold?: boolean }
  | { type: "line"; x: number; y: number; width: number };

export type StampArt = {
  width: number;
  height: number;
  elements: StampElement[];
};

export type StampValues = Record<string, string>;

export type StampDef = {
  kind: StampKind;
  title: string;
  target: string;
  description: string;
  fields: {
    name: string;
    label: string;
    type: "date" | "text" | "choice";
    options?: string[];
  }[];
};

export const STAMP_DEFS: StampDef[] = [
  {
    kind: "lancamento",
    title: "Lançamento",
    target: "Boleto",
    description: "Data do lançamento e destino do documento.",
    fields: [
      { name: "data", label: "Data", type: "date" },
      {
        name: "tipo",
        label: "Tipo",
        type: "choice",
        options: ["SPED FISCAL", "CONTAS A PAGAR"],
      },
    ],
  },
  {
    kind: "classificacao",
    title: "Classificação",
    target: "Nota fiscal",
    description: "Classificação contábil completa da nota.",
    fields: [
      { name: "data", label: "Data de lançamento", type: "date" },
      { name: "pisCofins", label: "Aproveita PIS/COFINS", type: "choice", options: ["SIM", "NÃO"] },
      { name: "departamento", label: "Departamento", type: "text" },
      { name: "rateio", label: "Rateio", type: "text" },
      { name: "plContas", label: "Pl. Contas", type: "text" },
      { name: "finalidade", label: "Finalidade", type: "text" },
      { name: "cfop", label: "CFOP", type: "text" },
      { name: "assinatura", label: "Responsável / Assinatura", type: "text" },
    ],
  },
  {
    kind: "vencimento",
    title: "Vencimento",
    target: "Nota fiscal",
    description: "Data de vencimento do boleto na nota.",
    fields: [{ name: "vencimento", label: "Data de vencimento", type: "date" }],
  },
];

export function getStampDef(kind: StampKind): StampDef {
  return STAMP_DEFS.find((d) => d.kind === kind)!;
}

export function formatDate(value: string): string {
  if (!value) return "__/__/____";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

const CHAR_W = 0.58; // rough Helvetica-Bold advance ratio

export function textWidth(text: string, size: number): number {
  return text.length * size * CHAR_W;
}

function labelledLine(
  els: StampElement[],
  x: number,
  y: number,
  label: string,
  value: string,
  size: number,
  lineEnd: number,
) {
  els.push({ type: "text", x, y, size, text: label, bold: true });
  const valueX = x + textWidth(label, size) + 4;
  els.push({ type: "line", x: valueX, y: y + size * 0.15, width: Math.max(lineEnd - valueX, 10) });
  if (value) {
    els.push({ type: "text", x: valueX + 2, y, size, text: value.toUpperCase(), bold: false });
  }
}

function checkbox(els: StampElement[], x: number, y: number, size: number, label: string, checked: boolean) {
  const mark = checked ? "(X)" : "(  )";
  els.push({ type: "text", x, y, size, text: `${mark} ${label}`, bold: true });
  return textWidth(`${mark} ${label}`, size) + 10;
}

export function buildStampArt(kind: StampKind, values: StampValues): StampArt {
  const els: StampElement[] = [];

  if (kind === "lancamento") {
    const size = 12;
    const width = 240;
    els.push({ type: "text", x: 12, y: 14, size, text: "LANÇADO EM:", bold: true });
    const dateX = 12 + textWidth("LANÇADO EM:", size) + 6;
    els.push({ type: "line", x: dateX, y: 16, width: width - dateX - 12 });
    els.push({
      type: "text",
      x: dateX + 4,
      y: 14,
      size,
      text: formatDate(values['data'] ?? ""),
      bold: true,
    });
    const tipo = values['tipo'] ?? "";
    let y = 36;
    checkbox(els, 14, y, size, "SPED FISCAL", tipo === "SPED FISCAL");
    y += 18;
    checkbox(els, 14, y, size, "CONTAS A PAGAR", tipo === "CONTAS A PAGAR");
    return { width, height: y + 18, elements: els };
  }

  if (kind === "vencimento") {
    const size = 14;
    const width = 190;
    els.push({ type: "text", x: 14, y: 16, size: 16, text: "BOLETO", bold: true });
    els.push({ type: "text", x: 14, y: 44, size, text: "V.", bold: true });
    const dateX = 14 + textWidth("V.", size) + 6;
    els.push({ type: "line", x: dateX, y: 46, width: width - dateX - 14 });
    els.push({
      type: "text",
      x: dateX + 4,
      y: 44,
      size,
      text: formatDate(values['vencimento'] ?? ""),
      bold: true,
    });
    return { width, height: 66, elements: els };
  }

  // classificação
  const size = 11;
  const width = 330;
  const lineEnd = width - 12;
  let y = 16;
  labelledLine(els, 12, y, "LANÇAMENTO:", formatDate(values['data'] ?? ""), size, lineEnd);
  y += 17;
  const pis = values['pisCofins'] ?? "";
  els.push({ type: "text", x: 12, y, size, text: "APROVEITA PIS/COFINS", bold: true });
  let cx = 12 + textWidth("APROVEITA PIS/COFINS", size) + 8;
  cx += checkbox(els, cx, y, size, "SIM", pis === "SIM");
  checkbox(els, cx, y, size, "NÃO", pis === "NÃO");
  y += 17;
  const rows: [string, string][] = [
    ["DEPARTAMENTO:", values['departamento'] ?? ""],
    ["RATEIO:", values['rateio'] ?? ""],
    ["PL. CONTAS:", values['plContas'] ?? ""],
    ["FINALIDADE:", values['finalidade'] ?? ""],
    ["CFOP:", values['cfop'] ?? ""],
    ["ASS.:", values['assinatura'] ?? ""],
  ];
  for (const [label, value] of rows) {
    labelledLine(els, 12, y, label, value, size, lineEnd);
    y += 17;
  }
  return { width, height: y + 2, elements: els };
}
