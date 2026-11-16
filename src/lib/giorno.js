/**
 * Un giorno salvato è un oggetto { <id voce>: valore }: testo per ore, luogo, numero e note,
 * vero/falso per i sì/no. I dati di voci tolte dal modulo restano lì, ma non si mostrano.
 */

export function leggiGiorno(entries, numero) {
  return entries?.[numero] ?? {};
}

/** Il valore della voce nel giorno, con il vuoto giusto se manca o è del tipo sbagliato. */
export function valoreVoce(giorno, voce) {
  const valore = giorno?.[voce.id];
  if (voce.tipo === "si_no") return valore === true;
  return typeof valore === "string" ? valore : "";
}

export function isGiornoVuoto(giorno, voci) {
  return voci.every((voce) => {
    const valore = valoreVoce(giorno, voce);
    return voce.tipo === "si_no" ? !valore : valore.trim() === "";
  });
}
