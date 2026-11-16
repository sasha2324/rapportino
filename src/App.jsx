import { useEffect, useRef, useState } from "react";
import Intestazione from "./components/Intestazione.jsx";
import BarraMese from "./components/BarraMese.jsx";
import AvvisoInstalla from "./components/AvvisoInstalla.jsx";
import IndicatoreSalvataggio from "./components/IndicatoreSalvataggio.jsx";
import ElencoGiorni from "./components/ElencoGiorni.jsx";
import BarraFondo from "./components/BarraFondo.jsx";
import DatiFattura from "./components/DatiFattura.jsx";
import AggiornaModulo from "./components/AggiornaModulo.jsx";
import SchermataErrore from "./components/SchermataErrore.jsx";
import { useConfigurazione } from "./hooks/useConfigurazione.js";
import { useMese } from "./hooks/useMese.js";
import { useLuoghi } from "./hooks/useLuoghi.js";
import { useNomeDipendente } from "./hooks/useNomeDipendente.js";
import { giorniNelMese, giornoDiOggi, spostaMese } from "./lib/calendario.js";
import { righeAzienda } from "./lib/configurazione.js";
import { totaliMese } from "./lib/ore.js";
import { creaFileExcel } from "./lib/excel.js";
import { condividiOScarica } from "./lib/share.js";
import { isInstallata } from "./lib/installazione.js";
import { applicaManifest } from "./lib/manifest.js";

/** L'app del dipendente: prima il modulo (dal link o dalla memoria), poi il registro del mese. */
export default function App() {
  const modulo = useConfigurazione();

  useEffect(() => {
    if (!modulo.config) return;
    const nome = modulo.config.azienda?.nome;
    document.title = nome ? `${nome} – Rapportino` : "Rapportino";
    applicaManifest(modulo.config);
  }, [modulo.config]);

  if (modulo.caricamento) return <div className="caricamento">Caricamento…</div>;
  if (!modulo.config) return <SchermataErrore errore={modulo.errore} onAggiorna={modulo.aggiornaDaLink} />;
  return <Registro config={modulo.config} avviso={modulo.avviso} onAggiornaModulo={modulo.aggiornaDaLink} />;
}

function Registro({ config, avviso, onAggiornaModulo }) {
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
  const { voci, azienda } = config;
  const { entries, caricamento, statoSalvataggio, aggiornaGiorno } = useMese(anno, mese);
  const luoghi = useLuoghi();
  const { nome, cambiaNome, errore: erroreNome } = useNomeDipendente();

  const totali = totaliMese(entries, giorniNelMese(anno, mese), voci);
  const oggi = giornoDiOggi(anno, mese);
  const apriFattura = righeAzienda(azienda).length > 0 ? () => setDatiFattura(true) : undefined;

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
  const statoMostrato = luoghi.errore || erroreNome ? "errore" : statoSalvataggio;

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
      const file = creaFileExcel({ config, nomeDipendente: nome, anno, mese, entries });
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
        titolo={azienda?.nome || "Rapportino"}
        nome={nome}
        onCambiaNome={suCambiaNome}
        modificaNome={modificaNome}
        onModificaNome={setModificaNome}
        onDatiFattura={apriFattura}
      />
      <BarraMese anno={anno} mese={mese} onCambiaMese={cambiaMese} />
      <AvvisoInstalla />
      {avviso && (
        <div className="messaggio" role="alert">
          {avviso}
        </div>
      )}
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
          voci={voci}
          oggi={oggi}
          giornoAperto={giornoAperto}
          onApri={setGiornoAperto}
          onAggiorna={aggiornaGiorno}
          luoghi={luoghi}
          onDatiFattura={apriFattura}
        />
      )}
      <AggiornaModulo onAggiorna={onAggiornaModulo} />
      <BarraFondo totali={totali} voci={voci} statoCondivisione={statoCondivisione} onCondividi={condividi} />
      {datiFattura && <DatiFattura azienda={azienda} onChiudi={() => setDatiFattura(false)} />}
    </div>
  );
}
