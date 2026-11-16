import { Check, LoaderCircle, Share2 } from "lucide-react";
import { formatOre } from "../lib/ore.js";

/**
 * Totali del mese delle prime due voci di tipo ore, e il pulsante per l'Excel.
 * statoCondivisione: "fermo" | "in corso" | "fatto"
 */
export default function BarraFondo({ totali, voci, statoCondivisione, onCondividi }) {
  const [prima, seconda] = voci.filter((v) => v.tipo === "ore");
  return (
    <footer className="barra">
      <div className="barra__totali">
        {prima && (
          <>
            <b>{formatOre(totali[prima.id] ?? 0)}</b> h
          </>
        )}
        {seconda && (
          <>
            {" · "}
            <b>{formatOre(totali[seconda.id] ?? 0)}</b> h {seconda.nome.toLocaleLowerCase("it")}
          </>
        )}
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
