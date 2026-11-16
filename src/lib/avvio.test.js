import { describe, it, expect } from "vitest";
import { scegliConfigurazione } from "./avvio.js";
import { configDaModello } from "./modelli.js";

const vecchia = configDaModello("generico", 1794816000);
const nuova = configDaModello("cantieri", 1794902400); // un giorno dopo
const linkOk = (config) => ({ ok: true, config });
const linkRotto = { ok: false, errore: "Il link contiene caratteri non validi" };

describe("scegliConfigurazione", () => {
  it("primo link valido: lo usa e lo salva", () => {
    expect(scegliConfigurazione({ dalLink: linkOk(nuova), salvata: null })).toEqual({
      config: nuova, salva: true, avviso: null, errore: null,
    });
  });

  it("link più recente di quello salvato: lo usa e lo salva", () => {
    const r = scegliConfigurazione({ dalLink: linkOk(nuova), salvata: vecchia });
    expect(r.config).toEqual(nuova);
    expect(r.salva).toBe(true);
  });

  it("stesso link già salvato: lo usa, niente da salvare", () => {
    const r = scegliConfigurazione({ dalLink: linkOk(nuova), salvata: nuova });
    expect(r).toEqual({ config: nuova, salva: false, avviso: null, errore: null });
  });

  it("stessa data ma contenuto diverso: vince il link", () => {
    const stessaData = { ...vecchia, ts: nuova.ts };
    const r = scegliConfigurazione({ dalLink: linkOk(nuova), salvata: stessaData });
    expect(r.config).toEqual(nuova);
    expect(r.salva).toBe(true);
  });

  it("link più vecchio (l'icona installata riparte dal primo link): resta quello salvato, senza avvisi", () => {
    expect(scegliConfigurazione({ dalLink: linkOk(vecchia), salvata: nuova })).toEqual({
      config: nuova, salva: false, avviso: null, errore: null,
    });
  });

  it("link non valido ma modulo già salvato: usa il salvato e avvisa", () => {
    const r = scegliConfigurazione({ dalLink: linkRotto, salvata: vecchia });
    expect(r.config).toEqual(vecchia);
    expect(r.salva).toBe(false);
    expect(r.avviso).toContain("caratteri non validi");
    expect(r.errore).toBeNull();
  });

  it("link non valido e niente salvato: errore del link con il dettaglio", () => {
    expect(scegliConfigurazione({ dalLink: linkRotto, salvata: null })).toEqual({
      config: null, salva: false, avviso: null, errore: { tipo: "link", dettaglio: linkRotto.errore },
    });
  });

  it("nessun link: usa il salvato", () => {
    expect(scegliConfigurazione({ dalLink: null, salvata: vecchia }).config).toEqual(vecchia);
  });

  it("nessun link e niente salvato: modulo mancante", () => {
    expect(scegliConfigurazione({ dalLink: null, salvata: null }).errore).toEqual({ tipo: "mancante", dettaglio: null });
  });

  it("un modulo salvato rovinato conta come mancante", () => {
    const rovinato = { v: 1, ts: 5, voci: "x" };
    expect(scegliConfigurazione({ dalLink: null, salvata: rovinato }).errore.tipo).toBe("mancante");
    expect(scegliConfigurazione({ dalLink: linkOk(vecchia), salvata: rovinato })).toMatchObject({ config: vecchia, salva: true });
  });
});
