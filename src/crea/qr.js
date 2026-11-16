import { encode } from "uqr";

/**
 * QR code del link: `uqr` calcola la matrice dei moduli (vero = nero); il disegno lo facciamo
 * noi, come percorso SVG per la pagina (elementi React, niente HTML incollato) e come PNG
 * su canvas da scaricare o stampare.
 */

export const BORDO = 4; // margine bianco minimo richiesto dallo standard, in moduli

/**
 * Matrice del QR (vero = nero), oppure null se il link è troppo lungo per qualsiasi QR.
 * Prima correzione M (regge un po' di sporco); se non entra, L (fino a circa 2.950 byte).
 */
export function matriceQR(testo) {
  for (const ecc of ["M", "L"]) {
    try {
      return encode(testo, { ecc, border: BORDO }).data;
    } catch (e) {
      if (!(e instanceof RangeError)) throw e;
    }
  }
  return null;
}

/** Percorso SVG: un rettangolo alto 1 per ogni tratto orizzontale di moduli neri. */
export function percorsoQR(matrice) {
  let d = "";
  matrice.forEach((riga, y) => {
    let x = 0;
    while (x < riga.length) {
      if (!riga[x]) {
        x++;
        continue;
      }
      const inizio = x;
      while (x < riga.length && riga[x]) x++;
      const lungo = x - inizio;
      d += `M${inizio} ${y}h${lungo}v1h-${lungo}z`;
    }
  });
  return d;
}

/** PNG del QR (lato circa `lato` pixel), per scaricarlo o mandarlo. */
export function pngQR(matrice, lato = 1024) {
  const pixel = Math.max(1, Math.floor(lato / matrice.length));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = pixel * matrice.length;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  matrice.forEach((riga, y) => riga.forEach((nero, x) => nero && ctx.fillRect(x * pixel, y * pixel, pixel, pixel)));
  return new Promise((risolvi, rifiuta) =>
    canvas.toBlob((blob) => (blob ? risolvi(blob) : rifiuta(new Error("PNG non creato"))), "image/png")
  );
}
