import { CASELLE, isGiornoVuoto } from "./giorno.js";
import { leggiOre } from "./ore.js";

/** Cosa mostrare nella riga chiusa di un giorno. Ore e viaggio sono numeri, oppure null se vuoti o non validi. */
export function riassuntoGiorno(g) {
  const ore = leggiOre(g.oreLav);
  const viaggio = leggiOre(g.viaggio);
  return {
    vuoto: isGiornoVuoto(g),
    cantiere: String(g.cantiere ?? "").trim(),
    ore: ore.stato === "valido" ? ore.valore : null,
    viaggio: viaggio.stato === "valido" ? viaggio.valore : null,
    daControllare: ore.stato === "non valido" || viaggio.stato === "non valido",
    caselle: CASELLE.filter((c) => g[c.key]).map((c) => c.key),
    nota: String(g.note ?? "").trim(),
  };
}
