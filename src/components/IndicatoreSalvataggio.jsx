import { Check, LoaderCircle, TriangleAlert } from "lucide-react";

export default function IndicatoreSalvataggio({ stato }) {
  return (
    <div className="salvataggio" role="status" aria-live="polite">
      {stato === "salvataggio" && (
        <span>
          <LoaderCircle size={12} className="gira" /> Salvataggio…
        </span>
      )}
      {stato === "salvato" && (
        <span className="salvataggio--salvato">
          <Check size={13} /> Salvato
        </span>
      )}
      {stato === "errore" && (
        <span className="salvataggio--errore">
          <TriangleAlert size={13} /> Non salvato
        </span>
      )}
    </div>
  );
}
