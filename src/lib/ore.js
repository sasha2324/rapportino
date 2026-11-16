import { leggiGiorno, valoreVoce } from "./giorno.js";
import { chiaveLuogo } from "./luoghi.js";

export const SENZA_LUOGO = "(non indicato)";

const MAX_ORE = 24;
const MAX_NUMERO = 999999;
const FORMATO = /^(\d+([.,]\d*)?|[.,]\d+)$/;

const arrotonda = (n) => Math.round(n * 100) / 100;

function leggi(testo, massimo) {
  const t = String(testo ?? "").trim();
  if (t === "") return { stato: "vuoto", valore: 0 };
  if (!FORMATO.test(t)) return { stato: "non valido", valore: 0 };
  const valore = Number(t.replace(",", "."));
  if (valore > massimo) return { stato: "non valido", valore: 0 };
  return { stato: "valido", valore };
}

/**
 * Legge le ore scritte dal dipendente (virgola o punto), al massimo 24.
 * stato: "vuoto" | "valido" | "non valido"; valore: il numero (0 se vuoto o non valido).
 */
export const leggiOre = (testo) => leggi(testo, MAX_ORE);

/** Come leggiOre, per le voci di tipo numero (es. km), fino a 999.999. */
export const leggiNumero = (testo) => leggi(testo, MAX_NUMERO);

export function formatOre(n) {
  return String(arrotonda(n)).replace(".", ",");
}

/** Totali del mese per id di voce: somma di ore e numeri validi, conteggio dei sì. */
export function totaliMese(entries, numGiorni, voci) {
  const contate = voci.filter((v) => v.tipo === "ore" || v.tipo === "numero" || v.tipo === "si_no");
  const t = Object.fromEntries(contate.map((v) => [v.id, 0]));
  for (let d = 1; d <= numGiorni; d++) {
    const g = leggiGiorno(entries, d);
    for (const voce of contate) {
      const valore = valoreVoce(g, voce);
      if (voce.tipo === "si_no") t[voce.id] += valore ? 1 : 0;
      else t[voce.id] += (voce.tipo === "ore" ? leggiOre : leggiNumero)(valore).valore;
    }
  }
  for (const voce of contate) if (voce.tipo !== "si_no") t[voce.id] = arrotonda(t[voce.id]);
  return t;
}

/**
 * Ore per luogo (ogni voce di tipo ore), nell'ordine in cui i luoghi compaiono nel mese.
 * Stesso luogo a meno di maiuscole e spazi = una riga sola, con la prima grafia.
 * Le ore dei giorni senza luogo finiscono in fondo in «(non indicato)», solo se ci sono.
 * Senza una voce di tipo luogo: nessuna riga.
 */
export function totaliPerLuogo(entries, numGiorni, voci) {
  const voceLuogo = voci.find((v) => v.tipo === "luogo");
  if (!voceLuogo) return [];
  const vociOre = voci.filter((v) => v.tipo === "ore");
  const zero = () => Object.fromEntries(vociOre.map((v) => [v.id, 0]));

  const gruppi = new Map();
  const senza = { luogo: SENZA_LUOGO, ore: zero() };
  for (let d = 1; d <= numGiorni; d++) {
    const g = leggiGiorno(entries, d);
    const nome = valoreVoce(g, voceLuogo).trim();
    let gruppo = senza;
    if (nome) {
      const chiave = chiaveLuogo(nome);
      if (!gruppi.has(chiave)) gruppi.set(chiave, { luogo: nome, ore: zero() });
      gruppo = gruppi.get(chiave);
    }
    for (const voce of vociOre) gruppo.ore[voce.id] += leggiOre(valoreVoce(g, voce)).valore;
  }
  const righe = [...gruppi.values()];
  if (Object.values(senza.ore).some((n) => n > 0)) righe.push(senza);
  return righe.map((r) => ({
    luogo: r.luogo,
    ore: Object.fromEntries(Object.entries(r.ore).map(([id, n]) => [id, arrotonda(n)])),
  }));
}
