import { X } from "lucide-react";
import { nomeConosciuto, suggerimenti } from "../lib/luoghi.js";

/** Esegue `azione` subito dopo il prossimo rilascio di dito o mouse (dopo il clic), al massimo entro 1 s. */
function dopoIlRilascio(azione) {
  let fatto = false;
  const esegui = () => {
    if (fatto) return;
    fatto = true;
    clearTimeout(riserva);
    document.removeEventListener("pointerup", rilascio, true);
    azione();
  };
  const rilascio = () => setTimeout(esegui, 0);
  const riserva = setTimeout(esegui, 1000);
  document.addEventListener("pointerup", rilascio, { capture: true, once: true });
}

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
    const salva = () => {
      if (nome !== valore) onCambia(nome);
      if (nome) luoghi.usa(nome);
    };
    // Se il fuoco passa a un pulsante (es. una casella), il dito o il mouse è ancora premuto:
    // salvare subito farebbe comparire i suggerimenti, che spostano il pulsante prima del
    // rilascio, e il tocco andrebbe perso. Si salva dopo il rilascio (o comunque entro 1 s).
    if (e.relatedTarget?.tagName === "BUTTON") dopoIlRilascio(salva);
    else salva();
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
