import { describe, it, expect } from "vitest";
import { riassuntoGiorno } from "./riassunto.js";

const VOCI = [
  { id: "ore", tipo: "ore", nome: "Ore lavorate" },
  { id: "viaggio", tipo: "ore", nome: "Viaggio" },
  { id: "cantiere", tipo: "luogo", nome: "Cantiere" },
  { id: "km", tipo: "numero", nome: "Km", unita: "km" },
  { id: "scontrini", tipo: "si_no", nome: "Scontrini" },
  { id: "cena", tipo: "si_no", nome: "Cena" },
  { id: "note", tipo: "note", nome: "Note" },
];

describe("riassuntoGiorno", () => {
  it("giorno vuoto", () => {
    expect(riassuntoGiorno({}, VOCI)).toEqual({
      vuoto: true,
      luogo: "",
      ore: [
        { id: "ore", nome: "Ore lavorate", valore: null },
        { id: "viaggio", nome: "Viaggio", valore: null },
      ],
      numeri: [{ id: "km", nome: "Km", unita: "km", valore: null }],
      caselle: [],
      nota: "",
      daControllare: false,
    });
  });

  it("giorno compilato: luogo ripulito, numeri come numeri, caselle nell'ordine delle voci", () => {
    const r = riassuntoGiorno(
      { cantiere: " Via Roma 12 ", ore: "7,5", viaggio: "1", km: "42", cena: true, scontrini: true, note: " Montaggio " },
      VOCI
    );
    expect(r.vuoto).toBe(false);
    expect(r.luogo).toBe("Via Roma 12");
    expect(r.ore.map((o) => o.valore)).toEqual([7.5, 1]);
    expect(r.numeri[0].valore).toBe(42);
    expect(r.caselle).toEqual([
      { id: "scontrini", nome: "Scontrini" },
      { id: "cena", nome: "Cena" },
    ]);
    expect(r.nota).toBe("Montaggio");
    expect(r.daControllare).toBe(false);
  });

  it("ore o numeri non validi: daControllare, e niente numero", () => {
    const r = riassuntoGiorno({ ore: "8", viaggio: "abc" }, VOCI);
    expect(r.daControllare).toBe(true);
    expect(r.ore.map((o) => o.valore)).toEqual([8, null]);
    expect(riassuntoGiorno({ ore: "30" }, VOCI).daControllare).toBe(true);
    expect(riassuntoGiorno({ km: "tanti" }, VOCI).daControllare).toBe(true);
  });

  it("zero ore scritte è un valore, non un vuoto", () => {
    expect(riassuntoGiorno({ ore: "0" }, VOCI).ore[0].valore).toBe(0);
  });
});
