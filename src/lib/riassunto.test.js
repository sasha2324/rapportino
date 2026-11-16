import { describe, it, expect } from "vitest";
import { riassuntoGiorno } from "./riassunto.js";
import { giornoVuoto } from "./giorno.js";

const g = (campi) => ({ ...giornoVuoto(), ...campi });

describe("riassuntoGiorno", () => {
  it("giorno vuoto", () => {
    expect(riassuntoGiorno(giornoVuoto())).toEqual({
      vuoto: true, cantiere: "", ore: null, viaggio: null, daControllare: false, caselle: [], nota: "",
    });
  });

  it("giorno compilato: cantiere ripulito, ore come numeri, caselle nell'ordine giusto", () => {
    expect(riassuntoGiorno(g({ cantiere: " Via Roma 12 ", oreLav: "7,5", viaggio: "1", cena: true, scontrini: true, note: " Montaggio " }))).toEqual({
      vuoto: false, cantiere: "Via Roma 12", ore: 7.5, viaggio: 1, daControllare: false, caselle: ["scontrini", "cena"], nota: "Montaggio",
    });
  });

  it("ore o viaggio non validi: daControllare, e niente numero", () => {
    const r = riassuntoGiorno(g({ oreLav: "8", viaggio: "abc" }));
    expect(r.daControllare).toBe(true);
    expect(r.ore).toBe(8);
    expect(r.viaggio).toBeNull();
    expect(riassuntoGiorno(g({ oreLav: "30" })).daControllare).toBe(true);
  });

  it("zero ore scritte è un valore, non un vuoto", () => {
    expect(riassuntoGiorno(g({ oreLav: "0" })).ore).toBe(0);
  });
});
