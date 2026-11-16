import { Check, LoaderCircle, Share2 } from "lucide-react";
import { formatOre } from "../lib/ore.js";

/** statoCondivisione: "fermo" | "in corso" | "fatto" */
export default function BarraFondo({ totali, statoCondivisione, onCondividi }) {
  return (
    <footer className="barra">
      <div className="barra__totali">
        <b>{formatOre(totali.oreLav)}</b> h · <b>{formatOre(totali.viaggio)}</b> h viaggio
      </div>
      <button
        type="button"
        className={`pulsante-condividi${statoCondivisione === "fatto" ? " pulsante-condividi--fatto" : ""}`}
        onClick={onCondividi}
        disabled={statoCondivisione === "in corso"}
      >
        {statoCondivisione === "in corso" ? (
          <>
            <LoaderCircle size={16} className="gira" /> Creazione…
          </>
        ) : statoCondivisione === "fatto" ? (
          <>
            <Check size={16} /> Fatto
          </>
        ) : (
          <>
            <Share2 size={16} /> Condividi Excel
          </>
        )}
      </button>
    </footer>
  );
}
