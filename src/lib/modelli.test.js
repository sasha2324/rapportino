import { describe, it, expect } from "vitest";
import { MODELLI, configDaModello } from "./modelli.js";
import { validaConfigurazione } from "./configurazione.js";

const TS = 1794816000;
const nomi = (id) => configDaModello(id, TS).voci.map((v) => `${v.tipo}:${v.nome}`);

describe("modelli pronti", () => {
  it("sono quattro, in quest'ordine", () => {
    expect(MODELLI.map((m) => m.nome)).toEqual(["Cantieri", "Impianti e manutenzione", "Consegne", "Generico"]);
  });

  it("ognuno dà una configurazione valida", () => {
    for (const m of MODELLI) {
      const config = configDaModello(m.id, TS);
      expect(validaConfigurazione(config)).toEqual({ ok: true, config });
    }
  });

  it("le voci di ogni modello", () => {
    expect(nomi("cantieri")).toEqual([
      "ore:Ore lavorate", "ore:Viaggio", "luogo:Cantiere",
      "si_no:Pranzo", "si_no:Cena", "si_no:Pernottamento", "si_no:Scontrini", "note:Note",
    ]);
    expect(nomi("impianti")).toEqual([
      "ore:Ore lavorate", "ore:Viaggio", "luogo:Cliente", "numero:Km", "si_no:Scontrini", "si_no:Pranzo", "note:Note",
    ]);
    expect(nomi("consegne")).toEqual([
      "ore:Ore lavorate", "luogo:Giro", "numero:Km", "numero:Consegne", "si_no:Pranzo", "note:Note",
    ]);
    expect(nomi("generico")).toEqual(["ore:Ore lavorate", "luogo:Sede", "note:Note"]);
  });

  it("ogni configurazione è una copia: cambiarla non tocca il modello", () => {
    const a = configDaModello("generico", TS);
    a.voci[0].nome = "Cambiato";
    expect(configDaModello("generico", TS).voci[0].nome).toBe("Ore lavorate");
  });

  it("modello sconosciuto: errore", () => {
    expect(() => configDaModello("nessuno", TS)).toThrow();
  });
});
