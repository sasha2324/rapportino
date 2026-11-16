import { describe, it, expect, vi } from "vitest";
import { condividiOScarica } from "./share.js";

const file = new File(["x"], "prova.xlsx");

describe("condividiOScarica", () => {
  it("apre il menu Condividi se il telefono lo permette", async () => {
    const nav = { canShare: vi.fn(() => true), share: vi.fn(async () => {}) };
    const scarica = vi.fn();
    await expect(condividiOScarica(file, { nav, scarica })).resolves.toBe("condiviso");
    expect(nav.canShare).toHaveBeenCalledWith({ files: [file] });
    expect(nav.share).toHaveBeenCalledWith({ files: [file] });
    expect(scarica).not.toHaveBeenCalled();
  });

  it("se il dipendente chiude il menu non fa niente", async () => {
    const nav = { canShare: () => true, share: vi.fn(async () => { throw new DOMException("chiuso", "AbortError"); }) };
    const scarica = vi.fn();
    await expect(condividiOScarica(file, { nav, scarica })).resolves.toBe("annullato");
    expect(scarica).not.toHaveBeenCalled();
  });

  it("se la condivisione dà errore scarica il file", async () => {
    const nav = { canShare: () => true, share: vi.fn(async () => { throw new DOMException("no", "NotAllowedError"); }) };
    const scarica = vi.fn();
    await expect(condividiOScarica(file, { nav, scarica })).resolves.toBe("scaricato");
    expect(scarica).toHaveBeenCalledWith(file);
  });

  it("se il telefono non condivide file scarica", async () => {
    const scarica = vi.fn();
    await expect(condividiOScarica(file, { nav: { canShare: () => false, share: vi.fn() }, scarica })).resolves.toBe("scaricato");
    await expect(condividiOScarica(file, { nav: {}, scarica })).resolves.toBe("scaricato");
    expect(scarica).toHaveBeenCalledTimes(2);
  });
});
