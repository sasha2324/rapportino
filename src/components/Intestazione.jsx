import { Building2 } from "lucide-react";

/** In alto: nome dell'azienda (o dell'app), nome del dipendente, e i dati per la fattura se ci sono. */
export default function Intestazione({ titolo, nome, onCambiaNome, modificaNome, onModificaNome, onDatiFattura }) {
  const nomePulito = nome.trim();
  return (
    <header className="intestazione">
      <p className="intestazione__app">{titolo}</p>
      {modificaNome ? (
        <input
          className="intestazione__campo-nome"
          autoFocus
          value={nome}
          onChange={(e) => onCambiaNome(e.target.value)}
          onBlur={() => onModificaNome(false)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="Nome e cognome"
          autoComplete="name"
          enterKeyHint="done"
        />
      ) : (
        <button
          type="button"
          className={`intestazione__nome${nomePulito ? "" : " intestazione__nome--vuoto"}`}
          onClick={() => onModificaNome(true)}
        >
          {nomePulito || "Tocca per inserire il nome"}
        </button>
      )}
      {onDatiFattura && (
        <button type="button" className="intestazione__fattura" onClick={onDatiFattura}>
          <Building2 size={16} aria-hidden="true" /> Dati per la fattura
        </button>
      )}
    </header>
  );
}
