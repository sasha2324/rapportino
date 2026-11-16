import { X } from "lucide-react";
import { nomeConosciuto, suggerimenti } from "../lib/cantieri.js";

/**
 * cantieri: { elenco, usa, rimuovi } da useCantieri.
 * I pulsanti usano onMouseDown preventDefault: toccarli non toglie il fuoco al campo,
 * così un nome scritto a metà non viene salvato come cantiere nuovo.
 */
export default function CampoCantiere({ valore, cantiereIeri, onCambia, cantieri }) {
  const conosciuto = nomeConosciuto(cantieri.elenco, valore);
  const lista = suggerimenti(cantieri.elenco, { testo: conosciuto ? "" : valore, cantiereIeri });

  const scegli = (nome) => {
    onCambia(nome);
    cantieri.usa(nome);
  };

  const conferma = (e) => {
    if (e.relatedTarget?.closest?.(".cantiere__suggerimenti")) return;
    const pulito = valore.trim();
    const nome = nomeConosciuto(cantieri.elenco, pulito) ?? pulito;
    if (nome !== valore) onCambia(nome);
    if (nome) cantieri.usa(nome);
  };

  const tieniFuoco = (e) => e.preventDefault();

  return (
    <div className="cantiere">
      <label>
        <span className="etichetta">Cantiere</span>
        <span className="campo">
          <input
            type="text"
            value={valore}
            onChange={(e) => onCambia(e.target.value)}
            onBlur={conferma}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            placeholder="Es. Via Roma 12 – Rossi"
            autoComplete="off"
            enterKeyHint="done"
          />
        </span>
      </label>
      {lista.length > 0 && (
        <div className="cantiere__suggerimenti">
          {lista.map((nome) => (
            <span key={nome} className={`suggerimento${nome === conosciuto ? " suggerimento--scelto" : ""}`}>
              <button type="button" className="suggerimento__nome" onMouseDown={tieniFuoco} onClick={() => scegli(nome)}>
                {nome}
              </button>
              <button
                type="button"
                className="suggerimento__togli"
                onMouseDown={tieniFuoco}
                onClick={() => cantieri.rimuovi(nome)}
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
