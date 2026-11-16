import { useEffect, useRef, useState } from "react";
import Intestazione from "./components/Intestazione.jsx";
import BarraMese from "./components/BarraMese.jsx";
import AvvisoInstalla from "./components/AvvisoInstalla.jsx";
import IndicatoreSalvataggio from "./components/IndicatoreSalvataggio.jsx";
import ElencoGiorni from "./components/ElencoGiorni.jsx";
import BarraFondo from "./components/BarraFondo.jsx";
import DatiFattura from "./components/DatiFattura.jsx";
import { useMese } from "./hooks/useMese.js";
import { useCantieri } from "./hooks/useCantieri.js";
import { useNomeDipendente } from "./hooks/useNomeDipendente.js";
import { giorniNelMese, giornoDiOggi, spostaMese } from "./lib/calendario.js";
import { totaliMese } from "./lib/ore.js";
import { creaFileExcel } from "./lib/excel.js";
import { condividiOScarica } from "./lib/share.js";
import { isInstallata } from "./lib/installazione.js";

export default function App() {
  const [periodo, setPeriodo] = useState(() => {
    const oggi = new Date();
    return { anno: oggi.getFullYear(), mese: oggi.getMonth() };
  });
  const [giornoAperto, setGiornoAperto] = useState(null);
  const [modificaNome, setModificaNome] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [statoCondivisione, setStatoCondivisione] = useState("fermo");
  const [datiFattura, setDatiFattura] = useState(false);

  const { anno, mese } = periodo;
  const { entries, caricamento, statoSalvataggio, aggiornaGiorno } = useMese(anno, mese);
  const cantieri = useCantieri();
  const { nome, cambiaNome, errore: erroreNome } = useNomeDipendente();

  const totali = totaliMese(entries, giorniNelMese(anno, mese));
  const oggi = giornoDiOggi(anno, mese);

  // All'apertura dell'app: il giorno di oggi è già aperto e, se serve, portato in vista.
  // Nel browser (app non installata) la pagina resta in cima, dove c'è la guida all'installazione.
  const oggiGiaAperto = useRef(false);
  useEffect(() => {
    if (caricamento || oggi === null || oggiGiaAperto.current) return;
    oggiGiaAperto.current = true;
    setGiornoAperto(oggi);
    if (!isInstallata()) return;
    requestAnimationFrame(() => {
      const scheda = document.getElementById(`giorno-${oggi}`);
      if (scheda && scheda.getBoundingClientRect().top > window.innerHeight * 0.5) {
        scheda.scrollIntoView({ block: "start" });
      }
    });
  }, [caricamento, oggi]);
  const statoMostrato = cantieri.errore || erroreNome ? "errore" : statoSalvataggio;

  const cambiaMese = (delta) => {
    setPeriodo(spostaMese(anno, mese, delta));
    setGiornoAperto(null);
  };

  const suCambiaNome = (valore) => {
    cambiaNome(valore);
    if (valore.trim()) setMessaggio("");
  };

  // Niente `await` prima di condividiOScarica: il menu Condividi deve partire dal tocco.
  const condividi = async () => {
    if (!nome.trim()) {
      setMessaggio("Inserisci il tuo nome prima di condividere.");
      setModificaNome(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMessaggio("");
    setStatoCondivisione("in corso");
    try {
      const file = creaFileExcel({ nomeDipendente: nome, anno, mese, entries });
      const esito = await condividiOScarica(file);
      if (esito === "annullato") {
        setStatoCondivisione("fermo");
      } else {
        setStatoCondivisione("fatto");
        setTimeout(() => setStatoCondivisione("fermo"), 1800);
      }
    } catch {
      setStatoCondivisione("fermo");
      setMessaggio("Non è stato possibile creare il file. Riprova.");
    }
  };

  return (
    <div className="app">
      <Intestazione
        nome={nome}
        onCambiaNome={suCambiaNome}
        modificaNome={modificaNome}
        onModificaNome={setModificaNome}
        onDatiFattura={() => setDatiFattura(true)}
      />
      <BarraMese anno={anno} mese={mese} onCambiaMese={cambiaMese} />
      <AvvisoInstalla />
      {messaggio && (
        <div className="messaggio" role="alert">
          {messaggio}
        </div>
      )}
      <IndicatoreSalvataggio stato={statoMostrato} />
      {caricamento ? (
        <div className="caricamento">Caricamento…</div>
      ) : (
        <ElencoGiorni
          anno={anno}
          mese={mese}
          entries={entries}
          oggi={oggi}
          giornoAperto={giornoAperto}
          onApri={setGiornoAperto}
          onAggiorna={aggiornaGiorno}
          cantieri={cantieri}
          onDatiFattura={() => setDatiFattura(true)}
        />
      )}
      <BarraFondo totali={totali} statoCondivisione={statoCondivisione} onCondividi={condividi} />
      {datiFattura && <DatiFattura onChiudi={() => setDatiFattura(false)} />}
    </div>
  );
}
