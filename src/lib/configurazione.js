import { partitaIvaValida } from "./azienda.js";

/**
 * Configurazione del modulo: dati dell'azienda (facoltativi) e voci da segnare.
 * Arriva da un link, quindi è un dato NON fidato: `validaConfigurazione` controlla tutto
 * e restituisce una copia pulita, oppure un messaggio d'errore in italiano.
 * Struttura e regole: docs/superpowers/specs/2026-11-16-rapportino-configurazione-design.md
 */

export const VERSIONE = 1;

export const TIPI = ["ore", "luogo", "numero", "si_no", "note"];

/** Nome di ogni tipo per le persone (messaggi, pagina del titolare). */
export const NOMI_TIPI = { ore: "ore", luogo: "luogo", numero: "numero", si_no: "sì/no", note: "note" };

export const LIMITI = {
  voci: 20,
  perTipo: { ore: [1, 3], luogo: [0, 1], numero: [0, 5], si_no: [0, 10], note: [0, 1] },
  nome: 30,
  unita: 8,
  tsMin: Date.UTC(2026, 0, 1) / 1000,
  tsMax: Date.UTC(2100, 0, 1) / 1000,
};

const ID = /^[a-z][a-z0-9-]{0,19}$/;
const CONTROLLO = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;

export const CAMPI_AZIENDA = [
  { chiave: "nome", etichetta: "Ragione sociale", max: 80 },
  { chiave: "sede", etichetta: "Sede", max: 120 },
  { chiave: "piva", etichetta: "Partita IVA", max: 11 },
  { chiave: "sdi", etichetta: "Codice SDI", max: 7 },
  { chiave: "email", etichetta: "Email", max: 80 },
  { chiave: "tel", etichetta: "Telefono", max: 20 },
];

const lunghezza = (testo) => Array.from(testo).length; // un'emoji conta 1
const isOggetto = (x) => Object.prototype.toString.call(x) === "[object Object]";

class ErroreConfigurazione extends Error {}
const fallisci = (messaggio) => {
  throw new ErroreConfigurazione(messaggio);
};

function chiaviAmmesse(oggetto, ammesse, prefisso) {
  for (const chiave of Object.keys(oggetto)) {
    if (!ammesse.includes(chiave)) fallisci(`${prefisso}chiave sconosciuta «${chiave}»`);
  }
}

/** Problema di un campo dell'azienda (senza etichetta), oppure null. Vuoto = va bene. */
export function controllaCampoAzienda(chiave, valore) {
  const campo = CAMPI_AZIENDA.find((c) => c.chiave === chiave);
  if (typeof valore !== "string") return "deve essere un testo";
  const v = valore.trim();
  if (v === "") return null;
  if (CONTROLLO.test(v)) return "contiene caratteri non ammessi";
  if (lunghezza(v) > campo.max) return `troppo lunga, massimo ${campo.max} caratteri`;
  switch (chiave) {
    case "piva":
      if (!/^\d{11}$/.test(v)) return "servono 11 cifre";
      return partitaIvaValida(v) ? null : "la cifra di controllo non torna";
    case "sdi":
      return /^[A-Za-z0-9]{7}$/.test(v) ? null : "servono 7 lettere o cifre";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "non sembra un indirizzo email";
    case "tel":
      return /^[0-9 +\-.()/]+$/.test(v) && /\d/.test(v) ? null : "solo cifre, spazi e + - . ( ) /";
    default:
      return null;
  }
}

function pulisciAzienda(azienda) {
  if (!isOggetto(azienda)) fallisci("I dati dell'azienda non sono validi");
  chiaviAmmesse(azienda, CAMPI_AZIENDA.map((c) => c.chiave), "Dati dell'azienda: ");
  const pulita = {};
  for (const { chiave, etichetta } of CAMPI_AZIENDA) {
    if (!(chiave in azienda)) continue;
    const problema = controllaCampoAzienda(chiave, azienda[chiave]);
    if (problema) fallisci(`Dati dell'azienda, ${etichetta}: ${problema}`);
    const valore = azienda[chiave].trim();
    if (valore) pulita[chiave] = valore;
  }
  return pulita;
}

function pulisciVoce(voce, i, idUsati) {
  const p = `Voce ${i + 1}: `;
  if (!isOggetto(voce)) fallisci(`${p}non è una voce valida`);
  chiaviAmmesse(voce, ["id", "tipo", "nome", "unita"], p);

  if (typeof voce.id !== "string" || !ID.test(voce.id)) fallisci(`${p}codice non valido`);
  if (idUsati.has(voce.id)) fallisci(`${p}codice «${voce.id}» ripetuto`);
  idUsati.add(voce.id);

  if (!TIPI.includes(voce.tipo)) fallisci(`${p}tipo sconosciuto «${String(voce.tipo)}»`);

  if (typeof voce.nome !== "string") fallisci(`${p}nome non valido`);
  const nome = voce.nome.trim();
  if (!nome) fallisci(`${p}nome vuoto`);
  if (CONTROLLO.test(nome)) fallisci(`${p}il nome contiene caratteri non ammessi`);
  if (lunghezza(nome) > LIMITI.nome) fallisci(`${p}nome troppo lungo, massimo ${LIMITI.nome} caratteri`);

  const pulita = { id: voce.id, tipo: voce.tipo, nome };
  if ("unita" in voce) {
    if (voce.tipo !== "numero") fallisci(`${p}l'unità si usa solo con i numeri`);
    if (typeof voce.unita !== "string" || CONTROLLO.test(voce.unita)) fallisci(`${p}unità non valida`);
    const unita = voce.unita.trim();
    if (lunghezza(unita) > LIMITI.unita) fallisci(`${p}unità troppo lunga, massimo ${LIMITI.unita} caratteri`);
    if (unita) pulita.unita = unita;
  }
  return pulita;
}

function pulisci(dato) {
  if (!isOggetto(dato)) fallisci("Il contenuto del link non è un modulo");
  chiaviAmmesse(dato, ["v", "ts", "azienda", "voci"], "");
  if (dato.v !== VERSIONE) fallisci("La versione del modulo non è supportata");
  if (!Number.isInteger(dato.ts) || dato.ts < LIMITI.tsMin || dato.ts > LIMITI.tsMax) {
    fallisci("La data del modulo non è valida");
  }

  if (!Array.isArray(dato.voci)) fallisci("L'elenco delle voci manca o non è valido");
  if (dato.voci.length === 0) fallisci("Serve almeno una voce");
  if (dato.voci.length > LIMITI.voci) fallisci(`Ci possono essere al massimo ${LIMITI.voci} voci`);

  const idUsati = new Set();
  const voci = dato.voci.map((v, i) => pulisciVoce(v, i, idUsati));

  for (const tipo of TIPI) {
    const [min, max] = LIMITI.perTipo[tipo];
    const n = voci.filter((v) => v.tipo === tipo).length;
    if (n < min) fallisci(`Serve almeno una voce di tipo ${NOMI_TIPI[tipo]}`);
    if (n > max) fallisci(`Ci possono essere al massimo ${max} ${max === 1 ? "voce" : "voci"} di tipo ${NOMI_TIPI[tipo]}`);
  }

  const config = { v: VERSIONE, ts: dato.ts };
  if ("azienda" in dato) {
    const azienda = pulisciAzienda(dato.azienda);
    if (Object.keys(azienda).length > 0) config.azienda = azienda;
  }
  config.voci = voci;
  return config;
}

/** `{ ok: true, config }` con una copia pulita, oppure `{ ok: false, errore }`. */
export function validaConfigurazione(dato) {
  try {
    return { ok: true, config: pulisci(dato) };
  } catch (e) {
    if (e instanceof ErroreConfigurazione) return { ok: false, errore: e.message };
    throw e;
  }
}

/** I dati dell'azienda presenti, nell'ordine e con le etichette, per mostrarli o condividerli. */
export function righeAzienda(azienda) {
  if (!azienda) return [];
  return CAMPI_AZIENDA.filter((c) => azienda[c.chiave]).map((c) => ({
    chiave: c.chiave,
    etichetta: c.etichetta,
    valore: azienda[c.chiave],
  }));
}

/**
 * Codice di una voce nuova, ricavato dal suo primo nome: è la chiave dei dati salvati
 * nel telefono, quindi non cambia più anche se la voce viene rinominata.
 */
export function idDaNome(nome, usati) {
  const ripulito = String(nome ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let base = ripulito === "" ? "voce" : /^[a-z]/.test(ripulito) ? ripulito : `v-${ripulito}`;
  base = base.slice(0, 20).replace(/-+$/, "");
  if (!usati.includes(base)) return base;
  for (let n = 2; ; n++) {
    const coda = `-${n}`;
    const candidato = base.slice(0, 20 - coda.length).replace(/-+$/, "") + coda;
    if (!usati.includes(candidato)) return candidato;
  }
}
