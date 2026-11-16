import { describe, it, expect } from "vitest";
import { usaLuogo, rimuoviLuogo, nomeConosciuto, suggerimenti } from "./luoghi.js";

const elenco = [
  { nome: "Via Roma 12", ultimoUso: 100 },
  { nome: "Stabilimento Nord", ultimoUso: 300 },
  { nome: "Capannone Rossi", ultimoUso: 200 },
];

describe("usaLuogo", () => {
  it("aggiunge un nome nuovo, ripulito dagli spazi", () => {
    expect(usaLuogo([], "  Via Verdi 3 ", 50)).toEqual([{ nome: "Via Verdi 3", ultimoUso: 50 }]);
  });

  it("non crea doppioni: tiene la prima grafia e aggiorna ultimoUso", () => {
    const nuovo = usaLuogo(elenco, " via roma 12 ", 999);
    expect(nuovo).toHaveLength(3);
    expect(nuovo.find((c) => c.nome === "Via Roma 12").ultimoUso).toBe(999);
  });

  it("con un nome vuoto non cambia niente", () => {
    expect(usaLuogo(elenco, "   ", 1)).toBe(elenco);
  });
});

describe("rimuoviLuogo", () => {
  it("toglie il luogo senza badare a maiuscole", () => {
    expect(rimuoviLuogo(elenco, "STABILIMENTO nord").map((c) => c.nome)).toEqual(["Via Roma 12", "Capannone Rossi"]);
  });
});

describe("nomeConosciuto", () => {
  it("ritorna la grafia salvata o null", () => {
    expect(nomeConosciuto(elenco, "capannone rossi ")).toBe("Capannone Rossi");
    expect(nomeConosciuto(elenco, "Altro")).toBeNull();
  });
});

describe("suggerimenti", () => {
  it("senza testo: dall'ultimo usato", () => {
    expect(suggerimenti(elenco)).toEqual(["Stabilimento Nord", "Capannone Rossi", "Via Roma 12"]);
  });

  it("il luogo del giorno prima va per primo, senza doppioni", () => {
    expect(suggerimenti(elenco, { luogoIeri: "via roma 12" })).toEqual(["Via Roma 12", "Stabilimento Nord", "Capannone Rossi"]);
  });

  it("un luogo di ieri che non è più in elenco viene ignorato", () => {
    expect(suggerimenti(elenco, { luogoIeri: "Tolto" })).toEqual(["Stabilimento Nord", "Capannone Rossi", "Via Roma 12"]);
  });

  it("al massimo 5", () => {
    const tanti = Array.from({ length: 8 }, (_, i) => ({ nome: `C${i}`, ultimoUso: i }));
    expect(suggerimenti(tanti)).toEqual(["C7", "C6", "C5", "C4", "C3"]);
  });

  it("con testo: filtra per 'contiene' senza badare a maiuscole", () => {
    expect(suggerimenti(elenco, { testo: "ro" })).toEqual(["Capannone Rossi", "Via Roma 12"]);
    expect(suggerimenti(elenco, { testo: "zzz" })).toEqual([]);
  });
});
