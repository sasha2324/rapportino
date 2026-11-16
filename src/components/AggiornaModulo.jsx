import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/**
 * «Hai ricevuto un modulo aggiornato? Incolla il link»: serve soprattutto su iPhone, dove
 * l'app installata non vede i link aperti in Safari. Accetta solo link validi del titolare
 * (i controlli sono in onAggiorna → useConfigurazione.aggiornaDaLink).
 */
export default function AggiornaModulo({ onAggiorna, testoPulsante = "Hai ricevuto un modulo aggiornato? Incolla il link" }) {
  const [aperto, setAperto] = useState(false);
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");
  const [fatto, setFatto] = useState(false);
  const [inCorso, setInCorso] = useState(false);

  const conferma = async (e) => {
    e.preventDefault();
    setInCorso(true);
    const esito = await onAggiorna(testo);
    setInCorso(false);
    if (esito.ok) {
      setAperto(false);
      setTesto("");
      setErrore("");
      setFatto(true);
      setTimeout(() => setFatto(false), 2500);
    } else {
      setErrore(esito.errore);
    }
  };

  if (!aperto) {
    return (
      <div className="aggiorna">
        {fatto && (
          <p className="aggiorna__fatto" role="status">
            <Check size={16} aria-hidden="true" /> Modulo aggiornato
          </p>
        )}
        <button type="button" className="aggiorna__apri" onClick={() => setAperto(true)}>
          <Link2 size={16} aria-hidden="true" /> {testoPulsante}
        </button>
      </div>
    );
  }

  return (
    <form className="aggiorna aggiorna--aperto" onSubmit={conferma}>
      <label>
        <span className="etichetta">Link del modulo</span>
        <span className={`campo${errore ? " campo--errore" : ""}`}>
          <input
            type="text"
            inputMode="url"
            value={testo}
            onChange={(e) => {
              setTesto(e.target.value);
              setErrore("");
            }}
            placeholder="Incolla qui il link del titolare"
            autoComplete="off"
            autoFocus
            enterKeyHint="done"
            aria-invalid={Boolean(errore)}
          />
        </span>
      </label>
      {errore && (
        <p className="aggiorna__errore" role="alert">
          {errore}
        </p>
      )}
      <div className="aggiorna__azioni">
        <button type="button" className="pulsante-secondario" onClick={() => { setAperto(false); setErrore(""); }}>
          Annulla
        </button>
        <button type="submit" className="pulsante-primario" disabled={!testo.trim() || inCorso}>
          Usa questo modulo
        </button>
      </div>
      <p className="aggiorna__nota">I giorni già segnati restano.</p>
    </form>
  );
}
