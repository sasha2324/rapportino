import { get, set } from "idb-keyval";
import { chiaveMese } from "./calendario.js";

const CHIAVE_IMPOSTAZIONI = "settings";
const CHIAVE_LUOGHI = "luoghi";
const CHIAVE_CONFIGURAZIONE = "configurazione";

export async function caricaMese(anno, mese) {
  return (await get(chiaveMese(anno, mese))) ?? {};
}

export async function salvaMese(anno, mese, entries) {
  await set(chiaveMese(anno, mese), entries);
}

export async function caricaImpostazioni() {
  return { employeeName: "", ...((await get(CHIAVE_IMPOSTAZIONI)) ?? {}) };
}

export async function salvaImpostazioni(impostazioni) {
  await set(CHIAVE_IMPOSTAZIONI, impostazioni);
}

/** La configurazione del modulo in uso (va sempre ricontrollata: vedi avvio.js). */
export async function caricaConfigurazione() {
  return (await get(CHIAVE_CONFIGURAZIONE)) ?? null;
}

export async function salvaConfigurazione(config) {
  await set(CHIAVE_CONFIGURAZIONE, config);
}

export async function caricaLuoghi() {
  return (await get(CHIAVE_LUOGHI)) ?? [];
}

export async function salvaLuoghi(elenco) {
  await set(CHIAVE_LUOGHI, elenco);
}

/** Chiede al browser di non cancellare i dati da solo. Ritorna true se la persistenza è attiva. */
export async function chiediPersistenza(storage = globalThis.navigator?.storage) {
  try {
    if (!storage?.persist) return false;
    if (await storage.persisted?.()) return true;
    return await storage.persist();
  } catch {
    return false;
  }
}
