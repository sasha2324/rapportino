import { Building2, Car, Check, ChevronRight, MapPin, TriangleAlert } from "lucide-react";
import CampoCantiere from "./CampoCantiere.jsx";
import { ICONE_CASELLE } from "./icone.js";
import { isWeekend, nomeGiorno } from "../lib/calendario.js";
import { CAMPI_ORE, CASELLE } from "../lib/giorno.js";
import { formatOre, leggiOre } from "../lib/ore.js";
import { riassuntoGiorno } from "../lib/riassunto.js";

const ETICHETTE_CASELLE = Object.fromEntries(CASELLE.map((c) => [c.key, c.label]));
const accorcia = (testo, max = 22) => (testo.length > max ? `${testo.slice(0, max)}…` : testo);

export default function Giorno({ anno, mese, numero, giorno, oggi, cantiereIeri, aperto, onApri, onAggiorna, cantieri, onDatiFattura }) {
  const r = riassuntoGiorno(giorno);
  const weekend = isWeekend(anno, mese, numero);
  const conOre = (r.ore ?? 0) + (r.viaggio ?? 0) > 0;
  const haDettagli = (r.viaggio ?? 0) > 0 || r.caselle.length > 0 || r.nota || r.daControllare;

  const classi = ["giorno", r.vuoto ? "" : "giorno--compilato", oggi ? "giorno--oggi" : ""].filter(Boolean).join(" ");
  const classiData = ["giorno__data", weekend ? "giorno__data--weekend" : "", oggi ? "giorno__data--oggi" : ""].filter(Boolean).join(" ");

  return (
    <section className={classi} id={`giorno-${numero}`}>
      <button type="button" className="giorno__riga" onClick={onApri} aria-expanded={aperto}>
        <span className={classiData}>
          <span className="giorno__numero">{numero}</span>
          <span className="giorno__settimana">{oggi ? "Oggi" : nomeGiorno(anno, mese, numero)}</span>
        </span>

        <span className="giorno__riassunto">
          {r.vuoto ? (
            <span className="giorno__vuoto">{oggi ? "Tocca per compilare" : "Nessun dato"}</span>
          ) : (
            <>
              {r.cantiere ? (
                <span className="giorno__cantiere">
                  <MapPin size={13} aria-hidden="true" /> {r.cantiere}
                </span>
              ) : (
                conOre && <span className="giorno__cantiere giorno__cantiere--manca">Cantiere non indicato</span>
              )}
              {haDettagli && (
                <span className="giorno__dettagli">
                  {(r.viaggio ?? 0) > 0 && (
                    <span className="giorno__voce">
                      <Car size={14} aria-hidden="true" /> {formatOre(r.viaggio)} h
                    </span>
                  )}
                  {r.caselle.map((k) => {
                    const Icona = ICONE_CASELLE[k];
                    return <Icona key={k} size={14} role="img" aria-label={ETICHETTE_CASELLE[k]} />;
                  })}
                  {r.nota && <span className="giorno__nota">{accorcia(r.nota)}</span>}
                  {r.daControllare && (
                    <span className="giorno__avviso">
                      <TriangleAlert size={13} aria-hidden="true" /> Ore da controllare
                    </span>
                  )}
                </span>
              )}
            </>
          )}
        </span>

        {r.ore !== null && (
          <span className="giorno__ore">
            {formatOre(r.ore)}
            <small> h</small>
          </span>
        )}
        <ChevronRight size={18} className={`giorno__freccia${aperto ? " giorno__freccia--aperta" : ""}`} />
      </button>

      {aperto && (
        <div className="giorno__dettaglio">
          <CampoCantiere
            valore={giorno.cantiere}
            cantiereIeri={cantiereIeri}
            onCambia={(v) => onAggiorna("cantiere", v)}
            cantieri={cantieri}
          />

          <div className="griglia-2">
            {CAMPI_ORE.map((f) => {
              const errore = leggiOre(giorno[f.key]).stato === "non valido";
              return (
                <label key={f.key}>
                  <span className="etichetta">{f.label}</span>
                  <span className={`campo${errore ? " campo--errore" : ""}`}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={giorno[f.key]}
                      onChange={(e) => onAggiorna(f.key, e.target.value)}
                      placeholder="0"
                      aria-invalid={errore}
                    />
                    <span className="campo__unita">h</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="griglia-2 caselle">
            {CASELLE.map((c) => {
              const attiva = Boolean(giorno[c.key]);
              const Icona = ICONE_CASELLE[c.key];
              return (
                <button
                  key={c.key}
                  type="button"
                  className={`casella${attiva ? " casella--attiva" : ""}`}
                  onClick={() => onAggiorna(c.key, !attiva)}
                  aria-pressed={attiva}
                >
                  <span className="casella__testo">
                    <Icona size={17} aria-hidden="true" className="casella__icona" />
                    <span className="casella__etichetta">{c.label}</span>
                  </span>
                  <span className="casella__quadrato">{attiva && <Check size={14} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="giorno__link-fattura" onClick={onDatiFattura}>
            <Building2 size={16} aria-hidden="true" /> Dati dell'azienda per la fattura
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          <label>
            <span className="etichetta">Note sul lavoro svolto</span>
            <textarea
              className="nota"
              rows={2}
              value={giorno.note}
              onChange={(e) => onAggiorna("note", e.target.value)}
              placeholder="Breve descrizione del lavoro…"
            />
          </label>
        </div>
      )}
    </section>
  );
}
