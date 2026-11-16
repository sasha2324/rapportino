# Rapportino

**Cosa fa:** app per il telefono dei dipendenti. Ogni giorno si segnano ore di lavoro e di
viaggio, luogo di lavoro, spese e note; a fine mese si condivide l'Excel (per esempio su
WhatsApp). I dati restano sul telefono.

**Con cosa è fatto:** React e Vite, app installabile (PWA, funziona anche offline) con
vite-plugin-pwa, dati salvati nel telefono con IndexedDB (idb-keyval), Excel con SheetJS,
test con Vitest.

**Stato:** in sviluppo, repository privato. Nome provvisorio.
Prossimo passo: una configurazione al posto dei dati fissi (dati dell'azienda e voci da
segnare), e una pagina dove il titolare crea il modulo per la sua azienda e ottiene un
link e un QR code da mandare ai dipendenti. Per ora i dati dell'azienda sono esempi finti
in `src/lib/azienda.js`.

## Avviarlo

```bash
npm install        # la prima volta
npm run dev        # sviluppo, http://localhost:5173
npm test           # prove automatiche
npm run anteprima  # versione finale in locale, http://localhost:4173 (con service worker)
npm run build      # crea la cartella dist/ da pubblicare
npm run icons      # rigenera le icone (serve Python con Pillow)
```

## Installare sul telefono

- **iPhone (Safari):** apri il link → Condividi → «Aggiungi a Home».
- **Android (Chrome):** apri il link → «Installa», oppure menu ⋮ → «Installa app».

## Attenzione

I dati stanno solo sul telefono: chi cambia telefono o cancella l'app perde i mesi non
ancora condivisi. L'Excel condiviso è la copia che resta.
