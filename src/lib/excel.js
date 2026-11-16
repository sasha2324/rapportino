import * as XLSX from "xlsx";
import { MESI, giorniNelMese, nomeGiorno, dataBreve } from "./calendario.js";
import { leggiGiorno, valoreVoce } from "./giorno.js";
import { leggiNumero, leggiOre, totaliMese, totaliPerLuogo } from "./ore.js";
import { intestazioni, nomeColonna } from "./colonne.js";

export { intestazioni };

/**
 * L'Excel del mese: le colonne seguono le voci scelte dal titolare, nel loro ordine.
 * Ogni testo (nomi delle voci, luoghi, note) finisce in una cella di testo: SheetJS
 * scrive le stringhe come stringhe, quindi «=…» non diventa mai una formula.
 */

const LARGHEZZA = { ore: 9, numero: 9, si_no: 9, luogo: 22, note: 30 };
const larghezze = (voci) => [11, 6, ...voci.map((v) => Math.max(LARGHEZZA[v.tipo], nomeColonna(v).length + 2))];

/** Numero se valido, vuoto se vuoto, il testo scritto se non valido (così l'ufficio lo vede). */
function cellaNumero(testo, leggi) {
  const letto = leggi(testo);
  if (letto.stato === "vuoto") return "";
  if (letto.stato === "valido") return letto.valore;
  return String(testo).trim();
}

function cella(giorno, voce) {
  const valore = valoreVoce(giorno, voce);
  switch (voce.tipo) {
    case "ore":
      return cellaNumero(valore, leggiOre);
    case "numero":
      return cellaNumero(valore, leggiNumero);
    case "si_no":
      return valore ? "X" : "";
    default:
      return valore.trim();
  }
}

export function righeExcel({ config, nomeDipendente, anno, mese, entries }) {
  const voci = config.voci;
  const numGiorni = giorniNelMese(anno, mese);
  const righe = [];
  if (config.azienda?.nome) righe.push([`Azienda: ${config.azienda.nome}`]);
  righe.push([`Dipendente: ${String(nomeDipendente ?? "").trim() || "-"}`]);
  righe.push([`Periodo: ${MESI[mese]} ${anno}`]);
  righe.push([]);
  righe.push(intestazioni(voci));

  for (let d = 1; d <= numGiorni; d++) {
    const g = leggiGiorno(entries, d);
    righe.push([dataBreve(anno, mese, d), nomeGiorno(anno, mese, d), ...voci.map((v) => cella(g, v))]);
  }

  const t = totaliMese(entries, numGiorni, voci);
  righe.push([]);
  righe.push(["", "Totale", ...voci.map((v) => (v.id in t ? t[v.id] : ""))]);

  // Ore per luogo: una tabellina sotto, con il nome che il titolare ha dato alla voce luogo
  const voceLuogo = voci.find((v) => v.tipo === "luogo");
  const perLuogo = totaliPerLuogo(entries, numGiorni, voci);
  if (voceLuogo && perLuogo.length > 0) {
    const vociOre = voci.filter((v) => v.tipo === "ore");
    righe.push([]);
    righe.push(["", `Totale per ${voceLuogo.nome.toLocaleLowerCase("it")}`]);
    righe.push(["", voceLuogo.nome, ...vociOre.map((v) => v.nome)]);
    perLuogo.forEach((r) => righe.push(["", r.luogo, ...vociOre.map((v) => r.ore[v.id])]));
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
export function creaFileExcel({ config, nomeDipendente, anno, mese, entries }) {
  const ws = XLSX.utils.aoa_to_sheet(righeExcel({ config, nomeDipendente, anno, mese, entries }));
  ws["!cols"] = larghezze(config.voci).map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ore");
  const dati = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new File([dati], nomeFileExcel(nomeDipendente, anno, mese), {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
