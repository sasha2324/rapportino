import { validaConfigurazione } from "./configurazione.js";

/**
 * Quale configurazione usare all'apertura dell'app.
 * - dalLink: null se l'indirizzo non ha il #, altrimenti il risultato di `decodifica`;
 * - salvata: quella salvata nel telefono (ricontrollata: la memoria potrebbe essere rovinata).
 *
 * Tra due configurazioni valide vince quella con `ts` più alto: l'icona installata riparte
 * sempre dal link con cui è stata installata, che può essere più vecchio di quello salvato.
 *
 * Ritorna { config, salva, avviso, errore }; errore: null | { tipo: "link" | "mancante", dettaglio }.
 */
export function scegliConfigurazione({ dalLink, salvata }) {
  const controllo = salvata ? validaConfigurazione(salvata) : null;
  const inMemoria = controllo?.ok ? controllo.config : null;
  const usa = (config, salva = false, avviso = null) => ({ config, salva, avviso, errore: null });

  if (dalLink?.ok) {
    const link = dalLink.config;
    if (!inMemoria) return usa(link, true);
    if (link.ts < inMemoria.ts) return usa(inMemoria);
    return usa(link, JSON.stringify(link) !== JSON.stringify(inMemoria));
  }
  if (dalLink) {
    if (inMemoria) {
      return usa(inMemoria, false, `Il link aperto non funziona (${dalLink.errore}). Continui a usare il modulo che avevi già.`);
    }
    return { config: null, salva: false, avviso: null, errore: { tipo: "link", dettaglio: dalLink.errore } };
  }
  if (inMemoria) return usa(inMemoria);
  return { config: null, salva: false, avviso: null, errore: { tipo: "mancante", dettaglio: null } };
}
