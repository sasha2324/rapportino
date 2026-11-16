import { TriangleAlert } from "lucide-react";
import AggiornaModulo from "./AggiornaModulo.jsx";

/**
 * Quando non c'è un modulo da usare: link non valido (con il dettaglio del problema)
 * oppure app aperta senza link. Il dettaglio è testo, mai HTML.
 */
export default function SchermataErrore({ errore, onAggiorna }) {
  const link = errore?.tipo === "link";
  return (
    <main className="schermata-errore">
      <TriangleAlert size={36} aria-hidden="true" className="schermata-errore__icona" />
      <h1>{link ? "Questo link non funziona" : "Il modulo non è ancora configurato"}</h1>
      <p>
        {link
          ? "È incompleto o è stato modificato. Chiedi al titolare di mandartelo di nuovo."
          : "Apri il link che ti ha mandato il titolare, oppure incollalo qui sotto."}
      </p>
      {link && errore.dettaglio && <p className="schermata-errore__dettaglio">Dettaglio: {errore.dettaglio}</p>}
      <AggiornaModulo onAggiorna={onAggiorna} testoPulsante="Incolla il link del titolare" />
      <p className="schermata-errore__piede">
        <a href="/">Cos'è Rapportino</a>
      </p>
    </main>
  );
}
