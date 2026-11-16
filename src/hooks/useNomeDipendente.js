import { useCallback, useEffect, useRef, useState } from "react";
import { caricaImpostazioni, salvaImpostazioni } from "../lib/storage.js";

export function useNomeDipendente() {
  const [nome, setNome] = useState("");
  const [errore, setErrore] = useState(false);
  const modificato = useRef(false);

  useEffect(() => {
    caricaImpostazioni()
      .then((i) => {
        if (!modificato.current) setNome(i.employeeName);
      })
      .catch(() => {});
  }, []);

  const cambiaNome = useCallback(async (valore) => {
    modificato.current = true;
    setNome(valore);
    try {
      await salvaImpostazioni({ employeeName: valore });
      setErrore(false);
    } catch {
      setErrore(true);
    }
  }, []);

  return { nome, cambiaNome, errore };
}
