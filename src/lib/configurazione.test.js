import { describe, it, expect } from "vitest";
import {
  controllaCampoAzienda,
  idDaNome,
  righeAzienda,
  validaConfigurazione,
} from "./configurazione.js";

const TS = 1794816000; // 16/11/2026, 8:00 UTC

function valida() {
  return {
    v: 1,
    ts: TS,
    azienda: {
      nome: "Azienda di esempio S.r.l.",
      sede: "Via Esempio 1, Città",
      piva: "12345678903",
      sdi: "ABC1234",
      email: "ufficio@example.com",
      tel: "+39 000 000000",
    },
    voci: [
      { id: "ore", tipo: "ore", nome: "Ore lavorate" },
      { id: "viaggio", tipo: "ore", nome: "Viaggio" },
      { id: "cliente", tipo: "luogo", nome: "Cliente" },
      { id: "km", tipo: "numero", nome: "Km", unita: "km" },
      { id: "pranzo", tipo: "si_no", nome: "Pranzo" },
      { id: "note", tipo: "note", nome: "Note" },
    ],
  };
}

/** La configurazione valida con una modifica; `undefined` toglie la chiave. */
function con(modifica) {
  const c = valida();
  modifica(c);
  return c;
}

const rifiuta = (dato, frammento) => {
  const r = validaConfigurazione(dato);
  expect(r.ok).toBe(false);
  expect(r.errore).toContain(frammento);
};

const voci = (tipo, n) => Array.from({ length: n }, (_, i) => ({ id: `${tipo.replace("_", "")}${i}`, tipo, nome: `${tipo} ${i}` }));
const oreMinima = { id: "ore", tipo: "ore", nome: "Ore" };

describe("validaConfigurazione: casi validi", () => {
  it("accetta la configurazione completa e ne restituisce una copia", () => {
    const dato = valida();
    const r = validaConfigurazione(dato);
    expect(r).toEqual({ ok: true, config: valida() });
    expect(r.config).not.toBe(dato);
  });

  it("azienda facoltativa, e ogni suo campo facoltativo", () => {
    expect(validaConfigurazione(con((c) => delete c.azienda)).ok).toBe(true);
    const r = validaConfigurazione(con((c) => (c.azienda = { nome: "Solo il nome" })));
    expect(r.ok).toBe(true);
    expect(r.config.azienda).toEqual({ nome: "Solo il nome" });
  });

  it("campi dell'azienda vuoti: tolti dalla copia; azienda tutta vuota: tolta", () => {
    const r = validaConfigurazione(con((c) => (c.azienda = { nome: "  ", sede: "" })));
    expect(r.ok).toBe(true);
    expect(r.config).not.toHaveProperty("azienda");
  });

  it("toglie gli spazi ai lati di nomi e dati", () => {
    const r = validaConfigurazione(con((c) => {
      c.voci[0].nome = "  Ore lavorate ";
      c.azienda.nome = " Azienda di esempio S.r.l. ";
    }));
    expect(r.config.voci[0].nome).toBe("Ore lavorate");
    expect(r.config.azienda.nome).toBe("Azienda di esempio S.r.l.");
  });

  it("un nome con HTML è solo testo: valido e lasciato com'è", () => {
    const html = "<img src=x onerror=1>";
    const r = validaConfigurazione(con((c) => (c.voci[4].nome = html)));
    expect(r.ok).toBe(true);
    expect(r.config.voci[4].nome).toBe(html);
  });

  it("i nomi lunghi 30 caratteri vanno bene, anche con accenti ed emoji", () => {
    const nome = "è".repeat(29) + "🚚";
    expect(validaConfigurazione(con((c) => (c.voci[0].nome = nome))).ok).toBe(true);
  });

  it("basta una voce, di tipo ore", () => {
    expect(validaConfigurazione({ v: 1, ts: TS, voci: [oreMinima] }).ok).toBe(true);
  });

  it("limiti per tipo raggiunti ma non superati", () => {
    const tutte = [...voci("ore", 3), ...voci("luogo", 1), ...voci("numero", 5), ...voci("si_no", 10), ...voci("note", 1)];
    expect(tutte).toHaveLength(20);
    expect(validaConfigurazione({ v: 1, ts: TS, voci: tutte }).ok).toBe(true);
  });
});

describe("validaConfigurazione: rifiuti", () => {
  it("la radice deve essere un oggetto", () => {
    for (const dato of [null, 1, "x", [], undefined]) rifiuta(dato, "non è un modulo");
  });

  it("chiavi sconosciute", () => {
    rifiuta(con((c) => (c.colore = "rosso")), "colore");
    rifiuta(con((c) => (c.azienda.iban = "IT00")), "iban");
    rifiuta(con((c) => (c.voci[0].extra = 1)), "extra");
    rifiuta(JSON.parse('{"v":1,"ts":1794816000,"voci":[],"__proto__":{"x":1}}'), "__proto__");
  });

  it("versione e data", () => {
    rifiuta(con((c) => (c.v = 2)), "versione");
    rifiuta(con((c) => delete c.v), "versione");
    rifiuta(con((c) => (c.ts = "oggi")), "data");
    rifiuta(con((c) => (c.ts = 1.5 + TS)), "data");
    rifiuta(con((c) => (c.ts = 1000)), "data");
    rifiuta(con((c) => (c.ts = 5000000000)), "data");
    rifiuta(con((c) => delete c.ts), "data");
  });

  it("elenco delle voci", () => {
    rifiuta(con((c) => (c.voci = {})), "voci");
    rifiuta(con((c) => delete c.voci), "voci");
    rifiuta(con((c) => (c.voci = [])), "almeno una voce");
    rifiuta({ v: 1, ts: TS, voci: [...voci("ore", 3), ...voci("si_no", 10), ...voci("numero", 5), ...voci("note", 1), ...voci("luogo", 1), oreMinima] }, "al massimo 20");
    rifiuta(con((c) => (c.voci[2] = "Cliente")), "Voce 3");
  });

  it("tipi e limiti per tipo", () => {
    rifiuta(con((c) => (c.voci[0].tipo = "data")), "tipo sconosciuto");
    rifiuta({ v: 1, ts: TS, voci: voci("note", 1) }, "almeno una voce di tipo ore");
    rifiuta({ v: 1, ts: TS, voci: voci("ore", 4) }, "al massimo 3 voci di tipo ore");
    rifiuta({ v: 1, ts: TS, voci: [oreMinima, ...voci("luogo", 2)] }, "al massimo 1 voce di tipo luogo");
    rifiuta({ v: 1, ts: TS, voci: [oreMinima, ...voci("numero", 6)] }, "al massimo 5 voci di tipo numero");
    rifiuta({ v: 1, ts: TS, voci: [oreMinima, ...voci("si_no", 11)] }, "al massimo 10 voci di tipo sì/no");
    rifiuta({ v: 1, ts: TS, voci: [oreMinima, ...voci("note", 2)] }, "al massimo 1 voce di tipo note");
  });

  it("id delle voci", () => {
    rifiuta(con((c) => (c.voci[1].id = "ore")), "ripetuto");
    for (const id of ["", "Ore", "1ore", "ore lavorate", "a".repeat(21), 7]) {
      rifiuta(con((c) => (c.voci[0].id = id)), "Voce 1: codice");
    }
  });

  it("nomi delle voci", () => {
    rifiuta(con((c) => (c.voci[0].nome = "   ")), "Voce 1: nome vuoto");
    rifiuta(con((c) => (c.voci[0].nome = "x".repeat(31))), "Voce 1: nome troppo lungo, massimo 30 caratteri");
    rifiuta(con((c) => (c.voci[0].nome = "Ore\nlavorate")), "caratteri non ammessi");
    rifiuta(con((c) => (c.voci[0].nome = "Ore\u0007")), "caratteri non ammessi");
    rifiuta(con((c) => (c.voci[0].nome = 5)), "Voce 1: nome");
  });

  it("unità solo per i numeri, al massimo 8 caratteri", () => {
    rifiuta(con((c) => (c.voci[0].unita = "h")), "Voce 1: l'unità");
    rifiuta(con((c) => (c.voci[3].unita = "chilometri")), "Voce 4: unità troppo lunga");
  });

  it("dati dell'azienda", () => {
    rifiuta(con((c) => (c.azienda = "Azienda")), "dati dell'azienda");
    rifiuta(con((c) => (c.azienda.nome = "x".repeat(81))), "Ragione sociale: troppo lunga");
    rifiuta(con((c) => (c.azienda.sede = "x".repeat(121))), "Sede: troppo lunga");
    rifiuta(con((c) => (c.azienda.piva = "12345678904")), "Partita IVA: la cifra di controllo non torna");
    rifiuta(con((c) => (c.azienda.piva = "1234567890")), "Partita IVA: servono 11 cifre");
    rifiuta(con((c) => (c.azienda.sdi = "ABC123")), "Codice SDI: servono 7 lettere o cifre");
    rifiuta(con((c) => (c.azienda.email = "ufficio.example.com")), "Email: non sembra un indirizzo email");
    rifiuta(con((c) => (c.azienda.tel = "chiamami")), "Telefono");
    rifiuta(con((c) => (c.azienda.nome = 12)), "Ragione sociale");
    rifiuta(con((c) => (c.azienda.sede = "Via\u0000Roma")), "caratteri non ammessi");
  });
});

describe("controllaCampoAzienda", () => {
  it("vuoto va bene (il campo è facoltativo)", () => {
    expect(controllaCampoAzienda("piva", "")).toBeNull();
    expect(controllaCampoAzienda("email", "   ")).toBeNull();
  });

  it("restituisce il problema senza l'etichetta", () => {
    expect(controllaCampoAzienda("piva", "12345678903")).toBeNull();
    expect(controllaCampoAzienda("piva", "12345678904")).toBe("la cifra di controllo non torna");
    expect(controllaCampoAzienda("sdi", "abc1234")).toBeNull();
    expect(controllaCampoAzienda("tel", "0744/123.456")).toBeNull();
  });
});

describe("righeAzienda", () => {
  it("solo i campi presenti, nell'ordine, con le etichette", () => {
    expect(righeAzienda({ email: "a@example.com", nome: "Esempio" })).toEqual([
      { chiave: "nome", etichetta: "Ragione sociale", valore: "Esempio" },
      { chiave: "email", etichetta: "Email", valore: "a@example.com" },
    ]);
    expect(righeAzienda(undefined)).toEqual([]);
  });
});

describe("idDaNome", () => {
  it("minuscole, trattini, senza accenti", () => {
    expect(idDaNome("Ore lavorate", [])).toBe("ore-lavorate");
    expect(idDaNome("Città / Località", [])).toBe("citta-localita");
  });

  it("comincia con una lettera, massimo 20 caratteri, mai vuoto", () => {
    expect(idDaNome("24 ore", [])).toBe("v-24-ore");
    expect(idDaNome("Un nome davvero molto lungo", [])).toBe("un-nome-davvero-molt");
    expect(idDaNome("🚚", [])).toBe("voce");
  });

  it("aggiunge un numero se l'id è già usato", () => {
    expect(idDaNome("Km", ["km"])).toBe("km-2");
    expect(idDaNome("Km", ["km", "km-2"])).toBe("km-3");
    expect(idDaNome("Un nome davvero molto lungo", ["un-nome-davvero-molt"])).toBe("un-nome-davvero-mo-2");
  });

  it("gli id creati passano i controlli", () => {
    for (const nome of ["Ore lavorate", "24 ore", "🚚", "Città", "Un nome davvero molto lungo"]) {
      const id = idDaNome(nome, []);
      expect(validaConfigurazione({ v: 1, ts: TS, voci: [{ id, tipo: "ore", nome: "Ore" }] }).ok).toBe(true);
    }
  });
});
