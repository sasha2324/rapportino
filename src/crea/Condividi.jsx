import { useMemo, useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { matriceQR, percorsoQR, pngQR } from "./qr.js";
import { scaricaFile } from "../lib/share.js";

/** Link e QR code da mandare ai dipendenti. Senza link (modulo non valido) spiega cosa manca. */
export default function Condividi({ link, errore }) {
  const [copiato, setCopiato] = useState(false);
  const matrice = useMemo(() => (link ? matriceQR(link) : null), [link]);

  if (!link) {
    return (
      <p className="condividi__errore" role="alert">
        Il modulo non è ancora pronto: {errore}
      </p>
    );
  }

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 1800);
    } catch {
      // Senza appunti il link resta nel riquadro, da copiare a mano.
    }
  };

  const condividi = async () => {
    try {
      await navigator.share({ title: "Rapportino", text: "Il modulo per segnare le ore: apri il link e installa l'app.", url: link });
    } catch {
      // Annullato: niente da fare.
    }
  };

  const scaricaQR = async () => {
    const blob = await pngQR(matrice);
    scaricaFile(new File([blob], "rapportino-qr.png", { type: "image/png" }));
  };

  return (
    <div className="condividi">
      {matrice ? (
        <svg
          className="qr"
          viewBox={`0 0 ${matrice.length} ${matrice.length}`}
          role="img"
          aria-label="QR code del link del modulo"
          shapeRendering="crispEdges"
        >
          <rect width={matrice.length} height={matrice.length} fill="#fff" />
          <path d={percorsoQR(matrice)} fill="#000" />
        </svg>
      ) : (
        <p className="condividi__nota">Il link è troppo lungo per un QR code: mandalo con «Copia link».</p>
      )}

      <label>
        <span className="etichetta">Link per i dipendenti</span>
        <textarea className="condividi__link" readOnly value={link} rows={3} onFocus={(e) => e.target.select()} />
      </label>

      <div className="condividi__azioni">
        <button type="button" className="pulsante-primario" onClick={copia}>
          {copiato ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copiato ? "Copiato" : "Copia link"}
        </button>
        {typeof navigator !== "undefined" && navigator.share && (
          <button type="button" className="pulsante-secondario" onClick={condividi}>
            <Share2 size={16} aria-hidden="true" /> Condividi
          </button>
        )}
        {matrice && (
          <button type="button" className="pulsante-secondario" onClick={scaricaQR}>
            <Download size={16} aria-hidden="true" /> Scarica QR
          </button>
        )}
      </div>

      <p className="condividi__nota">
        Il link contiene tutto il modulo. Se cambi qualcosa, manda il link nuovo: i giorni già segnati dai dipendenti
        restano. <a href={link} target="_blank" rel="noopener noreferrer">Prova il modulo</a>
      </p>
    </div>
  );
}
