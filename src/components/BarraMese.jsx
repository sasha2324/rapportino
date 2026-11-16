import { ChevronLeft, ChevronRight } from "lucide-react";
import { MESI } from "../lib/calendario.js";

/** Striscia rossa con il mese: resta attaccata in alto mentre si scorre l'elenco dei giorni. */
export default function BarraMese({ anno, mese, onCambiaMese }) {
  return (
    <nav className="barra-mese" aria-label="Mese">
      <button type="button" className="pulsante-mese" onClick={() => onCambiaMese(-1)} aria-label="Mese precedente">
        <ChevronLeft size={22} />
      </button>
      <div className="barra-mese__mese" aria-live="polite">
        {MESI[mese]} {anno}
      </div>
      <button type="button" className="pulsante-mese" onClick={() => onCambiaMese(1)} aria-label="Mese successivo">
        <ChevronRight size={22} />
      </button>
    </nav>
  );
}
