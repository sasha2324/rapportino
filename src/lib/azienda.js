/**
 * Dati dell'azienda da dare a ristoranti e alberghi per la fattura.
 * Per ora sono ESEMPI chiaramente finti: verranno sostituiti dalla configurazione
 * scelta dal titolare (dati dell'azienda, tutti facoltativi).
 */
export const AZIENDA = [
  { chiave: "ragioneSociale", etichetta: "Ragione sociale", valore: "Azienda di esempio S.r.l." },
  { chiave: "sede", etichetta: "Sede", valore: "Via Esempio 1 – 00000 Città (XX)" },
  { chiave: "partitaIva", etichetta: "Partita IVA", valore: "00000000000" },
  { chiave: "sdi", etichetta: "Codice SDI", valore: "0000000" },
  { chiave: "email", etichetta: "Email", valore: "info@example.com" },
  { chiave: "telefono", etichetta: "Telefono", valore: "000 000 0000" },
];

/** Tutti i dati in un testo solo, una riga per voce, da copiare o mandare su WhatsApp. */
export function testoAzienda() {
  return ["Dati per la fattura", ...AZIENDA.map((r) => `${r.etichetta}: ${r.valore}`)].join("\n");
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
