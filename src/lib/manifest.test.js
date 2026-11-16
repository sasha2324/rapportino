// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { applicaManifest, creaManifest } from "./manifest.js";
import { decodifica } from "./link.js";
import { configDaModello } from "./modelli.js";

const ORIGINE = "https://rapportino.example";
const config = { ...configDaModello("generico", 1794816000), azienda: { nome: "Azienda <b>di</b> esempio" } };

describe("creaManifest", () => {
  it("l'app installata riparte dal link del modulo in uso", () => {
    const m = creaManifest({ config, origine: ORIGINE });
    expect(m.start_url.startsWith(`${ORIGINE}/app/#`)).toBe(true);
    expect(decodifica(m.start_url.split("#")[1]).config).toEqual(config);
    expect(m.scope).toBe(`${ORIGINE}/app/`);
    expect(m.id).toBe(`${ORIGINE}/app/`);
    expect(m.display).toBe("standalone");
  });

  it("nome con l'azienda, nome breve fisso, icone con indirizzo completo", () => {
    const m = creaManifest({ config, origine: ORIGINE });
    expect(m.name).toBe("Azienda <b>di</b> esempio – Rapportino");
    expect(m.short_name).toBe("Rapportino");
    expect(m.icons.map((i) => i.src)).toEqual([
      `${ORIGINE}/icons/icon-192.png`,
      `${ORIGINE}/icons/icon-512.png`,
      `${ORIGINE}/icons/icon-maskable-512.png`,
    ]);
    expect(creaManifest({ config: configDaModello("generico", 1794816000), origine: ORIGINE }).name).toBe("Rapportino");
  });
});

describe("applicaManifest", () => {
  it("mette un solo <link rel=manifest> con un Blob JSON, e libera quello di prima", async () => {
    const crea = vi.fn().mockReturnValueOnce("blob:uno").mockReturnValueOnce("blob:due");
    const libera = vi.fn();
    const url = { createObjectURL: crea, revokeObjectURL: libera };
    applicaManifest(config, { origine: ORIGINE, url });
    applicaManifest(config, { origine: ORIGINE, url });
    const link = document.querySelectorAll('link[rel="manifest"]');
    expect(link).toHaveLength(1);
    expect(link[0].getAttribute("href")).toBe("blob:due");
    expect(libera).toHaveBeenCalledWith("blob:uno");
    const blob = crea.mock.calls[0][0];
    expect(blob.type).toBe("application/manifest+json");
    expect(JSON.parse(await blob.text()).name).toBe("Azienda <b>di</b> esempio – Rapportino");
  });
});
