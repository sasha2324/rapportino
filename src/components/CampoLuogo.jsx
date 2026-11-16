import { X } from "lucide-react";
import { nomeConosciuto, suggerimenti } from "../lib/luoghi.js";

/**
 * Campo della voce di tipo luogo (Cantiere, Cliente, Sede… lo decide il titolare),
 * con i luoghi già usati come pulsanti.
 * luoghi: { elenco, usa, rimuovi } da useLuoghi.
 * I pulsanti usano onMouseDown preventDefault: toccarli non toglie il fuoco al campo,
 * così un nome scritto a metà non viene salvato come luogo nuovo.
 */
export default function CampoLuogo({ etichetta, valore, luogoIeri, onCambia, luoghi }) {
  const conosciuto = nomeConosciuto(luoghi.elenco, valore);
  const lista = suggerimenti(luoghi.elenco, { testo: conosciuto ? "" : valore, luogoIeri });

  const scegli = (nome) => {
    onCambia(nome);
    luoghi.usa(nome);
  };

  const conferma = (e) => {
    if (e.relatedTarget?.closest?.(".luogo__suggerimenti")) return;
    const pulito = valore.trim();
    const nome = nomeConosciuto(luoghi.elenco, pulito) ?? pulito;
    if (nome !== valore) onCambia(nome);
    if (nome) luoghi.usa(nome);
  };

  const tieniFuoco = (e) => e.preventDefault();

  return (
    <div className="luogo">
      <label>
        <span className="etichetta">{etichetta}</span>
        <span className="campo">
          <input
            type="text"
            value={valore}
            onChange={(e) => onCambia(e.target.value)}
            onBlur={conferma}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            placeholder="Scrivi o scegli qui sotto"
            autoComplete="off"
            enterKeyHint="done"
          />
        </span>
      </label>
      {lista.length > 0 && (
        <div className="luogo__suggerimenti">
          {lista.map((nome) => (
            <span key={nome} className={`suggerimento${nome === conosciuto ? " suggerimento--scelto" : ""}`}>
              <button type="button" className="suggerimento__nome" onMouseDown={tieniFuoco} onClick={() => scegli(nome)}>
                {nome}
              </button>
              <button
                type="button"
                className="suggerimento__togli"
                onMouseDown={tieniFuoco}
                onClick={() => luoghi.rimuovi(nome)}
                aria-label={`Togli ${nome} dai suggerimenti`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
