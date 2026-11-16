import { useCallback, useEffect, useRef, useState } from "react";
import { scegliConfigurazione } from "../lib/avvio.js";
import { decodifica, testoDaLink } from "../lib/link.js";
import { caricaConfigurazione, salvaConfigurazione } from "../lib/storage.js";

/**
 * Il modulo in uso: dal link (dopo il #) o dalla memoria del telefono, secondo le regole
 * di avvio.js. `aggiornaDaLink` serve al dipendente che incolla un link nuovo del titolare
 * (su iPhone l'app installata non vede i link aperti in Safari).
 */
export function useConfigurazione({ leggiHash = () => window.location.hash } = {}) {
  const [stato, setStato] = useState({ caricamento: true, config: null, avviso: null, errore: null });
  const statoRef = useRef(stato);
  statoRef.current = stato;
  const leggiHashRef = useRef(leggiHash);

  useEffect(() => {
    let annullato = false;
    (async () => {
      const testo = leggiHashRef.current().replace(/^#/, "");
      const dalLink = testo ? decodifica(testo) : null;
      let salvata = null;
      try {
        salvata = await caricaConfigurazione();
      } catch {
        salvata = null;
      }
      const { config, salva, avviso, errore } = scegliConfigurazione({ dalLink, salvata });
      if (salva) {
        try {
          await salvaConfigurazione(config);
        } catch {
          // Memoria bloccata: il modulo vale finché l'app resta aperta.
        }
      }
      if (!annullato) setStato({ caricamento: false, config, avviso, errore });
    })();
    return () => {
      annullato = true;
    };
  }, []);

  const aggiornaDaLink = useCallback(async (incollato) => {
    const r = decodifica(testoDaLink(incollato));
    if (!r.ok) return { ok: false, errore: r.errore };
    const attuale = statoRef.current.config;
    if (attuale && r.config.ts < attuale.ts) {
      return { ok: false, errore: "Questo modulo è più vecchio di quello che stai usando." };
    }
    try {
      await salvaConfigurazione(r.config);
    } catch {
      return { ok: false, errore: "Non è stato possibile salvare il modulo nel telefono. Riprova." };
    }
    setStato({ caricamento: false, config: r.config, avviso: null, errore: null });
    return { ok: true };
  }, []);

  return { ...stato, aggiornaDaLink };
}
