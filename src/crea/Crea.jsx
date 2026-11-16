import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import EditorVoci from "./EditorVoci.jsx";
import DatiAzienda from "./DatiAzienda.jsx";
import Anteprima from "./Anteprima.jsx";
import Condividi from "./Condividi.jsx";
import { CAMPI_AZIENDA, VERSIONE, validaConfigurazione } from "../lib/configurazione.js";
import { MODELLI, configDaModello } from "../lib/modelli.js";
import { decodifica, linkApp, testoDaLink } from "../lib/link.js";

const aziendaVuota = () => Object.fromEntries(CAMPI_AZIENDA.map((c) => [c.chiave, ""]));

function Sezione({ numero, titolo, nota, children }) {
  return (
    <section className="sezione" aria-labelledby={`sezione-${numero}`}>
      <h2 id={`sezione-${numero}`}>
        <span className="sezione__numero" aria-hidden="true">
          {numero}
        </span>
        {titolo}
        {nota && <small>{nota}</small>}
      </h2>
      {children}
    </section>
  );
}

/** «Hai già un modulo? Incolla il link per modificarlo»: stessi controlli dell'app. */
function CaricaModulo({ onCarica }) {
  const [aperto, setAperto] = useState(false);
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");

  if (!aperto) {
    return (
      <button type="button" className="link-semplice" onClick={() => setAperto(true)}>
        <FolderOpen size={16} aria-hidden="true" /> Hai già un modulo? Incolla il link per modificarlo
      </button>
    );
  }
  const carica = (e) => {
    e.preventDefault();
    const r = decodifica(testoDaLink(testo));
    if (!r.ok) return setErrore(r.errore);
    onCarica(r.config);
    setAperto(false);
    setTesto("");
    setErrore("");
  };
  return (
    <form className="carica" onSubmit={carica}>
      <label>
        <span className="etichetta">Link del modulo da modificare</span>
        <span className={`campo${errore ? " campo--errore" : ""}`}>
          <input
            type="text"
            inputMode="url"
            value={testo}
            onChange={(e) => {
              setTesto(e.target.value);
              setErrore("");
            }}
            autoComplete="off"
            autoFocus
          />
        </span>
      </label>
      {errore && (
        <p className="campo__errore" role="alert">
          {errore}
        </p>
      )}
      <div className="carica__azioni">
        <button type="button" className="pulsante-secondario" onClick={() => setAperto(false)}>
          Annulla
        </button>
        <button type="submit" className="pulsante-primario" disabled={!testo.trim()}>
          Carica il modulo
        </button>
      </div>
    </form>
  );
}

/**
 * Pagina del titolare: sceglie le voci (da un modello o da un modulo già fatto), i dati
 * dell'azienda, vede l'anteprima e ottiene link e QR code. Tutto resta nel browser.
 */
export default function Crea({ origine = window.location.origin, adesso = () => Date.now() }) {
  const [modello, setModello] = useState("cantieri");
  const [voci, setVoci] = useState(() => configDaModello("cantieri", 0).voci);
  const [azienda, setAzienda] = useState(aziendaVuota);
  // Un modulo caricato per modificarlo: il link nuovo deve risultare più recente
  const [tsMinimo, setTsMinimo] = useState(0);

  const config = useMemo(() => {
    const dati = Object.fromEntries(
      Object.entries(azienda)
        .map(([k, v]) => [k, v.trim()])
        .filter(([, v]) => v)
    );
    return {
      v: VERSIONE,
      ts: Math.max(Math.floor(adesso() / 1000), tsMinimo),
      ...(Object.keys(dati).length > 0 ? { azienda: dati } : {}),
      voci,
    };
    // La data si aggiorna a ogni modifica del modulo (`adesso` non cambia)
  }, [voci, azienda, tsMinimo]);

  const verifica = validaConfigurazione(config);
  const link = verifica.ok ? linkApp(verifica.config, origine) : null;

  const scegliModello = (id) => {
    setModello(id);
    setVoci(configDaModello(id, 0).voci);
  };

  const carica = (caricata) => {
    setModello(null);
    setVoci(caricata.voci.map((v) => ({ ...v })));
    setAzienda({ ...aziendaVuota(), ...caricata.azienda });
    setTsMinimo(caricata.ts + 1);
  };

  return (
    <div className="crea">
      <header className="crea__testata">
        <div className="crea__contenitore">
          <a className="crea__marchio" href="/">
            Rapportino
          </a>
          <h1>Crea il modulo per la tua azienda</h1>
          <p>Scegli cosa devono segnare i dipendenti, controlla l'anteprima e manda il link o il QR code. Niente account: il modulo sta tutto nel link.</p>
        </div>
      </header>

      <div className="crea__contenitore crea__corpo">
        <div className="crea__colonna">
          <Sezione numero="1" titolo="Parti da un modello">
            <div className="modelli">
              {MODELLI.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`modello${modello === m.id ? " modello--scelto" : ""}`}
                  aria-pressed={modello === m.id}
                  onClick={() => scegliModello(m.id)}
                >
                  <span className="modello__nome">{m.nome}</span>
                  <span className="modello__descrizione">{m.descrizione}</span>
                </button>
              ))}
            </div>
            <CaricaModulo onCarica={carica} />
          </Sezione>

          <Sezione numero="2" titolo="Voci da segnare">
            <EditorVoci voci={voci} onCambia={setVoci} />
          </Sezione>

          <Sezione numero="3" titolo="Dati dell'azienda" nota="facoltativi, per le fatture di pasti e alberghi">
            <DatiAzienda azienda={azienda} onCambia={setAzienda} />
          </Sezione>
        </div>

        <div className="crea__colonna crea__lato">
          <Sezione numero="4" titolo="Anteprima">
            <Anteprima config={config} />
          </Sezione>

          <Sezione numero="5" titolo="Manda ai dipendenti">
            <Condividi link={link} errore={verifica.ok ? "" : verifica.errore} />
          </Sezione>
        </div>
      </div>

      <footer className="crea__contenitore crea__piede">
        <p>I dati restano sul telefono. Non sostituisce il sistema ufficiale di rilevazione presenze.</p>
      </footer>
    </div>
  );
}
