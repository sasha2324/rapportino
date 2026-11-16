/**
 * Nomi delle colonne dell'Excel, a parte da excel.js: così la pagina del titolare li mostra
 * nell'anteprima senza scaricare SheetJS.
 */

/** Il nome della voce, con l'unità tra parentesi solo se è diversa dal nome («Distanza (km)»). */
export function nomeColonna(voce) {
  if (voce.tipo === "numero" && voce.unita && voce.unita.toLocaleLowerCase("it") !== voce.nome.toLocaleLowerCase("it")) {
    return `${voce.nome} (${voce.unita})`;
  }
  return voce.nome;
}

export function intestazioni(voci) {
  return ["Data", "Giorno", ...voci.map(nomeColonna)];
}
