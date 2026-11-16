import { CAMPI_AZIENDA, controllaCampoAzienda } from "../lib/configurazione.js";

const TASTIERA = { piva: "numeric", tel: "tel", email: "email" };
const COMPLETAMENTO = { nome: "organization", sede: "street-address", email: "email", tel: "tel" };

/** Dati dell'azienda per la fattura: tutti facoltativi, controllati mentre si scrive. */
export default function DatiAzienda({ azienda, onCambia }) {
  return (
    <div className="campi-azienda">
      {CAMPI_AZIENDA.map((c) => {
        const errore = controllaCampoAzienda(c.chiave, azienda[c.chiave]);
        const idErrore = `errore-${c.chiave}`;
        return (
          <label key={c.chiave} className={c.chiave === "nome" || c.chiave === "sede" ? "campi-azienda__largo" : ""}>
            <span className="etichetta">{c.etichetta}</span>
            <span className={`campo${errore ? " campo--errore" : ""}`}>
              <input
                value={azienda[c.chiave]}
                maxLength={c.max}
                inputMode={TASTIERA[c.chiave]}
                autoComplete={COMPLETAMENTO[c.chiave] ?? "off"}
                onChange={(e) => onCambia({ ...azienda, [c.chiave]: e.target.value })}
                aria-invalid={Boolean(errore)}
                aria-describedby={errore ? idErrore : undefined}
              />
            </span>
            {errore && (
              <span className="campo__errore" id={idErrore}>
                {errore}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
