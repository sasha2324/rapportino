/**
 * Dati dell'azienda per la fattura (ristoranti, alberghi): arrivano dalla configurazione,
 * già controllati e messi in righe da `righeAzienda` (configurazione.js).
 */

/** Tutte le righe in un testo solo, una per dato, da copiare o mandare su WhatsApp. */
export function testoAzienda(righe) {
  return ["Dati per la fattura", ...righe.map((r) => `${r.etichetta}: ${r.valore}`)].join("\n");
}

/** Controlla la cifra finale di una partita IVA italiana (11 cifre). */
export function partitaIvaValida(piva) {
  if (!/^\d{11}$/.test(piva)) return false;
  const cifre = [...piva].map(Number);
  let somma = 0;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) somma += cifre[i];
    else {
      const doppio = cifre[i] * 2;
      somma += doppio > 9 ? doppio - 9 : doppio;
    }
  }
  return (10 - (somma % 10)) % 10 === cifre[10];
}
