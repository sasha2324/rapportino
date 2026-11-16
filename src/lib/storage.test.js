import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { clear } from "idb-keyval";
import {
  caricaMese, salvaMese, caricaImpostazioni, salvaImpostazioni,
  caricaLuoghi, salvaLuoghi, caricaConfigurazione, salvaConfigurazione, chiediPersistenza,
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

  it("configurazione del modulo: nessuna all'inizio, poi quella salvata", async () => {
    expect(await caricaConfigurazione()).toBeNull();
    const config = { v: 1, ts: 1794816000, voci: [{ id: "ore", tipo: "ore", nome: "Ore" }] };
    await salvaConfigurazione(config);
    expect(await caricaConfigurazione()).toEqual(config);
  });

  it("i dati dei mesi restano quando cambia la configurazione", async () => {
    await salvaMese(2026, 10, { 2: { ore: "8", cena: true } });
    await salvaConfigurazione({ v: 1, ts: 1794816000, voci: [{ id: "ore", tipo: "ore", nome: "Ore" }] });
    expect(await caricaMese(2026, 10)).toEqual({ 2: { ore: "8", cena: true } });
  });

  it("elenco dei luoghi", async () => {
    expect(await caricaLuoghi()).toEqual([]);
    await salvaLuoghi([{ nome: "Via Roma 12", ultimoUso: 1 }]);
    expect(await caricaLuoghi()).toEqual([{ nome: "Via Roma 12", ultimoUso: 1 }]);
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
