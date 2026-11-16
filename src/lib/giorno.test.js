import { describe, it, expect } from "vitest";
import { CASELLE, giornoVuoto, leggiGiorno, isGiornoVuoto } from "./giorno.js";

describe("giorno", () => {
  it("le sei caselle sono nell'ordine del prototipo", () => {
    expect(CASELLE.map((c) => c.key)).toEqual(["scontrini", "fatture", "colazioni", "bb", "pranzo", "cena"]);
  });

  it("giornoVuoto ha il cantiere e tutti i campi vuoti", () => {
    expect(giornoVuoto()).toEqual({
      cantiere: "", oreLav: "", viaggio: "",
      scontrini: false, fatture: false, colazioni: false, bb: false, pranzo: false, cena: false,
      note: "",
    });
  });

  it("leggiGiorno completa i campi mancanti", () => {
    expect(leggiGiorno({ 3: { oreLav: "8" } }, 3)).toEqual({ ...giornoVuoto(), oreLav: "8" });
    expect(leggiGiorno({}, 5)).toEqual(giornoVuoto());
    expect(leggiGiorno({ "4": { note: "x" } }, 4).note).toBe("x");
  });

  it("isGiornoVuoto", () => {
    expect(isGiornoVuoto(undefined)).toBe(true);
    expect(isGiornoVuoto(giornoVuoto())).toBe(true);
    expect(isGiornoVuoto({ ...giornoVuoto(), note: "   " })).toBe(true);
    expect(isGiornoVuoto({ ...giornoVuoto(), cantiere: "Via Roma" })).toBe(false);
    expect(isGiornoVuoto({ ...giornoVuoto(), oreLav: "8" })).toBe(false);
    expect(isGiornoVuoto({ ...giornoVuoto(), cena: true })).toBe(false);
  });
});
