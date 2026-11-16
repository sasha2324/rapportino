"""Crea le icone dell'app: un foglio bianco con le righe su fondo blu, disegnato qui.

Nessun logo di partenza: è un'icona generica, uguale per ogni azienda.
Uso: npm run icons   (serve Python 3 con Pillow)
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BLU = (30, 90, 168)  # come --primario in src/styles.css
BLU_CHIARO = (199, 216, 241)
BIANCO = (255, 255, 255)
SCALA = 4  # si disegna 4 volte più grande e poi si rimpicciolisce: bordi lisci


def icona(lato, quota):
    """Fondo blu pieno; il foglio occupa `quota` del lato (più piccolo per l'icona «maskable»)."""
    g = lato * SCALA
    img = Image.new("RGB", (g, g), BLU)
    d = ImageDraw.Draw(img)

    alto = g * quota
    largo = alto * 0.78
    x0, y0 = (g - largo) / 2, (g - alto) / 2 + alto * 0.04
    x1, y1 = x0 + largo, y0 + alto
    d.rounded_rectangle((x0, y0, x1, y1), radius=largo * 0.1, fill=BIANCO)

    # Fermaglio in alto
    fl = largo * 0.42
    fh = alto * 0.11
    fx0 = (g - fl) / 2
    d.rounded_rectangle((fx0, y0 - fh * 0.45, fx0 + fl, y0 + fh * 0.55), radius=fh * 0.4, fill=BLU_CHIARO)

    # Righe del modulo
    margine = largo * 0.18
    spessore = alto * 0.055
    for i, lunghezza in enumerate([1.0, 1.0, 0.62]):
        y = y0 + alto * (0.32 + i * 0.19)
        d.rounded_rectangle(
            (x0 + margine, y, x0 + margine + (largo - 2 * margine) * lunghezza, y + spessore),
            radius=spessore / 2,
            fill=BLU,
        )
    return img.resize((lato, lato), Image.LANCZOS)


def main():
    (PUBLIC / "icons").mkdir(parents=True, exist_ok=True)
    for lato, nome in [(192, "icons/icon-192.png"), (512, "icons/icon-512.png"), (180, "apple-touch-icon.png")]:
        icona(lato, 0.62).save(PUBLIC / nome, optimize=True)
    # «Maskable»: Android ritaglia a cerchio, il disegno deve stare nel 72% centrale
    icona(512, 0.5).save(PUBLIC / "icons" / "icon-maskable-512.png", optimize=True)
    print("icone create in", PUBLIC)


if __name__ == "__main__":
    main()
