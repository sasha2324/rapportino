import { useCallback, useEffect, useRef, useState } from "react";
import { chiaveMese } from "../lib/calendario.js";
import { leggiGiorno } from "../lib/giorno.js";
import { caricaMese, salvaMese } from "../lib/storage.js";

const RITARDO_SALVATAGGIO = 400;
const DURATA_SALVATO = 1200;

/**
 * Dati del mese mostrato, con salvataggio automatico.
 * statoSalvataggio: "fermo" | "salvataggio" | "salvato" | "errore"
 */
export function useMese(anno, mese) {
  const chiave = chiaveMese(anno, mese);
  const [dati, setDati] = useState({ chiave: null, anno, mese, entries: {} });
  const [statoSalvataggio, setStatoSalvataggio] = useState("fermo");
  const datiRef = useRef(dati);
  const inAttesa = useRef(null); // { anno, mese, entries, timer }

  const salvaOra = useCallback(async () => {
    const p = inAttesa.current;
    if (!p) return;
    clearTimeout(p.timer);
    inAttesa.current = null;
    try {
      await salvaMese(p.anno, p.mese, p.entries);
      if (!inAttesa.current) {
        setStatoSalvataggio("salvato");
        setTimeout(() => setStatoSalvataggio((s) => (s === "salvato" ? "fermo" : s)), DURATA_SALVATO);
      }
    } catch {
      setStatoSalvataggio("errore");
    }
  }, []);

  // Cambio mese: prima salva quello che era in attesa, poi carica il mese nuovo.
  useEffect(() => {
    let annullato = false;
    (async () => {
      await salvaOra();
      let entries = {};
      try {
        entries = await caricaMese(anno, mese);
      } catch {
        entries = {};
      }
      if (annullato) return;
      const nuovi = { chiave: chiaveMese(anno, mese), anno, mese, entries };
      datiRef.current = nuovi;
      setDati(nuovi);
    })();
    return () => {
      annullato = true;
    };
  }, [anno, mese, salvaOra]);

  // App chiusa o messa in secondo piano: salva subito.
  useEffect(() => {
    const quandoNascosta = () => {
      if (document.visibilityState === "hidden") salvaOra();
    };
    document.addEventListener("visibilitychange", quandoNascosta);
    window.addEventListener("pagehide", salvaOra);
    return () => {
      document.removeEventListener("visibilitychange", quandoNascosta);
      window.removeEventListener("pagehide", salvaOra);
    };
  }, [salvaOra]);

  const aggiornaGiorno = useCallback(
    (numero, campo, valore) => {
      const attuali = datiRef.current;
      if (attuali.chiave === null) return;
      const giorno = { ...leggiGiorno(attuali.entries, numero), [campo]: valore };
      const nuovi = { ...attuali, entries: { ...attuali.entries, [numero]: giorno } };
      datiRef.current = nuovi;
      setDati(nuovi);

      const p = inAttesa.current;
      if (p && (p.anno !== nuovi.anno || p.mese !== nuovi.mese)) {
        salvaOra(); // modifica di un altro mese ancora in attesa: salvala subito
      } else if (p) {
        clearTimeout(p.timer);
      }
      setStatoSalvataggio("salvataggio");
      inAttesa.current = {
        anno: nuovi.anno,
        mese: nuovi.mese,
        entries: nuovi.entries,
        timer: setTimeout(salvaOra, RITARDO_SALVATAGGIO),
      };
    },
    [salvaOra]
  );

  const caricamento = dati.chiave !== chiave;
  return {
    entries: caricamento ? {} : dati.entries,
    caricamento,
    statoSalvataggio,
    aggiornaGiorno,
  };
}
