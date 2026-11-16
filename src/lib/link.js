import { validaConfigurazione } from "./configurazione.js";

/**
 * La configurazione viaggia nel link, dopo il # (il browser non la manda a nessun server):
 * JSON → UTF-8 → base64url senza «=». Nessuna compressione, così funziona su ogni telefono.
 */

export const MAX_LINK = 3000;
const BASE64URL = /^[A-Za-z0-9_-]+$/;

export function codifica(config) {
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Dal testo dopo il # alla configurazione: `{ ok: true, config }` oppure `{ ok: false, errore }`. */
export function decodifica(testo) {
  if (typeof testo !== "string" || testo === "") return { ok: false, errore: "Il link è vuoto" };
  if (testo.length > MAX_LINK) {
    return { ok: false, errore: `Il link è troppo lungo (più di ${MAX_LINK} caratteri)` };
  }
  if (!BASE64URL.test(testo)) return { ok: false, errore: "Il link contiene caratteri non validi" };
  if (testo.length % 4 === 1) return { ok: false, errore: "Il link è incompleto" };

  let dato;
  try {
    const base64 = testo.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((testo.length + 3) % 4);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    dato = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return { ok: false, errore: "Il contenuto del link non è leggibile" };
  }
  return validaConfigurazione(dato);
}

/** Il link da mandare ai dipendenti. `origine`: es. "https://rapportino.pages.dev". */
export function linkApp(config, origine) {
  return `${origine}/app/#${codifica(config)}`;
}

/** Da quello che il dipendente incolla (link intero, «#…» o solo il codice) al codice. */
export function testoDaLink(testo) {
  const t = String(testo ?? "").trim();
  const cancelletto = t.indexOf("#");
  return cancelletto === -1 ? t : t.slice(cancelletto + 1);
}
