# Rapportino

Registro ore per i dipendenti, generale: ogni azienda sceglie le proprie voci.
Tre pagine (`/`, `/crea/`, `/app/#…`), configurazione nel link, dati nel telefono.
Avvio e comandi: README.md. Progetto: `docs/superpowers/specs/2026-11-16-rapportino-configurazione-design.md`.

## Regole

- Repository **privato** finché Sasha non l'ha controllato e decide di renderlo pubblico.
- Nessun dato di aziende o persone reali, né nel codice né nei test né negli esempi:
  solo valori chiaramente finti («Azienda di esempio S.r.l.», `example.com`, `12345678903`,
  «Mario Rossi»). Prima di ogni commit cercare tracce di dati veri.
- Spiegare in breve le scelte importanti prima di farle; piccoli passi, commit chiari in italiano.
- Test per la logica (lib/, hooks/) scritti prima del codice.
- Chiedere prima di installare pacchetti nuovi.
- Testi dell'app in italiano.

## Sicurezza del link

- Il link è un dato non fidato: si legge solo con `decodifica` (link.js), che passa sempre
  da `validaConfigurazione` (configurazione.js). Nuove chiavi o tipi vanno aggiunti lì, con i test.
- I testi della configurazione si mostrano solo come testo: mai `innerHTML` né
  `dangerouslySetInnerHTML`; nell'Excel restano celle di testo.
- L'`id` di una voce non cambia mai dopo la creazione: è la chiave dei dati salvati.
- Content-Security-Policy in `public/_headers`: niente script, stili o font esterni.
