import { describe, it, expect } from "vitest";
import { isGiornoVuoto, leggiGiorno, valoreVoce } from "./giorno.js";

const ore = { id: "ore", tipo: "ore", nome: "Ore lavorate" };
const luogo = { id: "cantiere", tipo: "luogo", nome: "Cantiere" };
const pranzo = { id: "pranzo", tipo: "si_no", nome: "Pranzo" };
const note = { id: "note", tipo: "note", nome: "Note" };
const VOCI = [ore, luogo, pranzo, note];

describe("leggiGiorno", () => {
  it("il giorno salvato, oppure un giorno vuoto", () => {
    expect(leggiGiorno({ 3: { ore: "8" } }, 3)).toEqual({ ore: "8" });
    expect(leggiGiorno({ "4": { note: "x" } }, 4)).toEqual({ note: "x" });
    expect(leggiGiorno({}, 5)).toEqual({});
    expect(leggiGiorno(undefined, 5)).toEqual({});
  });
});

describe("valoreVoce", () => {
  it("testo per ore, luogo, numero e note; vero/falso per sì/no", () => {
    expect(valoreVoce({ ore: "8" }, ore)).toBe("8");
    expect(valoreVoce({}, ore)).toBe("");
    expect(valoreVoce({}, pranzo)).toBe(false);
    expect(valoreVoce({ pranzo: true }, pranzo)).toBe(true);
  });

  it("un valore del tipo sbagliato vale come vuoto", () => {
    expect(valoreVoce({ ore: 8 }, ore)).toBe("");
    expect(valoreVoce({ pranzo: "sì" }, pranzo)).toBe(false);
  });
});

describe("isGiornoVuoto", () => {
  it("vuoto se tutte le voci sono vuote", () => {
    expect(isGiornoVuoto(undefined, VOCI)).toBe(true);
    expect(isGiornoVuoto({}, VOCI)).toBe(true);
    expect(isGiornoVuoto({ note: "   ", pranzo: false }, VOCI)).toBe(true);
  });

  it("basta una voce compilata", () => {
    expect(isGiornoVuoto({ cantiere: "Via Roma" }, VOCI)).toBe(false);
    expect(isGiornoVuoto({ ore: "8" }, VOCI)).toBe(false);
    expect(isGiornoVuoto({ pranzo: true }, VOCI)).toBe(false);
  });

  it("i dati di voci tolte dal modulo non contano", () => {
    expect(isGiornoVuoto({ cena: true, km: "40" }, VOCI)).toBe(true);
  });
});
