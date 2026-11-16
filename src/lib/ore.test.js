import { describe, it, expect } from "vitest";
import { leggiOre, leggiNumero, formatOre, totaliMese, totaliPerLuogo, SENZA_LUOGO } from "./ore.js";

const VOCI = [
  { id: "ore", tipo: "ore", nome: "Ore lavorate" },
  { id: "viaggio", tipo: "ore", nome: "Viaggio" },
  { id: "cantiere", tipo: "luogo", nome: "Cantiere" },
  { id: "km", tipo: "numero", nome: "Km", unita: "km" },
  { id: "pranzo", tipo: "si_no", nome: "Pranzo" },
  { id: "scontrini", tipo: "si_no", nome: "Scontrini" },
  { id: "note", tipo: "note", nome: "Note" },
];

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

describe("leggiNumero", () => {
  it("come le ore, ma fino a 999.999", () => {
    expect(leggiNumero("42")).toEqual({ stato: "valido", valore: 42 });
    expect(leggiNumero("120,5")).toEqual({ stato: "valido", valore: 120.5 });
    expect(leggiNumero("999999")).toEqual({ stato: "valido", valore: 999999 });
    expect(leggiNumero("1000000")).toEqual({ stato: "non valido", valore: 0 });
    expect(leggiNumero("")).toEqual({ stato: "vuoto", valore: 0 });
    expect(leggiNumero("dieci")).toEqual({ stato: "non valido", valore: 0 });
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
  it("somma ore e numeri validi e conta i sì, per id, solo nei giorni del mese", () => {
    const entries = {
      1: { ore: "8", viaggio: "1,5", km: "40", scontrini: true },
      2: { ore: "7,5", km: "12,5", pranzo: true, scontrini: true },
      3: { ore: "abc", km: "tanti" },
      31: { ore: "8" },
    };
    expect(totaliMese(entries, 30, VOCI)).toEqual({ ore: 15.5, viaggio: 1.5, km: 52.5, pranzo: 1, scontrini: 2 });
  });

  it("ignora i dati di voci che non ci sono più", () => {
    expect(totaliMese({ 1: { ore: "8", cena: true } }, 30, VOCI.slice(0, 1))).toEqual({ ore: 8 });
  });
});

describe("totaliPerLuogo", () => {
  it("raggruppa senza badare a maiuscole e spazi, tiene la prima grafia e l'ordine di comparsa", () => {
    const entries = {
      2: { cantiere: "Via Roma 12", ore: "8", viaggio: "1" },
      3: { cantiere: "Capannone Rossi", ore: "7,5" },
      4: { cantiere: " via roma 12 ", ore: "6", viaggio: "0,5" },
    };
    expect(totaliPerLuogo(entries, 30, VOCI)).toEqual([
      { luogo: "Via Roma 12", ore: { ore: 14, viaggio: 1.5 } },
      { luogo: "Capannone Rossi", ore: { ore: 7.5, viaggio: 0 } },
    ]);
  });

  it("le ore senza luogo vanno in fondo, in una riga a parte", () => {
    const entries = { 1: { ore: "4" }, 2: { cantiere: "Via Roma 12", ore: "8" }, 3: { viaggio: "2" } };
    expect(totaliPerLuogo(entries, 30, VOCI)).toEqual([
      { luogo: "Via Roma 12", ore: { ore: 8, viaggio: 0 } },
      { luogo: SENZA_LUOGO, ore: { ore: 4, viaggio: 2 } },
    ]);
  });

  it("niente righe per giorni vuoti, senza ore valide o fuori dal mese", () => {
    const entries = { 1: { note: "solo nota" }, 2: { ore: "abc" }, 31: { cantiere: "Fuori", ore: "8" } };
    expect(totaliPerLuogo(entries, 30, VOCI)).toEqual([]);
  });

  it("un luogo con sole caselle compare con zero ore", () => {
    expect(totaliPerLuogo({ 5: { cantiere: "Stabilimento", pranzo: true } }, 30, VOCI)).toEqual([
      { luogo: "Stabilimento", ore: { ore: 0, viaggio: 0 } },
    ]);
  });

  it("senza una voce luogo non c'è niente da raggruppare", () => {
    const senzaLuogo = VOCI.filter((v) => v.tipo !== "luogo");
    expect(totaliPerLuogo({ 1: { cantiere: "Via Roma", ore: "8" } }, 30, senzaLuogo)).toEqual([]);
  });

  it("arrotonda a 2 decimali", () => {
    const entries = { 1: { cantiere: "A", ore: "0,1" }, 2: { cantiere: "A", ore: "0,2" } };
    expect(totaliPerLuogo(entries, 30, VOCI)[0].ore.ore).toBe(0.3);
  });
});
