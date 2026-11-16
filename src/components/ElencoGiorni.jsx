import Giorno from "./Giorno.jsx";
import { giorniNelMese } from "../lib/calendario.js";
import { leggiGiorno } from "../lib/giorno.js";

export default function ElencoGiorni({ anno, mese, entries, oggi, giornoAperto, onApri, onAggiorna, cantieri, onDatiFattura }) {
  const numGiorni = giorniNelMese(anno, mese);
  return (
    <main className="elenco">
      {Array.from({ length: numGiorni }, (_, i) => i + 1).map((d) => (
        <Giorno
          key={d}
          anno={anno}
          mese={mese}
          numero={d}
          giorno={leggiGiorno(entries, d)}
          oggi={oggi === d}
          cantiereIeri={d > 1 ? leggiGiorno(entries, d - 1).cantiere : ""}
          aperto={giornoAperto === d}
          onApri={() => onApri(giornoAperto === d ? null : d)}
          onAggiorna={(campo, valore) => onAggiorna(d, campo, valore)}
          cantieri={cantieri}
          onDatiFattura={onDatiFattura}
        />
      ))}
    </main>
  );
}
