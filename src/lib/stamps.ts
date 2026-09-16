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

const MM_TO_PT = 72 / 25.4;
const INPUT_FONT_SIZE = 7.5;
const LABEL_FONT_SIZE = 6.5;

function mm(value: number): number {
  return value * MM_TO_PT;
}

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
  const definition = STAMP_DEFS.find((d) => d.kind === kind);
  if (!definition) throw new Error("Modelo de carimbo não encontrado");
  return definition;
}

export function formatDate(value: string): string {
  if (!value) return "__/__/____";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

const CHAR_W = 0.54; // aproximação do avanço da Helvetica nesta escala

export function textWidth(text: string, size: number): number {
  return text.length * size * CHAR_W;
}

function labelledLine(
  els: StampElement[],
  x: number,
  y: number,
  label: string,
  value: string,
  labelSize: number,
  lineEnd: number,
  column: number,
) {
  els.push({ type: "text", x, y, size: labelSize, text: label, bold: true });
  const valueX = Math.max(column, x + textWidth(label, labelSize) + 6);
  els.push({ type: "line", x: valueX, y: y + labelSize * 0.15, width: Math.max(lineEnd - valueX, 10) });
  if (value) {
    els.push({ type: "text", x: valueX + 2, y, size: INPUT_FONT_SIZE, text: value.toUpperCase(), bold: false });
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
    const width = mm(50);
    const height = mm(20);
    const padding = 4.5;
    els.push({ type: "text", x: padding, y: 10, size: LABEL_FONT_SIZE, text: "LANÇADO EM:", bold: true });
    const dateX = 49;
    els.push({ type: "line", x: dateX, y: 11.5, width: width - dateX - padding });
    els.push({
      type: "text",
      x: dateX + 2,
      y: 10,
      size: INPUT_FONT_SIZE,
      text: formatDate(values['data'] ?? ""),
      bold: false,
    });
    const tipo = values['tipo'] ?? "";
    checkbox(els, padding, 29, INPUT_FONT_SIZE, "SPED FISCAL", tipo === "SPED FISCAL");
    checkbox(els, padding, 45, INPUT_FONT_SIZE, "CONTAS A PAGAR", tipo === "CONTAS A PAGAR");
    return { width, height, elements: els };
  }

  if (kind === "vencimento") {
    const width = mm(40);
    const height = mm(20);
    const padding = 5;
    els.push({ type: "text", x: padding, y: 11, size: INPUT_FONT_SIZE, text: "BOLETO", bold: true });
    els.push({ type: "text", x: padding, y: 38, size: INPUT_FONT_SIZE, text: "V.", bold: true });
    const dateX = 19;
    els.push({ type: "line", x: dateX, y: 39.5, width: width - dateX - padding });
    els.push({
      type: "text",
      x: dateX + 2,
      y: 38,
      size: INPUT_FONT_SIZE,
      text: formatDate(values['vencimento'] ?? ""),
      bold: false,
    });
    return { width, height, elements: els };
  }

  // classificação
  const width = mm(80);
  const height = mm(40);
  const lineEnd = width - 5;
  const column = 78;
  let y = 10;
  labelledLine(els, 5, y, "LANÇAMENTO:", formatDate(values['data'] ?? ""), LABEL_FONT_SIZE, lineEnd, column);
  y += 13;
  const pis = values['pisCofins'] ?? "";
  els.push({ type: "text", x: 5, y, size: LABEL_FONT_SIZE, text: "APROVEITA PIS/COFINS", bold: true });
  let cx = 83;
  cx += checkbox(els, cx, y, INPUT_FONT_SIZE, "SIM", pis === "SIM");
  checkbox(els, cx, y, INPUT_FONT_SIZE, "NÃO", pis === "NÃO");
  y += 13;
  const rows: [string, string][] = [
    ["DEPARTAMENTO:", values['departamento'] ?? ""],
    ["RATEIO:", values['rateio'] ?? ""],
    ["PL. CONTAS:", values['plContas'] ?? ""],
    ["FINALIDADE:", values['finalidade'] ?? ""],
    ["CFOP:", values['cfop'] ?? ""],
    ["ASS.:", values['assinatura'] ?? ""],
  ];
  for (const [label, value] of rows) {
    labelledLine(els, 5, y, label, value, LABEL_FONT_SIZE, lineEnd, column);
    y += 13;
  }
  return { width, height, elements: els };
}
