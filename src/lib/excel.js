import * as XLSX from "xlsx";
import { MESI, giorniNelMese, nomeGiorno, dataBreve } from "./calendario.js";
import { CASELLE, leggiGiorno } from "./giorno.js";
import { leggiOre, totaliMese, totaliPerCantiere } from "./ore.js";

export const INTESTAZIONI = [
  "Data", "Giorno", "Cantiere", "Ore lav.", "Viaggio",
  ...CASELLE.map((c) => c.excel),
  "Note",
];

const LARGHEZZE = [11, 6, 22, 9, 9, 9, 8, 9, 6, 8, 7, 30];

/** Numero se valido, vuoto se vuoto, il testo scritto se non valido (così l'ufficio lo vede). */
function cellaOre(testo) {
  const o = leggiOre(testo);
  if (o.stato === "vuoto") return "";
  if (o.stato === "valido") return o.valore;
  return String(testo).trim();
}

export function righeExcel({ nomeDipendente, anno, mese, entries }) {
  const numGiorni = giorniNelMese(anno, mese);
  const righe = [
    [`Dipendente: ${String(nomeDipendente ?? "").trim() || "-"}`],
    [`Periodo: ${MESI[mese]} ${anno}`],
    [],
    INTESTAZIONI,
  ];
  for (let d = 1; d <= numGiorni; d++) {
    const g = leggiGiorno(entries, d);
    righe.push([
      dataBreve(anno, mese, d),
      nomeGiorno(anno, mese, d),
      String(g.cantiere).trim(),
      cellaOre(g.oreLav),
      cellaOre(g.viaggio),
      ...CASELLE.map((c) => (g[c.key] ? "X" : "")),
      String(g.note).trim(),
    ]);
  }
  const t = totaliMese(entries, numGiorni);
  righe.push([]);
  righe.push(["", "Totale", "", t.oreLav, t.viaggio, ...CASELLE.map((c) => t[c.key]), ""]);

  // Totale per cantiere: colonne allineate a Cantiere / Ore lav. / Viaggio della tabella sopra
  const perCantiere = totaliPerCantiere(entries, numGiorni);
  if (perCantiere.length > 0) {
    righe.push([]);
    righe.push(["", "Totale per cantiere"]);
    righe.push(["", "", "Cantiere", "Ore lav.", "Viaggio"]);
    perCantiere.forEach((c) => righe.push(["", "", c.cantiere, c.oreLav, c.viaggio]));
  }
  return righe;
}

export function nomeFileExcel(nomeDipendente, anno, mese) {
  const nome =
    String(nomeDipendente ?? "")
      .trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_") || "dipendente";
  return `Ore_${nome}_${MESI[mese]}_${anno}.xlsx`;
}

/**
 * Crea il file Excel del mese. È sincrona di proposito: deve girare nello stesso
 * tocco del pulsante, prima di navigator.share (vedi share.js).
 */
export function creaFileExcel({ nomeDipendente, anno, mese, entries }) {
  const ws = XLSX.utils.aoa_to_sheet(righeExcel({ nomeDipendente, anno, mese, entries }));
  ws["!cols"] = LARGHEZZE.map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ore");
  const dati = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new File([dati], nomeFileExcel(nomeDipendente, anno, mese), {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
