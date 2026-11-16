import { get, set } from "idb-keyval";
import { chiaveMese } from "./calendario.js";

const CHIAVE_IMPOSTAZIONI = "settings";
const CHIAVE_CANTIERI = "cantieri";

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

export async function caricaCantieri() {
  return (await get(CHIAVE_CANTIERI)) ?? [];
}

export async function salvaCantieri(elenco) {
  await set(CHIAVE_CANTIERI, elenco);
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
