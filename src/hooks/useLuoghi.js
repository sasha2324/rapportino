import { useCallback, useEffect, useRef, useState } from "react";
import { rimuoviLuogo, usaLuogo } from "../lib/luoghi.js";
import { caricaLuoghi, salvaLuoghi } from "../lib/storage.js";

export function useLuoghi() {
  const [elenco, setElenco] = useState([]);
  const [pronto, setPronto] = useState(false);
  const [errore, setErrore] = useState(false);
  const elencoRef = useRef([]);
  const prontoRef = useRef(false);

  useEffect(() => {
    caricaLuoghi()
      .then((salvati) => {
        elencoRef.current = salvati;
        setElenco(salvati);
      })
      .catch(() => {})
      .finally(() => {
        prontoRef.current = true;
        setPronto(true);
      });
  }, []);

  const aggiorna = useCallback(async (nuovo) => {
    // Prima del caricamento non si tocca niente, per non sovrascrivere l'elenco salvato.
    if (!prontoRef.current || nuovo === elencoRef.current) return;
    elencoRef.current = nuovo;
    setElenco(nuovo);
    try {
      await salvaLuoghi(nuovo);
      setErrore(false);
    } catch {
      setErrore(true);
    }
  }, []);

  const usa = useCallback((nome) => aggiorna(usaLuogo(elencoRef.current, nome)), [aggiorna]);
  const rimuovi = useCallback((nome) => aggiorna(rimuoviLuogo(elencoRef.current, nome)), [aggiorna]);

  return { elenco, pronto, errore, usa, rimuovi };
}
