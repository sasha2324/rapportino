import { useState } from "react";
import Giorno from "../components/Giorno.jsx";
import { intestazioni } from "../lib/colonne.js";
import { righeAzienda } from "../lib/configurazione.js";

const LUOGHI_PROVA = { elenco: [], usa() {}, rimuovi() {} };

/**
 * Come vedrà il modulo il dipendente: lo stesso componente del giorno usato nell'app
 * (si può anche provare a compilarlo), e sotto le colonne dell'Excel.
 */
export default function Anteprima({ config }) {
  const [giorno, setGiorno] = useState({});
  const [aperto, setAperto] = useState(true);
  const oggi = new Date();
  const conDati = righeAzienda(config.azienda).length > 0;

  return (
    <div className="anteprima">
      <div className="telefono" aria-label="Anteprima del modulo sul telefono del dipendente">
        <div className="telefono__schermo">
          <header className="intestazione">
            <p className="intestazione__app">{config.azienda?.nome || "Rapportino"}</p>
            <p className="intestazione__nome intestazione__nome--prova">Mario Rossi</p>
          </header>
          <Giorno
            anno={oggi.getFullYear()}
            mese={oggi.getMonth()}
            numero={oggi.getDate()}
            giorno={giorno}
            voci={config.voci}
            oggi
            luogoIeri=""
            aperto={aperto}
            onApri={() => setAperto((a) => !a)}
            onAggiorna={(id, valore) => setGiorno((g) => ({ ...g, [id]: valore }))}
            luoghi={LUOGHI_PROVA}
            onDatiFattura={conDati ? () => {} : undefined}
          />
        </div>
      </div>
      <p className="anteprima__titoletto">Colonne dell'Excel</p>
      <ol className="colonne">
        {intestazioni(config.voci).map((nome, i) => (
          <li key={i}>{nome}</li>
        ))}
      </ol>
    </div>
  );
}
