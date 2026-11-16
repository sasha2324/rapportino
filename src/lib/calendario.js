export const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export const GIORNI_SETTIMANA = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function pad(n) {
  return String(n).padStart(2, "0");
}

/** mese: 0 = gennaio … 11 = dicembre. Stessa chiave del prototipo. */
export function chiaveMese(anno, mese) {
  return `entries:${anno}-${pad(mese + 1)}`;
}

export function giorniNelMese(anno, mese) {
  return new Date(anno, mese + 1, 0).getDate();
}

/** 0 = lunedì … 6 = domenica */
export function indiceSettimana(anno, mese, giorno) {
  return (new Date(anno, mese, giorno).getDay() + 6) % 7;
}

export function nomeGiorno(anno, mese, giorno) {
  return GIORNI_SETTIMANA[indiceSettimana(anno, mese, giorno)];
}

export function isWeekend(anno, mese, giorno) {
  return indiceSettimana(anno, mese, giorno) >= 5;
}

export function spostaMese(anno, mese, delta) {
  const d = new Date(anno, mese + delta, 1);
  return { anno: d.getFullYear(), mese: d.getMonth() };
}

export function dataBreve(anno, mese, giorno) {
  return `${pad(giorno)}/${pad(mese + 1)}/${anno}`;
}

/** Il numero del giorno di oggi se il mese mostrato è quello corrente, altrimenti null. */
export function giornoDiOggi(anno, mese, oggi = new Date()) {
  return oggi.getFullYear() === anno && oggi.getMonth() === mese ? oggi.getDate() : null;
}
