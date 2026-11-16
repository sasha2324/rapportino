# Rapportino

**Cosa fa:** il foglio ore del mese, dal telefono dei dipendenti. Il titolare crea il modulo
della sua azienda (voci da segnare e dati per le fatture), ottiene un link e un QR code e li
manda ai dipendenti. I dipendenti aprono il link, installano l'app e ogni giorno segnano ore,
luogo, numeri (es. km), caselle sì/no e note; a fine mese condividono l'Excel. I dati restano
sul telefono. Non sostituisce il sistema ufficiale di rilevazione presenze.

**Con cosa è fatto:** React e Vite (tre pagine), app installabile e offline con
vite-plugin-pwa, dati nel telefono con IndexedDB (idb-keyval), Excel con SheetJS, QR code
con `uqr`, test con Vitest. Nessun server, nessun account, nessun database.

**Stato:** in sviluppo, repository privato, nome provvisorio. Prima della pubblicazione va
provata l'installazione su un iPhone e un Android veri.

## Le pagine

| Indirizzo | Per chi | Cosa c'è |
|---|---|---|
| `/` | tutti | come funziona, in tre passi |
| `/crea/` | titolare | modelli pronti, voci, dati dell'azienda, anteprima, link e QR |
| `/app/#…` | dipendente | il registro del mese (installabile) |

## Il modulo sta nel link

La configurazione (dati dell'azienda e voci) è un piccolo JSON messo dopo il `#` del link, in
base64url: il browser non manda mai quella parte a nessun server. Il link arriva da fuori,
quindi ogni lettura passa dai controlli di `src/lib/configurazione.js` (struttura, tipi,
limiti, lunghezze, caratteri) e i testi si mostrano sempre come testo.

- Le voci hanno un codice (`id`) che non cambia se vengono rinominate: con un link
  aggiornato i giorni già segnati restano.
- Tra due moduli vince il più recente (`ts`): l'icona installata riparte dal suo link, che
  può essere più vecchio di quello salvato.
- Su iPhone l'app installata non vede i link aperti in Safari: in fondo all'app c'è
  «Hai ricevuto un modulo aggiornato? Incolla il link».

Progetto completo: [`docs/superpowers/specs/2026-11-16-rapportino-configurazione-design.md`](docs/superpowers/specs/2026-11-16-rapportino-configurazione-design.md).

## Avviarlo

```bash
npm install        # la prima volta
npm run dev        # sviluppo: http://localhost:5173/ (e /crea/, /app/)
npm test           # prove automatiche
npm run anteprima  # versione finale in locale, http://localhost:4173 (con service worker)
npm run build      # crea la cartella dist/ da pubblicare
npm run icons      # rigenera le icone (serve Python con Pillow)
```

Le intestazioni di sicurezza (Content-Security-Policy e altre) sono in `public/_headers`.

## Installare sul telefono

- **iPhone (Safari):** apri il link → Condividi → «Aggiungi a Home».
- **Android (Chrome):** apri il link → «Installa», oppure menu ⋮ → «Installa app».

## Attenzione

I dati stanno solo sul telefono: chi cambia telefono o cancella l'app perde i mesi non
ancora condivisi. L'Excel condiviso è la copia che resta.
