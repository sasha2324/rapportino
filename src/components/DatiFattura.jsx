import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { AZIENDA, testoAzienda } from "../lib/azienda.js";

/**
 * Foglio con i dati dell'azienda per la fattura: si mostra alla cassa,
 * si copia una voce alla volta o si mandano tutti i dati (es. su WhatsApp).
 */
export default function DatiFattura({ onChiudi }) {
  const [copiato, setCopiato] = useState(null);
  const chiudiRef = useRef(null);
  const onChiudiRef = useRef(onChiudi);
  onChiudiRef.current = onChiudi;

  useEffect(() => {
    chiudiRef.current?.focus();
    const suTasto = (e) => e.key === "Escape" && onChiudiRef.current();
    window.addEventListener("keydown", suTasto);
    return () => window.removeEventListener("keydown", suTasto);
  }, []);

  const copia = async (chiave, testo) => {
    try {
      await navigator.clipboard.writeText(testo);
      setCopiato(chiave);
      setTimeout(() => setCopiato((c) => (c === chiave ? null : c)), 1500);
    } catch {
      // Senza appunti i dati restano comunque leggibili sullo schermo.
    }
  };

  const inviaTutto = async () => {
    const testo = testoAzienda();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Dati per la fattura", text: testo });
      } catch {
        // Annullato dall'utente: niente da fare.
      }
    } else {
      copia("tutto", testo);
    }
  };

  return (
    <div className="foglio-sfondo" onClick={onChiudi}>
      <div
        className="foglio"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titolo-dati-fattura"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="foglio__testa">
          <h2 id="titolo-dati-fattura">Dati per la fattura</h2>
          <button ref={chiudiRef} type="button" className="foglio__chiudi" onClick={onChiudi} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>
        <p className="foglio__aiuto">Mostra questa schermata alla cassa, oppure copia i dati che ti chiedono.</p>

        <dl className="dati-azienda">
          {AZIENDA.map((r) => (
            <div key={r.chiave} className="dati-azienda__riga">
              <div>
                <dt>{r.etichetta}</dt>
                <dd>{r.valore}</dd>
              </div>
              <button
                type="button"
                className={`pulsante-copia${copiato === r.chiave ? " pulsante-copia--fatto" : ""}`}
                onClick={() => copia(r.chiave, r.valore)}
                aria-label={`Copia ${r.etichetta}`}
              >
                {copiato === r.chiave ? <Check size={15} /> : <Copy size={15} />}
                {copiato === r.chiave ? "Copiato" : "Copia"}
              </button>
            </div>
          ))}
        </dl>

        <button type="button" className="pulsante-primario foglio__invia" onClick={inviaTutto}>
          {copiato === "tutto" ? <Check size={18} /> : <Share2 size={18} />}
          {copiato === "tutto" ? "Dati copiati" : "Invia tutti i dati"}
        </button>
      </div>
    </div>
  );
}
