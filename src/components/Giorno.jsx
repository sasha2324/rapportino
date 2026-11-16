import { Building2, Check, ChevronRight, MapPin, TriangleAlert } from "lucide-react";
import CampoLuogo from "./CampoLuogo.jsx";
import { isWeekend, nomeGiorno } from "../lib/calendario.js";
import { valoreVoce } from "../lib/giorno.js";
import { formatOre, leggiNumero, leggiOre } from "../lib/ore.js";
import { riassuntoGiorno } from "../lib/riassunto.js";

const accorcia = (testo, max = 22) => (testo.length > max ? `${testo.slice(0, max)}…` : testo);

/** Voci vicine dello stesso genere stanno insieme su due colonne: campi numerici, caselle sì/no. */
function gruppi(voci) {
  const genere = (v) => (v.tipo === "ore" || v.tipo === "numero" ? "numeri" : v.tipo === "si_no" ? "caselle" : v.tipo);
  const risultato = [];
  for (const voce of voci) {
    const g = genere(voce);
    const ultimo = risultato.at(-1);
    if (ultimo && ultimo.genere === g && (g === "numeri" || g === "caselle")) ultimo.voci.push(voce);
    else risultato.push({ genere: g, voci: [voce] });
  }
  return risultato;
}

function CampoNumero({ voce, valore, onCambia }) {
  const leggi = voce.tipo === "ore" ? leggiOre : leggiNumero;
  const errore = leggi(valore).stato === "non valido";
  const unita = voce.tipo === "ore" ? "h" : voce.unita;
  return (
    <label>
      <span className="etichetta">{voce.nome}</span>
      <span className={`campo${errore ? " campo--errore" : ""}`}>
        <input
          type="text"
          inputMode="decimal"
          value={valore}
          onChange={(e) => onCambia(e.target.value)}
          placeholder="0"
          aria-invalid={errore}
        />
        {unita && <span className="campo__unita">{unita}</span>}
      </span>
    </label>
  );
}

function Casella({ voce, attiva, onCambia }) {
  return (
    <button type="button" className={`casella${attiva ? " casella--attiva" : ""}`} onClick={() => onCambia(!attiva)} aria-pressed={attiva}>
      <span className="casella__etichetta">{voce.nome}</span>
      <span className="casella__quadrato">{attiva && <Check size={14} strokeWidth={3} />}</span>
    </button>
  );
}

/**
 * Un giorno del mese: riga chiusa con il riassunto, e il dettaglio con le voci del modulo.
 * Ogni testo (nomi delle voci, luoghi, note) è mostrato come testo da React, mai come HTML.
 */
export default function Giorno({ anno, mese, numero, giorno, voci, oggi, luogoIeri, aperto, onApri, onAggiorna, luoghi, onDatiFattura }) {
  const r = riassuntoGiorno(giorno, voci);
  const weekend = isWeekend(anno, mese, numero);
  const [principale, ...altreOre] = r.ore;
  const voceLuogo = voci.find((v) => v.tipo === "luogo");
  const conOre = r.ore.some((o) => (o.valore ?? 0) > 0);
  const altreConValore = altreOre.filter((o) => (o.valore ?? 0) > 0);
  const numeriConValore = r.numeri.filter((n) => n.valore !== null);
  const haDettagli = altreConValore.length > 0 || numeriConValore.length > 0 || r.caselle.length > 0 || r.nota || r.daControllare;

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
              {r.luogo ? (
                <span className="giorno__luogo">
                  <MapPin size={13} aria-hidden="true" /> {r.luogo}
                </span>
              ) : (
                voceLuogo && conOre && <span className="giorno__luogo giorno__luogo--manca">{voceLuogo.nome}: non indicato</span>
              )}
              {haDettagli && (
                <span className="giorno__dettagli">
                  {altreConValore.map((o) => (
                    <span key={o.id} className="giorno__voce">
                      {o.nome} {formatOre(o.valore)} h
                    </span>
                  ))}
                  {numeriConValore.map((n) => (
                    <span key={n.id} className="giorno__voce">
                      {n.unita ? `${formatOre(n.valore)} ${n.unita}` : `${n.nome} ${formatOre(n.valore)}`}
                    </span>
                  ))}
                  {r.caselle.length > 0 && <span className="giorno__voce">{r.caselle.map((c) => c.nome).join(" · ")}</span>}
                  {r.nota && <span className="giorno__nota">{accorcia(r.nota)}</span>}
                  {r.daControllare && (
                    <span className="giorno__avviso">
                      <TriangleAlert size={13} aria-hidden="true" /> Da controllare
                    </span>
                  )}
                </span>
              )}
            </>
          )}
        </span>

        {principale && principale.valore !== null && (
          <span className="giorno__ore">
            {formatOre(principale.valore)}
            <small> h</small>
          </span>
        )}
        <ChevronRight size={18} className={`giorno__freccia${aperto ? " giorno__freccia--aperta" : ""}`} />
      </button>

      {aperto && (
        <div className="giorno__dettaglio">
          {gruppi(voci).map((gruppo) => {
            const chiave = gruppo.voci.map((v) => v.id).join("+");
            if (gruppo.genere === "luogo") {
              const voce = gruppo.voci[0];
              return (
                <CampoLuogo
                  key={chiave}
                  etichetta={voce.nome}
                  valore={valoreVoce(giorno, voce)}
                  luogoIeri={luogoIeri}
                  onCambia={(v) => onAggiorna(voce.id, v)}
                  luoghi={luoghi}
                />
              );
            }
            if (gruppo.genere === "note") {
              const voce = gruppo.voci[0];
              return (
                <label key={chiave}>
                  <span className="etichetta">{voce.nome}</span>
                  <textarea
                    className="nota"
                    rows={2}
                    value={valoreVoce(giorno, voce)}
                    onChange={(e) => onAggiorna(voce.id, e.target.value)}
                  />
                </label>
              );
            }
            if (gruppo.genere === "caselle") {
              return (
                <div key={chiave} className="griglia-2 caselle">
                  {gruppo.voci.map((voce) => (
                    <Casella key={voce.id} voce={voce} attiva={valoreVoce(giorno, voce)} onCambia={(v) => onAggiorna(voce.id, v)} />
                  ))}
                </div>
              );
            }
            return (
              <div key={chiave} className="griglia-2">
                {gruppo.voci.map((voce) => (
                  <CampoNumero key={voce.id} voce={voce} valore={valoreVoce(giorno, voce)} onCambia={(v) => onAggiorna(voce.id, v)} />
                ))}
              </div>
            );
          })}

          {onDatiFattura && (
            <button type="button" className="giorno__link-fattura" onClick={onDatiFattura}>
              <Building2 size={16} aria-hidden="true" /> Dati dell'azienda per la fattura
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
