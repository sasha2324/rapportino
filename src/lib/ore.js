import { CASELLE, leggiGiorno } from "./giorno.js";
import { chiaveCantiere } from "./cantieri.js";

export const SENZA_CANTIERE = "(senza cantiere)";

const MAX_ORE = 24;
const FORMATO = /^(\d+([.,]\d*)?|[.,]\d+)$/;

const arrotonda = (n) => Math.round(n * 100) / 100;

/**
 * Legge le ore scritte dal dipendente (virgola o punto).
 * stato: "vuoto" | "valido" | "non valido"; valore: il numero (0 se vuoto o non valido).
 */
export function leggiOre(testo) {
  const t = String(testo ?? "").trim();
  if (t === "") return { stato: "vuoto", valore: 0 };
  if (!FORMATO.test(t)) return { stato: "non valido", valore: 0 };
  const valore = Number(t.replace(",", "."));
  if (valore > MAX_ORE) return { stato: "non valido", valore: 0 };
  return { stato: "valido", valore };
}

export function formatOre(n) {
  return String(arrotonda(n)).replace(".", ",");
}

export function totaliMese(entries, numGiorni) {
  const t = { oreLav: 0, viaggio: 0 };
  CASELLE.forEach((c) => { t[c.key] = 0; });
  for (let d = 1; d <= numGiorni; d++) {
    const g = leggiGiorno(entries, d);
    t.oreLav += leggiOre(g.oreLav).valore;
    t.viaggio += leggiOre(g.viaggio).valore;
    CASELLE.forEach((c) => { if (g[c.key]) t[c.key] += 1; });
  }
  t.oreLav = arrotonda(t.oreLav);
  t.viaggio = arrotonda(t.viaggio);
  return t;
}

/**
 * Ore lavorate e di viaggio per cantiere, nell'ordine in cui i cantieri compaiono nel mese.
 * Stesso cantiere a meno di maiuscole e spazi = una riga sola, con la prima grafia.
 * Le ore dei giorni senza cantiere finiscono in «(senza cantiere)», in fondo, solo se ci sono.
 */
export function totaliPerCantiere(entries, numGiorni) {
  const gruppi = new Map();
  const senza = { cantiere: SENZA_CANTIERE, oreLav: 0, viaggio: 0 };
  for (let d = 1; d <= numGiorni; d++) {
    const g = leggiGiorno(entries, d);
    const ore = leggiOre(g.oreLav).valore;
    const viaggio = leggiOre(g.viaggio).valore;
    const nome = String(g.cantiere).trim();
    if (!nome) {
      senza.oreLav += ore;
      senza.viaggio += viaggio;
      continue;
    }
    const chiave = chiaveCantiere(nome);
    if (!gruppi.has(chiave)) gruppi.set(chiave, { cantiere: nome, oreLav: 0, viaggio: 0 });
    const gruppo = gruppi.get(chiave);
    gruppo.oreLav += ore;
    gruppo.viaggio += viaggio;
  }
  const righe = [...gruppi.values()];
  if (senza.oreLav + senza.viaggio > 0) righe.push(senza);
  return righe.map((r) => ({ ...r, oreLav: arrotonda(r.oreLav), viaggio: arrotonda(r.viaggio) }));
}
