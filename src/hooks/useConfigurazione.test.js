// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";

const memoria = vi.hoisted(() => ({ config: null }));
vi.mock("../lib/storage.js", () => ({
  caricaConfigurazione: vi.fn(async () => memoria.config),
  salvaConfigurazione: vi.fn(async (c) => {
    memoria.config = c;
  }),
}));

import { salvaConfigurazione } from "../lib/storage.js";
import { useConfigurazione } from "./useConfigurazione.js";
import { codifica } from "../lib/link.js";
import { configDaModello } from "../lib/modelli.js";

const vecchia = configDaModello("generico", 1794816000);
const nuova = configDaModello("cantieri", 1794902400);

function monta(hash) {
  return renderHook(() => useConfigurazione({ leggiHash: () => hash }));
}
const pronto = (result) => waitFor(() => expect(result.current.caricamento).toBe(false));

beforeEach(() => {
  memoria.config = null;
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("useConfigurazione", () => {
  it("prende il modulo dal link e lo salva", async () => {
    const { result } = monta(`#${codifica(nuova)}`);
    expect(result.current.caricamento).toBe(true);
    await pronto(result);
    expect(result.current.config).toEqual(nuova);
    expect(memoria.config).toEqual(nuova);
  });

  it("senza link usa quello salvato e non risalva", async () => {
    memoria.config = vecchia;
    const { result } = monta("");
    await pronto(result);
    expect(result.current.config).toEqual(vecchia);
    expect(salvaConfigurazione).not.toHaveBeenCalled();
  });

  it("link rotto e niente salvato: errore con il dettaglio", async () => {
    const { result } = monta("#abc+def");
    await pronto(result);
    expect(result.current.config).toBeNull();
    expect(result.current.errore).toEqual({ tipo: "link", dettaglio: "Il link contiene caratteri non validi" });
  });

  it("aggiornaDaLink: accetta un link valido e più recente, incollato intero", async () => {
    memoria.config = vecchia;
    const { result } = monta("");
    await pronto(result);
    let esito;
    await act(async () => {
      esito = await result.current.aggiornaDaLink(` https://x.example/app/#${codifica(nuova)} `);
    });
    expect(esito).toEqual({ ok: true });
    expect(result.current.config).toEqual(nuova);
    expect(memoria.config).toEqual(nuova);
  });

  it("aggiornaDaLink: rifiuta link non validi o più vecchi, senza toccare niente", async () => {
    memoria.config = nuova;
    const { result } = monta("");
    await pronto(result);
    let esito;
    await act(async () => {
      esito = await result.current.aggiornaDaLink("ciao");
    });
    expect(esito.ok).toBe(false);
    await act(async () => {
      esito = await result.current.aggiornaDaLink(codifica(vecchia));
    });
    expect(esito).toEqual({ ok: false, errore: "Questo modulo è più vecchio di quello che stai usando." });
    expect(result.current.config).toEqual(nuova);
    expect(salvaConfigurazione).not.toHaveBeenCalled();
  });
});
