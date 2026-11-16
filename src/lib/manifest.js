import { linkApp } from "./link.js";

/**
 * Manifest dell'app installabile, creato al volo: `start_url` è il link completo del modulo
 * in uso, così l'icona sulla Home riparte dal modulo giusto (anche su iPhone, dove l'app
 * installata ha una memoria separata da Safari). Il testo della configurazione entra solo
 * come valore JSON (JSON.stringify), mai in HTML.
 */

const COLORE = "#1E5AA8"; // come --primario in src/styles.css

export function creaManifest({ config, origine }) {
  const azienda = config.azienda?.nome;
  return {
    id: `${origine}/app/`,
    name: azienda ? `${azienda} – Rapportino` : "Rapportino",
    short_name: "Rapportino",
    description: "Registro ore giornaliero",
    lang: "it",
    start_url: linkApp(config, origine),
    scope: `${origine}/app/`,
    display: "standalone",
    orientation: "portrait",
    theme_color: COLORE,
    background_color: COLORE,
    icons: [
      { src: `${origine}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${origine}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${origine}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

let ultimoUrl = null;

/** Mette nella pagina (o aggiorna) il <link rel="manifest"> che punta al manifest del modulo. */
export function applicaManifest(config, { origine = window.location.origin, url = URL, doc = document } = {}) {
  const blob = new Blob([JSON.stringify(creaManifest({ config, origine }))], { type: "application/manifest+json" });
  const nuovo = url.createObjectURL(blob);
  let link = doc.querySelector('link[rel="manifest"]');
  if (!link) {
    link = doc.createElement("link");
    link.rel = "manifest";
    doc.head.appendChild(link);
  }
  link.setAttribute("href", nuovo);
  if (ultimoUrl) url.revokeObjectURL(ultimoUrl);
  ultimoUrl = nuovo;
}
