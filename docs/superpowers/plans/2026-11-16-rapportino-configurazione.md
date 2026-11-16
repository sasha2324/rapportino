# Rapportino — configurazione nel link: piano di lavoro

> Esecuzione: in questa sessione, un compito alla volta (superpowers:executing-plans), test
> prima del codice per tutta la logica, un commit per compito.

**Obiettivo:** registro ore guidato da una configurazione nel link (`/app/#…`), pagina del
titolare `/crea/` con anteprima, link e QR, pagina iniziale `/`.

**Architettura:** la logica sta in moduli puri in `src/lib/` (configurazione, link, modelli,
scelta all'avvio, giorno, ore, luoghi, Excel, manifest), testati con Vitest. I componenti React
ricevono le `voci` della configurazione e non conoscono più campi fissi. Build Vite con tre
pagine HTML; la PWA ha scope `/app/` e manifest creato al volo.

**Tecnologie:** React 19, Vite 8, vite-plugin-pwa, idb-keyval, SheetJS, Vitest, `uqr` (QR).

Progetto approvato: `docs/superpowers/specs/2026-11-16-rapportino-configurazione-design.md`.

---

## Mappa dei file

| File | Responsabilità |
|---|---|
| `src/lib/configurazione.js` (nuovo) | `TIPI`, `LIMITI`, `validaConfigurazione(dato)`, `controllaCampoAzienda(chiave, valore)`, `idDaNome(nome, usati)`, `righeAzienda(azienda)`, `nomeVoceVuota(tipo)` |
| `src/lib/link.js` (nuovo) | `codifica(config)`, `decodifica(testo)`, `linkApp(config, origine)`, `testoDaLink(testo)` (accetta link intero o solo la parte dopo `#`) |
| `src/lib/modelli.js` (nuovo) | `MODELLI` (4 modelli), `configDaModello(id, ts)` |
| `src/lib/avvio.js` (nuovo) | `scegliConfigurazione({ dalLink, salvata })` |
| `src/lib/manifest.js` (nuovo) | `creaManifest({ config, indirizzo, origine })` |
| `src/lib/azienda.js` | resta `partitaIvaValida`; `testoAzienda(azienda)` |
| `src/lib/giorno.js` | `valoreVoce(giorno, voce)`, `isGiornoVuoto(giorno, voci)`, `leggiGiorno(entries, numero)` |
| `src/lib/ore.js` | `leggiOre`, `leggiNumero`, `formatOre`, `totaliMese(entries, numGiorni, voci)`, `totaliPerLuogo(entries, numGiorni, voci)` |
| `src/lib/riassunto.js` | `riassuntoGiorno(giorno, voci)` |
| `src/lib/luoghi.js` (da `cantieri.js`) | suggerimenti dei luoghi già usati |
| `src/lib/excel.js` | `intestazioni(voci)`, `righeExcel({ config, nomeDipendente, anno, mese, entries })`, `nomeFileExcel`, `creaFileExcel` |
| `src/lib/storage.js` | in più `caricaConfigurazione` / `salvaConfigurazione`; `luoghi` al posto di `cantieri` |
| `src/hooks/useConfigurazione.js` (nuovo) | legge `#` e memoria, applica `scegliConfigurazione`, salva, espone `aggiornaDaLink(testo)` |
| `src/hooks/useLuoghi.js` (da `useCantieri.js`) | — |
| `src/components/Giorno.jsx`, `CampoLuogo.jsx` (da `CampoCantiere.jsx`), `ElencoGiorni.jsx`, `BarraFondo.jsx`, `Intestazione.jsx`, `DatiFattura.jsx` | ricevono `voci` / `azienda` |
| `src/components/SchermataErrore.jsx`, `AggiornaModulo.jsx` (nuovi) | link non valido o mancante; «Incolla il link aggiornato» |
| `src/App.jsx`, `src/main.jsx` | app del dipendente, manifest al volo |
| `app/index.html` (da `index.html`) | pagina dell'app |
| `index.html`, `src/sito.css` | pagina iniziale statica |
| `crea/index.html`, `src/crea/main.jsx`, `src/crea/Crea.jsx`, `src/crea/EditorVoci.jsx`, `src/crea/DatiAzienda.jsx`, `src/crea/Anteprima.jsx`, `src/crea/Condividi.jsx`, `src/crea/qr.js` | pagina del titolare |
| `vite.config.js`, `public/_headers` | tre pagine, PWA con scope `/app/`, Content-Security-Policy |

## Compiti

### 1. Configurazione: controlli (`src/lib/configurazione.js`)
Test prima (`configurazione.test.js`): configurazione valida → `{ ok: true, config }` (copia
pulita); ogni rifiuto dello spec → `{ ok: false, errore }` con il dettaglio in italiano:
radice non oggetto, chiave sconosciuta (radice, azienda, voce), `v` ≠ 1, `ts` non intero o fuori
intervallo, voci non array / 0 / 21, tipo sconosciuto, 0 o 4 voci `ore`, 2 `luogo`, 6 `numero`,
11 `si_no`, 2 `note`, `id` non valido o ripetuto, nome vuoto / 31 caratteri / con `\n` o
`\u0007`, `unita` su un tipo diverso da `numero` o di 9 caratteri, ogni campo azienda sbagliato
(P.IVA con cifra di controllo sbagliata, SDI di 6, email senza `@`, telefono con lettere,
nome di 81). Un nome `<img src=x onerror=alert(1)>` è valido (è solo testo).
`idDaNome("Ore lavorate", [])` → `ore-lavorate`; accenti tolti; doppioni → `-2`; inizia con
una lettera; massimo 20 caratteri.
Commit: «Configurazione: struttura e controlli».

### 2. Link (`src/lib/link.js`)
Test: andata e ritorno con accenti ed emoji; `decodifica` rifiuta testo > 3.000 caratteri,
caratteri fuori da base64url, UTF-8 non valido, JSON non valido, e passa per
`validaConfigurazione`; `linkApp(config, "https://x.dev")` → `https://x.dev/app/#…`;
`testoDaLink` accetta il link intero, solo il `#…` o solo il codice.
Commit: «Link: configurazione in base64url dopo il #».

### 3. Modelli (`src/lib/modelli.js`)
Test: i 4 modelli producono configurazioni valide, con le voci dello spec nell'ordine.
Commit: «Modelli pronti: cantieri, impianti, consegne, generico».

### 4. Scelta all'avvio (`src/lib/avvio.js`)
Test: link valido senza salvata → usa e salva; link valido con `ts` ≥ salvata → usa e salva;
con `ts` < salvata → usa la salvata, nessun avviso; link non valido con salvata → salvata +
avviso; link non valido senza salvata → errore «link»; niente link con salvata → salvata;
niente di niente → errore «mancante».
Commit: «Avvio: quale configurazione usare».

### 5. Giorno, ore, riassunto, luoghi, azienda guidati dalle voci
Aggiornare i test esistenti alle voci (`voci` di prova = modello Cantieri + una voce `numero`
Km): totali per id (somme ore e numeri, conteggi sì/no), totali per luogo con ogni voce `ore`,
riassunto con luogo, ore, numeri, caselle, nota, «da controllare». `leggiNumero`: come
`leggiOre` ma fino a 999.999. `cantieri.js` → `luoghi.js` (stesse funzioni, nomi generici).
`testoAzienda(azienda)` solo con i campi presenti.
Commit: «Logica del giorno guidata dalle voci».

### 6. Excel guidato dalle voci
Test: intestazioni = Data, Giorno, nomi delle voci nell'ordine; riga «Azienda: …» solo se c'è
il nome; righe dei giorni (ore/numeri come numeri, testo non valido lasciato com'è, sì/no «X»);
riga dei totali; blocco «Totale per <nome luogo>» solo con una voce luogo; una nota
`=SOMMA(A1)` e un nome voce `=1+1` restano celle di testo (`t: "s"`, nessuna `f`).
Commit: «Excel: colonne dalle voci scelte».

### 7. Memoria e hook
`storage.js`: `caricaConfigurazione` / `salvaConfigurazione` (chiave `configurazione`),
`luoghi`. `useConfigurazione` (test con memoria finta): applica `scegliConfigurazione`, salva
quando serve, `aggiornaDaLink` accetta solo link validi e più recenti o uguali.
Commit: «Configurazione salvata nel telefono».

### 8. Componenti dell'app
`Giorno` disegna le voci (test: un nome HTML compare come testo, nessun elemento `img`);
`CampoLuogo` con etichetta dalla voce; `BarraFondo` con le prime due voci ore; `Intestazione`
con il nome dell'azienda e «Dati per la fattura» solo se ci sono dati; `DatiFattura` riceve
`azienda` (test aggiornati); `SchermataErrore`; `AggiornaModulo` (test: link non valido →
messaggio; valido → `aggiornaDaLink`).
Commit: «App del dipendente guidata dalla configurazione».

### 9. Tre pagine, PWA e manifest al volo
`index.html` → `app/index.html`; `vite.config.js` con `build.rollupOptions.input` per `/`,
`/crea/`, `/app/`; PWA `scope: "/app/"`, `manifest: false`, registrazione solo dall'app,
fallback di navigazione solo per `/app/`. `manifest.js` (test: nome, `start_url` = indirizzo
completo, `scope`, icone assolute, nessun testo della configurazione fuori da JSON).
`main.jsx` crea il `<link rel="manifest">` con un Blob.
Commit: «Tre pagine e app installabile da /app/».

### 10. Pagina iniziale
`index.html` statico + `src/sito.css` con i colori dell'app: titolo, frase, pulsante verso
`/crea/`, tre passi, nota finale esatta.
Commit: «Pagina iniziale».

### 11. Pagina del titolare
`npm install uqr` (approvato). `qr.js`: matrice da `uqr.encode`, percorso SVG e PNG su canvas
(test della funzione che crea il percorso). `Crea.jsx` con le 5 sezioni; `EditorVoci` (nome,
unità, su/giù, togli, aggiungi nei limiti, id stabili); `DatiAzienda` con
`controllaCampoAzienda` in tempo reale; `Anteprima` con `Giorno` aperto e colonne Excel;
`Condividi` con QR SVG (elementi React, niente `innerHTML`), Copia link, Condividi,
Scarica QR; «Incolla il link per modificarlo». Test del componente: dal modello al link
valido; P.IVA sbagliata → errore e link non disponibile.
Commit: «Pagina del titolare: crea il modulo, link e QR».

### 12. Sicurezza e controllo finale
`public/_headers` con Content-Security-Policy, nosniff, Referrer-Policy; prova di `dist`
servito con quelle intestazioni (nessun errore CSP in console). Prove a mano nel browser:
telefono e desktop, link non valido, link aggiornato, Excel scaricato e riletto.
README e CLAUDE.md aggiornati. Ricerca finale di dati veri.
Commit: «Intestazioni di sicurezza e documentazione».
