import { isGiornoVuoto, valoreVoce } from "./giorno.js";
import { leggiNumero, leggiOre } from "./ore.js";

/**
 * Cosa mostrare nella riga chiusa di un giorno, voce per voce.
 * Ore e numeri: valore numerico, oppure null se vuoti o non validi (non validi = daControllare).
 */
export function riassuntoGiorno(giorno, voci) {
  const r = { vuoto: isGiornoVuoto(giorno, voci), luogo: "", ore: [], numeri: [], caselle: [], nota: "", daControllare: false };
  for (const voce of voci) {
    const valore = valoreVoce(giorno, voce);
    switch (voce.tipo) {
      case "ore":
      case "numero": {
        const letto = (voce.tipo === "ore" ? leggiOre : leggiNumero)(valore);
        if (letto.stato === "non valido") r.daControllare = true;
        const numero = letto.stato === "valido" ? letto.valore : null;
        if (voce.tipo === "ore") r.ore.push({ id: voce.id, nome: voce.nome, valore: numero });
        else r.numeri.push({ id: voce.id, nome: voce.nome, unita: voce.unita ?? "", valore: numero });
        break;
      }
      case "luogo":
        r.luogo = valore.trim();
        break;
      case "si_no":
        if (valore) r.caselle.push({ id: voce.id, nome: voce.nome });
        break;
      case "note":
        r.nota = valore.trim();
        break;
    }
  }
  return r;
}
