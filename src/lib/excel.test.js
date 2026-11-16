import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { INTESTAZIONI, righeExcel, nomeFileExcel, creaFileExcel } from "./excel.js";

const entries = {
  2: { cantiere: " Via Roma 12 ", oreLav: "8", viaggio: "1,5", scontrini: true, pranzo: true, note: " Montaggio linea " },
  3: { oreLav: "abc" },
};
const base = { nomeDipendente: "Mario Rossi", anno: 2026, mese: 10, entries };

describe("righeExcel", () => {
  it("colonne nell'ordine giusto, con Cantiere dopo Giorno", () => {
    expect(INTESTAZIONI).toEqual([
      "Data", "Giorno", "Cantiere", "Ore lav.", "Viaggio",
      "Scontrini", "Fatture", "Colazioni", "B&B", "Pranzo", "Cena", "Note",
    ]);
  });

  it("intestazione, una riga per giorno, totale", () => {
    const r = righeExcel(base);
    expect(r).toHaveLength(4 + 30 + 2 + 4);
    expect(r[0]).toEqual(["Dipendente: Mario Rossi"]);
    expect(r[1]).toEqual(["Periodo: Novembre 2026"]);
    expect(r[2]).toEqual([]);
    expect(r[3]).toEqual(INTESTAZIONI);
    expect(r[4][0]).toBe("01/11/2026");
    expect(r[5]).toEqual(["02/11/2026", "Lun", "Via Roma 12", 8, 1.5, "X", "", "", "", "X", "", "Montaggio linea"]);
    expect(r[6]).toEqual(["03/11/2026", "Mar", "", "abc", "", "", "", "", "", "", "", ""]);
    expect(r[34]).toEqual([]);
    expect(r[35]).toEqual(["", "Totale", "", 8, 1.5, 1, 0, 0, 0, 1, 0, ""]);
  });

  it("sotto il totale, il totale delle ore per cantiere allineato alle colonne", () => {
    const r = righeExcel({
      ...base,
      entries: {
        2: { cantiere: "Via Roma 12", oreLav: "8", viaggio: "1" },
        3: { cantiere: "Capannone Rossi", oreLav: "7,5" },
        4: { cantiere: " via roma 12 ", oreLav: "6", viaggio: "0,5" },
        5: { oreLav: "4" },
      },
    });
    expect(r.slice(36)).toEqual([
      [],
      ["", "Totale per cantiere"],
      ["", "", "Cantiere", "Ore lav.", "Viaggio"],
      ["", "", "Via Roma 12", 14, 1.5],
      ["", "", "Capannone Rossi", 7.5, 0],
      ["", "", "(senza cantiere)", 4, 0],
    ]);
  });

  it("mese vuoto: niente blocco per cantiere", () => {
    expect(righeExcel({ ...base, entries: {} })).toHaveLength(4 + 30 + 2);
  });

  it("senza nome scrive un trattino", () => {
    expect(righeExcel({ ...base, nomeDipendente: "  " })[0]).toEqual(["Dipendente: -"]);
  });
});

describe("nomeFileExcel", () => {
  it("spazi in _ e niente caratteri vietati", () => {
    expect(nomeFileExcel("  Mario   Rossi ", 2026, 10)).toBe("Ore_Mario_Rossi_Novembre_2026.xlsx");
    expect(nomeFileExcel("Mario/Rossi:", 2026, 10)).toBe("Ore_MarioRossi_Novembre_2026.xlsx");
    expect(nomeFileExcel("", 2026, 0)).toBe("Ore_dipendente_Gennaio_2026.xlsx");
  });
});

describe("creaFileExcel", () => {
  it("crea un .xlsx leggibile con i dati giusti", async () => {
    const file = creaFileExcel(base);
    expect(file.name).toBe("Ore_Mario_Rossi_Novembre_2026.xlsx");
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array" });
    expect(wb.SheetNames).toEqual(["Ore"]);
    const ws = wb.Sheets.Ore;
    expect(ws.A1.v).toBe("Dipendente: Mario Rossi");
    expect(ws.C4.v).toBe("Cantiere");
    expect(ws.C6.v).toBe("Via Roma 12");
    expect(ws.D6.t).toBe("n");
    expect(ws.D6.v).toBe(8);
  });
});
