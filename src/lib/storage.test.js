import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { clear } from "idb-keyval";
import {
  caricaMese, salvaMese, caricaImpostazioni, salvaImpostazioni,
  caricaCantieri, salvaCantieri, chiediPersistenza,
} from "./storage.js";

beforeEach(async () => {
  await clear();
});

describe("storage", () => {
  it("un mese mai salvato è vuoto", async () => {
    expect(await caricaMese(2026, 10)).toEqual({});
  });

  it("salva e rilegge un mese, separato dagli altri", async () => {
    await salvaMese(2026, 10, { 2: { oreLav: "8" } });
    expect(await caricaMese(2026, 10)).toEqual({ 2: { oreLav: "8" } });
    expect(await caricaMese(2026, 11)).toEqual({});
  });

  it("impostazioni con nome vuoto di partenza", async () => {
    expect(await caricaImpostazioni()).toEqual({ employeeName: "" });
    await salvaImpostazioni({ employeeName: "Mario Rossi" });
    expect(await caricaImpostazioni()).toEqual({ employeeName: "Mario Rossi" });
  });

  it("elenco cantieri", async () => {
    expect(await caricaCantieri()).toEqual([]);
    await salvaCantieri([{ nome: "Via Roma 12", ultimoUso: 1 }]);
    expect(await caricaCantieri()).toEqual([{ nome: "Via Roma 12", ultimoUso: 1 }]);
  });
});

describe("chiediPersistenza", () => {
  it("chiede la persistenza se non c'è già", async () => {
    const storage = { persisted: vi.fn(async () => false), persist: vi.fn(async () => true) };
    expect(await chiediPersistenza(storage)).toBe(true);
    expect(storage.persist).toHaveBeenCalled();
  });

  it("non la richiede se c'è già", async () => {
    const storage = { persisted: vi.fn(async () => true), persist: vi.fn() };
    expect(await chiediPersistenza(storage)).toBe(true);
    expect(storage.persist).not.toHaveBeenCalled();
  });

  it("falsa se il browser non la supporta o dà errore", async () => {
    expect(await chiediPersistenza(null)).toBe(false);
    expect(await chiediPersistenza({ persisted: async () => false, persist: async () => { throw new Error("no"); } })).toBe(false);
  });
});
