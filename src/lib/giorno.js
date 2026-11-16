export const CAMPI_ORE = [
  { key: "oreLav", label: "Ore lavorate" },
  { key: "viaggio", label: "Viaggio" },
];

export const CASELLE = [
  { key: "scontrini", label: "Scontrini", excel: "Scontrini" },
  { key: "fatture", label: "Fatture", excel: "Fatture" },
  { key: "colazioni", label: "Colazioni", excel: "Colazioni" },
  { key: "bb", label: "B&B (pernottamento)", excel: "B&B" },
  { key: "pranzo", label: "Pranzo", excel: "Pranzo" },
  { key: "cena", label: "Cena", excel: "Cena" },
];

export function giornoVuoto() {
  return {
    cantiere: "", oreLav: "", viaggio: "",
    scontrini: false, fatture: false, colazioni: false, bb: false, pranzo: false, cena: false,
    note: "",
  };
}

/** Il giorno salvato, con i campi mancanti riempiti dai valori vuoti. */
export function leggiGiorno(entries, numero) {
  return { ...giornoVuoto(), ...(entries?.[numero] || {}) };
}

export function isGiornoVuoto(g) {
  if (!g) return true;
  const testoVuoto = (v) => String(v ?? "").trim() === "";
  return (
    testoVuoto(g.cantiere) &&
    testoVuoto(g.oreLav) &&
    testoVuoto(g.viaggio) &&
    CASELLE.every((c) => !g[c.key]) &&
    testoVuoto(g.note)
  );
}
