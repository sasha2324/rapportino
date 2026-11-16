import { describe, it, expect } from "vitest";
import { leggiOre, formatOre, totaliMese, totaliPerCantiere } from "./ore.js";

describe("leggiOre", () => {
  it.each([
    ["", "vuoto", 0],
    ["   ", "vuoto", 0],
    [undefined, "vuoto", 0],
    ["8", "valido", 8],
    ["7,5", "valido", 7.5],
    ["7.5", "valido", 7.5],
    ["7,", "valido", 7],
    [",5", "valido", 0.5],
    ["0", "valido", 0],
    ["24", "valido", 24],
    [" 8 ", "valido", 8],
    ["24,5", "non valido", 0],
    ["abc", "non valido", 0],
    ["-1", "non valido", 0],
    ["7,5,1", "non valido", 0],
  ])("%j → %s %d", (testo, stato, valore) => {
    expect(leggiOre(testo)).toEqual({ stato, valore });
  });
});

describe("formatOre", () => {
  it("usa la virgola e al massimo 2 decimali", () => {
    expect(formatOre(7.5)).toBe("7,5");
    expect(formatOre(8)).toBe("8");
    expect(formatOre(0.1 + 0.2)).toBe("0,3");
    expect(formatOre(168.25)).toBe("168,25");
    expect(formatOre(1 / 3)).toBe("0,33");
  });
});

describe("totaliMese", () => {
  it("somma ore valide e conta le caselle, solo nei giorni del mese", () => {
    const entries = {
      1: { oreLav: "8", viaggio: "1,5", scontrini: true },
      2: { oreLav: "7,5", pranzo: true, scontrini: true },
      3: { oreLav: "abc" },
      31: { oreLav: "8" },
    };
    expect(totaliMese(entries, 30)).toEqual({
      oreLav: 15.5, viaggio: 1.5,
      scontrini: 2, fatture: 0, colazioni: 0, bb: 0, pranzo: 1, cena: 0,
    });
  });
});

describe("totaliPerCantiere", () => {
  it("raggruppa senza badare a maiuscole e spazi, tiene la prima grafia e l'ordine di comparsa", () => {
    const entries = {
      2: { cantiere: "Via Roma 12", oreLav: "8", viaggio: "1" },
      3: { cantiere: "Capannone Rossi", oreLav: "7,5" },
      4: { cantiere: " via roma 12 ", oreLav: "6", viaggio: "0,5" },
    };
    expect(totaliPerCantiere(entries, 30)).toEqual([
      { cantiere: "Via Roma 12", oreLav: 14, viaggio: 1.5 },
      { cantiere: "Capannone Rossi", oreLav: 7.5, viaggio: 0 },
    ]);
  });

  it("le ore senza cantiere vanno in «(senza cantiere)», in fondo", () => {
    const entries = {
      1: { oreLav: "4" },
      2: { cantiere: "Via Roma 12", oreLav: "8" },
      3: { viaggio: "2" },
    };
    expect(totaliPerCantiere(entries, 30)).toEqual([
      { cantiere: "Via Roma 12", oreLav: 8, viaggio: 0 },
      { cantiere: "(senza cantiere)", oreLav: 4, viaggio: 2 },
    ]);
  });

  it("ignora giorni vuoti, giorni senza cantiere e senza ore valide, giorni fuori dal mese", () => {
    const entries = {
      1: { note: "solo nota" },
      2: { oreLav: "abc" },
      31: { cantiere: "Fuori", oreLav: "8" },
    };
    expect(totaliPerCantiere(entries, 30)).toEqual([]);
  });

  it("un cantiere con sole caselle spuntate compare con zero ore", () => {
    expect(totaliPerCantiere({ 5: { cantiere: "Stabilimento", pranzo: true } }, 30)).toEqual([
      { cantiere: "Stabilimento", oreLav: 0, viaggio: 0 },
    ]);
  });

  it("arrotonda a 2 decimali", () => {
    const entries = { 1: { cantiere: "A", oreLav: "0,1" }, 2: { cantiere: "A", oreLav: "0,2" } };
    expect(totaliPerCantiere(entries, 30)[0].oreLav).toBe(0.3);
  });
});
