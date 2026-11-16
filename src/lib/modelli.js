import { VERSIONE } from "./configurazione.js";

/** Voci comuni a più modelli (stesso id = stessi dati se il titolare cambia modello). */
const ORE = { id: "ore", tipo: "ore", nome: "Ore lavorate" };
const VIAGGIO = { id: "viaggio", tipo: "ore", nome: "Viaggio" };
const KM = { id: "km", tipo: "numero", nome: "Km", unita: "km" };
const PRANZO = { id: "pranzo", tipo: "si_no", nome: "Pranzo" };
const SCONTRINI = { id: "scontrini", tipo: "si_no", nome: "Scontrini" };
const NOTE = { id: "note", tipo: "note", nome: "Note" };

/** Modelli pronti della pagina del titolare: un punto di partenza, poi si cambia tutto. */
export const MODELLI = [
  {
    id: "cantieri",
    nome: "Cantieri",
    descrizione: "Ore, viaggio, cantiere, pasti, pernottamento e scontrini.",
    voci: [
      ORE, VIAGGIO,
      { id: "cantiere", tipo: "luogo", nome: "Cantiere" },
      PRANZO,
      { id: "cena", tipo: "si_no", nome: "Cena" },
      { id: "pernottamento", tipo: "si_no", nome: "Pernottamento" },
      SCONTRINI, NOTE,
    ],
  },
  {
    id: "impianti",
    nome: "Impianti e manutenzione",
    descrizione: "Ore, viaggio, cliente, km e spese.",
    voci: [ORE, VIAGGIO, { id: "cliente", tipo: "luogo", nome: "Cliente" }, KM, SCONTRINI, PRANZO, NOTE],
  },
  {
    id: "consegne",
    nome: "Consegne",
    descrizione: "Ore, giro, km e numero di consegne.",
    voci: [ORE, { id: "giro", tipo: "luogo", nome: "Giro" }, KM, { id: "consegne", tipo: "numero", nome: "Consegne" }, PRANZO, NOTE],
  },
  {
    id: "generico",
    nome: "Generico",
    descrizione: "Solo ore, sede e note.",
    voci: [ORE, { id: "sede", tipo: "luogo", nome: "Sede" }, NOTE],
  },
];

/** Configurazione nuova dal modello scelto (copia: il modello non cambia). */
export function configDaModello(id, ts) {
  const modello = MODELLI.find((m) => m.id === id);
  if (!modello) throw new Error(`Modello sconosciuto: ${id}`);
  return { v: VERSIONE, ts, voci: modello.voci.map((v) => ({ ...v })) };
}
