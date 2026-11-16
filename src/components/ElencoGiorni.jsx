import Giorno from "./Giorno.jsx";
import { giorniNelMese } from "../lib/calendario.js";
import { leggiGiorno, valoreVoce } from "../lib/giorno.js";

export default function ElencoGiorni({ anno, mese, entries, voci, oggi, giornoAperto, onApri, onAggiorna, luoghi, onDatiFattura }) {
  const numGiorni = giorniNelMese(anno, mese);
  const voceLuogo = voci.find((v) => v.tipo === "luogo");
  return (
    <main className="elenco">
      {Array.from({ length: numGiorni }, (_, i) => i + 1).map((d) => (
        <Giorno
          key={d}
          anno={anno}
          mese={mese}
          numero={d}
          giorno={leggiGiorno(entries, d)}
          voci={voci}
          oggi={oggi === d}
          luogoIeri={voceLuogo && d > 1 ? valoreVoce(leggiGiorno(entries, d - 1), voceLuogo) : ""}
          aperto={giornoAperto === d}
          onApri={() => onApri(giornoAperto === d ? null : d)}
          onAggiorna={(campo, valore) => onAggiorna(d, campo, valore)}
          luoghi={luoghi}
          onDatiFattura={onDatiFattura}
        />
      ))}
    </main>
  );
}
