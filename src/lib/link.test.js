import { describe, it, expect } from "vitest";
import { codifica, decodifica, linkApp, MAX_LINK, testoDaLink } from "./link.js";

const TS = 1794816000;
const config = {
  v: 1,
  ts: TS,
  azienda: { nome: "Società Ölmühle «Prova» 🚚" },
  voci: [
    { id: "ore", tipo: "ore", nome: "Ore lavorate" },
    { id: "luogo", tipo: "luogo", nome: "Località" },
    { id: "km", tipo: "numero", nome: "Km", unita: "km" },
  ],
};

/** base64url di un testo qualsiasi, per costruire link "manomessi" nei test. */
const b64 = (testo) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(testo)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

describe("codifica / decodifica", () => {
  it("andata e ritorno con accenti, simboli ed emoji", () => {
    const testo = codifica(config);
    expect(testo).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodifica(testo)).toEqual({ ok: true, config });
  });

  it("il risultato passa sempre dai controlli della configurazione", () => {
    const r = decodifica(b64(JSON.stringify({ ...config, v: 2 })));
    expect(r).toEqual({ ok: false, errore: "La versione del modulo non è supportata" });
  });

  it("rifiuta un link vuoto o troppo lungo", () => {
    expect(decodifica("").ok).toBe(false);
    const lungo = decodifica("A".repeat(MAX_LINK + 1));
    expect(lungo.ok).toBe(false);
    expect(lungo.errore).toContain("troppo lungo");
  });

  it("rifiuta caratteri fuori da base64url", () => {
    for (const t of ["abc+def", "abc/def", "abc=", "<script>", "abc def"]) {
      expect(decodifica(t).errore).toContain("caratteri non validi");
    }
  });

  it("rifiuta base64 di lunghezza impossibile", () => {
    expect(decodifica("abcde").ok).toBe(false);
  });

  it("rifiuta testo che non è UTF-8 valido", () => {
    const rotto = btoa(String.fromCharCode(0xff, 0xfe, 0xfd)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(decodifica(rotto).errore).toContain("leggibile");
  });

  it("rifiuta JSON non valido", () => {
    expect(decodifica(b64("{v:1")).errore).toContain("leggibile");
  });
});

describe("linkApp", () => {
  it("indirizzo dell'app con la configurazione dopo il #", () => {
    const link = linkApp(config, "https://rapportino.example");
    expect(link.startsWith("https://rapportino.example/app/#")).toBe(true);
    expect(decodifica(link.split("#")[1]).config).toEqual(config);
  });
});

describe("testoDaLink", () => {
  it("accetta il link intero, la parte dopo # o solo il codice, con spazi ai lati", () => {
    expect(testoDaLink(" https://x.example/app/#abc_-1 ")).toBe("abc_-1");
    expect(testoDaLink("#abc")).toBe("abc");
    expect(testoDaLink("abc")).toBe("abc");
    expect(testoDaLink("")).toBe("");
    expect(testoDaLink(undefined)).toBe("");
  });
});
