import { useCallback, useEffect, useRef, useState } from "react";
import { rimuoviCantiere, usaCantiere } from "../lib/cantieri.js";
import { caricaCantieri, salvaCantieri } from "../lib/storage.js";

export function useCantieri() {
  const [elenco, setElenco] = useState([]);
  const [pronto, setPronto] = useState(false);
  const [errore, setErrore] = useState(false);
  const elencoRef = useRef([]);
  const prontoRef = useRef(false);

  useEffect(() => {
    caricaCantieri()
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
      await salvaCantieri(nuovo);
      setErrore(false);
    } catch {
      setErrore(true);
    }
  }, []);

  const usa = useCallback((nome) => aggiorna(usaCantiere(elencoRef.current, nome)), [aggiorna]);
  const rimuovi = useCallback((nome) => aggiorna(rimuoviCantiere(elencoRef.current, nome)), [aggiorna]);

  return { elenco, pronto, errore, usa, rimuovi };
}
