# Rapportino — configurazione nel link (design)

Approvato da Sasha il 16/11/2026.

## Obiettivo

Il registro ore diventa generale: il titolare sceglie dati dell'azienda e voci da segnare,
ottiene un link e un QR code; i dipendenti aprono il link, installano l'app e la usano.
Niente account, server o database: la configurazione sta nel link, dopo il `#`, e non arriva
a nessun server.

## Indirizzi

| Indirizzo | Chi | Cosa |
|---|---|---|
| `/` | tutti | pagina iniziale: 3 passi e la nota finale |
| `/crea/` | titolare | «Crea il modulo per la tua azienda» |
| `/app/#<configurazione>` | dipendente | l'app del registro ore |

Build Vite con tre pagine HTML. L'app installabile (PWA) ha scope `/app/`.

## Configurazione (versione 1)

```json
{
  "v": 1,
  "ts": 1763316000,
  "azienda": { "nome": "", "sede": "", "piva": "", "sdi": "", "email": "", "tel": "" },
  "voci": [{ "id": "ore", "tipo": "ore", "nome": "Ore lavorate" }]
}
```

- `v`: versione del formato, solo `1`.
- `ts`: secondi Unix di creazione del link (intero tra il 2026-01-01 e il 2100-01-01). Tra due
  configurazioni vince quella con `ts` più alto.
- `azienda`: facoltativa, ogni campo facoltativo. Se non c'è nessun dato, «Dati per la fattura»
  non compare.
- `voci`: da 1 a 20, nell'ordine in cui compaiono nell'app e nell'Excel.
  - `id`: `^[a-z][a-z0-9-]{0,19}$`, unico. È la chiave dei dati salvati: non cambia se si
    rinomina la voce. La pagina del titolare lo ricava dal primo nome e lo conserva quando
    si modifica un modulo esistente.
  - `tipo` e limiti: `ore` da 1 a 3 (almeno una), `luogo` al massimo 1, `numero` al massimo 5
    (con `unita` facoltativa, al massimo 8 caratteri), `si_no` al massimo 10, `note` al massimo 1.
  - `nome`: da 1 a 30 caratteri, senza a capo né caratteri di controllo.

### Modelli pronti

- **Cantieri:** Ore lavorate, Viaggio (ore); Cantiere (luogo); Pranzo, Cena, Pernottamento,
  Scontrini (sì/no); Note.
- **Impianti e manutenzione:** Ore lavorate, Viaggio; Cliente; Km (numero, km); Scontrini,
  Pranzo; Note.
- **Consegne:** Ore lavorate; Giro (luogo); Km (km), Consegne (numero); Pranzo; Note.
- **Generico:** Ore lavorate; Sede (luogo); Note.

## Formato del link

JSON → UTF-8 → base64url (senza `=`), dopo il `#`: `/app/#<base64url>`.
Nessuna compressione e nessuna libreria: funziona su ogni telefono. Lunghezza tipica
500–800 caratteri.

## Controlli (il link è un dato non fidato)

Una sola funzione di lettura, usata dall'app e dalla pagina del titolare («incolla un link»).
Rifiuta, con un messaggio chiaro e un dettaglio:

- testo dopo il `#` più lungo di 3.000 caratteri, caratteri fuori da base64url, UTF-8 non
  valido, JSON non valido, radice che non è un oggetto;
- chiavi sconosciute (in radice, in `azienda`, nelle voci), `v` diverso da 1, `ts` fuori intervallo;
- voci: numero, tipi, limiti per tipo, `id` non validi o ripetuti, nomi vuoti, lunghi o con
  caratteri di controllo, `unita` dove non serve o troppo lunga;
- azienda: `nome` ≤ 80, `sede` ≤ 120, `piva` 11 cifre con cifra di controllo giusta, `sdi`
  7 lettere/cifre, `email` ≤ 80 in formato semplice, `tel` ≤ 20 tra cifre, spazi e `+ - . ( ) /`.

Messaggio: «Questo link non funziona: è incompleto o è stato modificato. Chiedi al titolare
di mandartelo di nuovo.» con sotto il dettaglio (es. «Voce 3: nome troppo lungo, massimo 30
caratteri»). Se il telefono ha già un modulo valido, l'app continua a usarlo e mostra un avviso.

Ogni testo della configurazione si mostra solo come testo (React, mai `innerHTML`); il titolo
della pagina con `document.title`; il manifest con `JSON.stringify`. Nell'Excel i testi sono
celle di testo, mai formule. Content-Security-Policy in `public/_headers`.

## App del dipendente

Come oggi, con le voci della configurazione: nell'intestazione il nome dell'azienda (o
«Rapportino»), il nome del dipendente e, se ci sono dati, «Dati per la fattura». Il giorno
aperto mostra le voci nell'ordine scelto: `luogo` con i suggerimenti dei luoghi già usati,
`ore` e `numero` come campi numerici, `si_no` come caselle, `note` come area di testo.
La barra in fondo mostra il totale della prima voce `ore` e, se c'è, della seconda.
Il dipendente non vede impostazioni.

Senza configurazione (né nel link né salvata): «Questo modulo non è ancora configurato.
Chiedi al titolare il link.»

### Salvataggio e aggiornamenti

- La configurazione valida si salva nel telefono (IndexedDB) separata dai dati dei mesi.
- I dati di ogni giorno sono `{ <id voce>: valore }`. Una voce tolta sparisce da schermo ed
  Excel, ma i dati restano e tornano se la voce viene rimessa con lo stesso `id`.
- All'apertura: configurazione del link valida e con `ts` ≥ di quella salvata → diventa quella
  in uso; con `ts` minore → si ignora (l'icona installata riparte da un link vecchio).
- Installazione: l'app crea il manifest al volo, con `start_url` = indirizzo completo del link,
  così l'icona sulla Home riparte dal modulo giusto.
- iPhone: l'app installata ha memoria separata da Safari e i link da WhatsApp si aprono in
  Safari. In fondo all'app: «Hai ricevuto un modulo aggiornato? Incolla il link» (stessi controlli).
- Android: la memoria è condivisa, basta aprire il link nuovo.
- Va provato su un iPhone e un Android veri prima di pubblicare.

## Pagina del titolare (`/crea/`)

Sezioni: 1 Modello (4 modelli), 2 Voci (nome modificabile, unità per i numeri, su/giù,
togli, «Aggiungi voce» per tipo nei limiti), 3 Dati dell'azienda (facoltativi, controlli
in tempo reale), 4 Anteprima (gli stessi componenti dell'app + le colonne dell'Excel),
5 Manda ai dipendenti (QR code SVG, Copia link, Condividi, Scarica QR). «Hai già un modulo?
Incolla il link per modificarlo» carica un modulo esistente conservando gli `id`.
Desktop: modulo a sinistra, anteprima fissa a destra. Telefono: sezioni una sotto l'altra.
QR code con la libreria `uqr` (senza dipendenze, SVG).

## Pagina iniziale (`/`)

Titolo «Rapportino», una frase, il pulsante «Crea il modulo per la tua azienda» e tre passi:
il titolare crea il modulo; i dipendenti segnano le ore; a fine mese arriva l'Excel.
In fondo: «I dati restano sul telefono. Non sostituisce il sistema ufficiale di rilevazione
presenze.»

## Stile

Lo stile dell'app (`src/styles.css`): colore blu provvisorio, caratteri di sistema. Le due
pagine nuove usano gli stessi colori e componenti.

## Excel

```
Azienda: <nome>            (solo se c'è)
Dipendente: <nome>
Periodo: <mese> <anno>

Data | Giorno | <voci nell'ordine scelto>
…una riga per giorno: ore e numeri come numeri, sì/no come «X», luogo e note come testo
     | Totale | somme di ore e numeri, conteggio dei sì/no
Totale per <nome della voce luogo>      (solo se c'è una voce luogo)
     |        | <luogo> | <ogni voce ore>
```

## Test

- configurazione: caso valido, ogni rifiuto dei controlli, testo HTML nei nomi mostrato come testo;
- link: andata e ritorno con accenti ed emoji, limiti di lunghezza;
- modelli: tutti validi;
- salvataggio: link aggiornato non cancella dati; vince il `ts` più alto; link vecchio ignorato;
- Excel: colonne nell'ordine delle voci, totali, tabella per luogo, sì/no, testo che comincia
  con `=` resta testo.
