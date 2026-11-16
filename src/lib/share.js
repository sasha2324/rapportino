export function scaricaFile(file, doc = document) {
  const url = URL.createObjectURL(file);
  const a = doc.createElement("a");
  a.href = url;
  a.download = file.name;
  doc.body.appendChild(a);
  a.click();
  doc.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Apre il menu Condividi del telefono con il file allegato; altrimenti lo scarica.
 * Ritorna "condiviso" | "annullato" | "scaricato".
 *
 * IMPORTANTE: va chiamata direttamente dal tocco del pulsante, senza `await` prima:
 * iPhone e Android aprono il menu solo se navigator.share parte dal gesto dell'utente.
 */
export async function condividiOScarica(file, { nav = globalThis.navigator, scarica = scaricaFile } = {}) {
  const dati = { files: [file] };
  if (nav?.canShare?.(dati) && typeof nav.share === "function") {
    try {
      await nav.share(dati);
      return "condiviso";
    } catch (e) {
      if (e?.name === "AbortError") return "annullato";
    }
  }
  scarica(file);
  return "scaricato";
}
