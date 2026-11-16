import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { intestazioni, righeExcel, nomeFileExcel, creaFileExcel } from "./excel.js";

const VOCI = [
  { id: "ore", tipo: "ore", nome: "Ore lavorate" },
  { id: "viaggio", tipo: "ore", nome: "Viaggio" },
  { id: "cantiere", tipo: "luogo", nome: "Cantiere" },
  { id: "km", tipo: "numero", nome: "Km", unita: "km" },
  { id: "pranzo", tipo: "si_no", nome: "Pranzo" },
  { id: "note", tipo: "note", nome: "Note" },
];
const config = { v: 1, ts: 1794816000, azienda: { nome: "Azienda di esempio S.r.l." }, voci: VOCI };
const entries = {
  2: { cantiere: " Via Roma 12 ", ore: "8", viaggio: "1,5", km: "42", pranzo: true, note: " Montaggio linea " },
  3: { ore: "abc", km: "tanti" },
};
const base = { config, nomeDipendente: "Mario Rossi", anno: 2026, mese: 10, entries };

describe("intestazioni", () => {
  it("Data, Giorno e poi le voci nell'ordine scelto", () => {
    expect(intestazioni(VOCI)).toEqual(["Data", "Giorno", "Ore lavorate", "Viaggio", "Cantiere", "Km", "Pranzo", "Note"]);
    expect(intestazioni([...VOCI].reverse())[2]).toBe("Note");
  });

  it("l'unità tra parentesi, solo se è diversa dal nome", () => {
    expect(intestazioni([{ id: "d", tipo: "numero", nome: "Distanza", unita: "km" }])[2]).toBe("Distanza (km)");
    expect(intestazioni([{ id: "k", tipo: "numero", nome: "KM", unita: "km" }])[2]).toBe("KM");
  });
});

describe("righeExcel", () => {
  it("azienda, dipendente, periodo, una riga per giorno, totale", () => {
    const r = righeExcel(base);
    expect(r.slice(0, 5)).toEqual([
      ["Azienda: Azienda di esempio S.r.l."],
      ["Dipendente: Mario Rossi"],
      ["Periodo: Novembre 2026"],
      [],
      intestazioni(VOCI),
    ]);
    expect(r[5][0]).toBe("01/11/2026");
    expect(r[6]).toEqual(["02/11/2026", "Lun", 8, 1.5, "Via Roma 12", 42, "X", "Montaggio linea"]);
    expect(r[7]).toEqual(["03/11/2026", "Mar", "abc", "", "", "tanti", "", ""]);
    expect(r[35]).toEqual([]);
    expect(r[36]).toEqual(["", "Totale", 8, 1.5, "", 42, 1, ""]);
  });

  it("senza nome dell'azienda niente riga «Azienda»", () => {
    const r = righeExcel({ ...base, config: { ...config, azienda: undefined } });
    expect(r[0]).toEqual(["Dipendente: Mario Rossi"]);
  });

  it("senza nome del dipendente scrive un trattino", () => {
    expect(righeExcel({ ...base, nomeDipendente: "  " })[1]).toEqual(["Dipendente: -"]);
  });

  it("sotto il totale, le ore per luogo con il nome della voce luogo", () => {
    const r = righeExcel({
      ...base,
      entries: {
        2: { cantiere: "Via Roma 12", ore: "8", viaggio: "1" },
        3: { cantiere: "Capannone Rossi", ore: "7,5" },
        4: { cantiere: " via roma 12 ", ore: "6", viaggio: "0,5" },
        5: { ore: "4" },
      },
    });
    expect(r.slice(37)).toEqual([
      [],
      ["", "Totale per cantiere"],
      ["", "Cantiere", "Ore lavorate", "Viaggio"],
      ["", "Via Roma 12", 14, 1.5],
      ["", "Capannone Rossi", 7.5, 0],
      ["", "(non indicato)", 4, 0],
    ]);
  });

  it("senza voce luogo, o con il mese vuoto, niente blocco per luogo", () => {
    expect(righeExcel({ ...base, entries: {} })).toHaveLength(5 + 30 + 2);
    const senzaLuogo = { ...config, voci: VOCI.filter((v) => v.tipo !== "luogo") };
    expect(righeExcel({ ...base, config: senzaLuogo, entries: { 2: { ore: "8" } } })).toHaveLength(5 + 30 + 2);
  });

  it("i dati di voci tolte dal modulo non finiscono nell'Excel", () => {
    const r = righeExcel({ ...base, entries: { 2: { ore: "8", cena: true } } });
    expect(r[6]).toHaveLength(2 + VOCI.length);
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
  const leggi = async (file) => XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array" }).Sheets.Ore;

  it("crea un .xlsx leggibile con i dati giusti", async () => {
    const file = creaFileExcel(base);
    expect(file.name).toBe("Ore_Mario_Rossi_Novembre_2026.xlsx");
    const ws = await leggi(file);
    expect(ws.A1.v).toBe("Azienda: Azienda di esempio S.r.l.");
    expect(ws.E5.v).toBe("Cantiere");
    expect(ws.E7.v).toBe("Via Roma 12");
    expect(ws.C7.t).toBe("n");
    expect(ws.C7.v).toBe(8);
  });

  it("testi che sembrano formule restano testo", async () => {
    const pericolosa = {
      ...config,
      azienda: { nome: "=HYPERLINK(\"http://x\")" },
      voci: [...VOCI.slice(0, 5), { id: "note", tipo: "note", nome: "=1+1" }],
    };
    const ws = await leggi(creaFileExcel({ ...base, config: pericolosa, entries: { 2: { note: "=SOMMA(A1:A9)", cantiere: "+39 Via" } } }));
    const celle = Object.entries(ws).filter(([k]) => !k.startsWith("!"));
    expect(celle.some(([, c]) => c.f)).toBe(false);
    expect(ws.H5).toMatchObject({ t: "s", v: "=1+1" });
    expect(ws.H7).toMatchObject({ t: "s", v: "=SOMMA(A1:A9)" });
    expect(ws.E7).toMatchObject({ t: "s", v: "+39 Via" });
  });
});
