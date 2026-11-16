import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { LIMITI, TIPI, idDaNome } from "../lib/configurazione.js";

export const ETICHETTE_TIPI = { ore: "Ore", luogo: "Luogo", numero: "Numero", si_no: "Sì/no", note: "Note" };
const NOMI_NUOVI = { ore: "Ore", luogo: "Luogo", numero: "Numero", si_no: "Casella", note: "Note" };
const SPIEGAZIONI = {
  ore: "ore del giorno, sommate nel totale (es. Ore lavorate, Viaggio)",
  luogo: "dove si lavora, con i luoghi già usati da scegliere (es. Cantiere, Cliente, Sede)",
  numero: "un numero con la sua unità (es. Km)",
  si_no: "una casella da spuntare (es. Pranzo, Scontrini)",
  note: "testo libero",
};

/**
 * Elenco delle voci del modulo: nome, unità per i numeri, ordine, togli e aggiungi nei limiti.
 * Il codice (id) di una voce nasce con lei e non cambia se la si rinomina: è la chiave dei
 * dati salvati nei telefoni dei dipendenti.
 */
export default function EditorVoci({ voci, onCambia }) {
  const conta = (tipo) => voci.filter((v) => v.tipo === tipo).length;
  const puoAggiungere = (tipo) => voci.length < LIMITI.voci && conta(tipo) < LIMITI.perTipo[tipo][1];
  const puoTogliere = (voce) => !(voce.tipo === "ore" && conta("ore") <= LIMITI.perTipo.ore[0]);

  const cambia = (i, campi) => onCambia(voci.map((v, j) => (j === i ? { ...v, ...campi } : v)));
  const sposta = (i, d) => {
    const nuove = [...voci];
    [nuove[i], nuove[i + d]] = [nuove[i + d], nuove[i]];
    onCambia(nuove);
  };
  const togli = (i) => onCambia(voci.filter((_, j) => j !== i));
  const aggiungi = (tipo) => {
    const nome = NOMI_NUOVI[tipo];
    onCambia([...voci, { id: idDaNome(nome, voci.map((v) => v.id)), tipo, nome }]);
  };

  return (
    <div className="editor-voci">
      <ol className="voci">
        {voci.map((voce, i) => {
          const vuoto = !voce.nome.trim();
          return (
            <li key={voce.id} className="voce">
              <span className={`voce__tipo voce__tipo--${voce.tipo}`}>{ETICHETTE_TIPI[voce.tipo]}</span>
              <input
                className={`voce__nome${vuoto ? " voce__nome--errore" : ""}`}
                value={voce.nome}
                maxLength={LIMITI.nome}
                onChange={(e) => cambia(i, { nome: e.target.value })}
                aria-label={`Nome della voce ${i + 1} (${ETICHETTE_TIPI[voce.tipo]})`}
                aria-invalid={vuoto}
              />
              {voce.tipo === "numero" && (
                <input
                  className="voce__unita"
                  value={voce.unita ?? ""}
                  maxLength={LIMITI.unita}
                  placeholder="unità"
                  onChange={(e) => cambia(i, { unita: e.target.value })}
                  aria-label={`Unità della voce ${i + 1}`}
                />
              )}
              <span className="voce__azioni">
                <button type="button" onClick={() => sposta(i, -1)} disabled={i === 0} aria-label={`Sposta su: ${voce.nome}`}>
                  <ChevronUp size={18} />
                </button>
                <button type="button" onClick={() => sposta(i, 1)} disabled={i === voci.length - 1} aria-label={`Sposta giù: ${voce.nome}`}>
                  <ChevronDown size={18} />
                </button>
                <button type="button" onClick={() => togli(i)} disabled={!puoTogliere(voce)} aria-label={`Togli: ${voce.nome}`}>
                  <X size={18} />
                </button>
              </span>
              {vuoto && <span className="voce__errore">Scrivi un nome</span>}
            </li>
          );
        })}
      </ol>

      <div className="aggiungi">
        <span className="aggiungi__testo">Aggiungi una voce:</span>
        {TIPI.map((tipo) => (
          <button key={tipo} type="button" className="aggiungi__tipo" onClick={() => aggiungi(tipo)} disabled={!puoAggiungere(tipo)}>
            <Plus size={14} aria-hidden="true" /> {ETICHETTE_TIPI[tipo]}
          </button>
        ))}
      </div>
      <ul className="tipi-spiegati">
        {TIPI.map((tipo) => (
          <li key={tipo}>
            <b>{ETICHETTE_TIPI[tipo]}</b>: {SPIEGAZIONI[tipo]}
          </li>
        ))}
      </ul>
    </div>
  );
}
