import { describe, it, expect } from "vitest";
import {
  MESI, chiaveMese, giorniNelMese, indiceSettimana, nomeGiorno,
  isWeekend, spostaMese, dataBreve, giornoDiOggi,
} from "./calendario.js";

describe("calendario", () => {
  it("ha i 12 mesi in italiano", () => {
    expect(MESI).toHaveLength(12);
    expect(MESI[10]).toBe("Novembre");
  });

  it("chiaveMese usa il mese 1-12 con lo zero davanti", () => {
    expect(chiaveMese(2026, 10)).toBe("entries:2026-11");
    expect(chiaveMese(2027, 0)).toBe("entries:2027-01");
  });

  it("giorniNelMese gestisce febbraio e gli anni bisestili", () => {
    expect(giorniNelMese(2026, 10)).toBe(30);
    expect(giorniNelMese(2026, 1)).toBe(28);
    expect(giorniNelMese(2028, 1)).toBe(29);
  });

  it("1 novembre 2026 è domenica, 2 è lunedì, 7 è sabato", () => {
    expect(indiceSettimana(2026, 10, 1)).toBe(6);
    expect(nomeGiorno(2026, 10, 1)).toBe("Dom");
    expect(nomeGiorno(2026, 10, 2)).toBe("Lun");
    expect(isWeekend(2026, 10, 7)).toBe(true);
    expect(isWeekend(2026, 10, 1)).toBe(true);
    expect(isWeekend(2026, 10, 2)).toBe(false);
  });

  it("spostaMese passa da un anno all'altro", () => {
    expect(spostaMese(2026, 11, 1)).toEqual({ anno: 2027, mese: 0 });
    expect(spostaMese(2026, 0, -1)).toEqual({ anno: 2025, mese: 11 });
    expect(spostaMese(2026, 10, 1)).toEqual({ anno: 2026, mese: 11 });
  });

  it("dataBreve è gg/mm/aaaa", () => {
    expect(dataBreve(2026, 10, 2)).toBe("02/11/2026");
  });
});

describe("giornoDiOggi", () => {
  const oggi = new Date(2026, 10, 20); // 20 novembre 2026
  it("il numero del giorno se il mese mostrato è quello di oggi", () => {
    expect(giornoDiOggi(2026, 10, oggi)).toBe(20);
  });
  it("null per gli altri mesi o anni", () => {
    expect(giornoDiOggi(2026, 11, oggi)).toBeNull();
    expect(giornoDiOggi(2025, 10, oggi)).toBeNull();
  });
});
