// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import AvvisoInstalla from "./AvvisoInstalla.jsx";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)";
const SAFARI = `${IPHONE} Version/26.1 Mobile/15E148 Safari/604.1`;
const CHROME_IPHONE = `${IPHONE} CriOS/142.0.7444.46 Mobile/15E148 Safari/604.1`;
const ANDROID = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Mobile Safari/537.36";
const INSTAGRAM = `${IPHONE} Mobile/15E148 Instagram 400.0.0`;

function conUserAgent(ua) {
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(ua);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AvvisoInstalla", () => {
  it("iPhone con Safari: passi con Condividi, il menu ≡ o ⋯ e Aggiungi alla schermata Home", () => {
    conUserAgent(SAFARI);
    render(<AvvisoInstalla />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/tocca prima/).textContent).toContain("barra dell'indirizzo");
    expect(screen.getAllByText("Aggiungi alla schermata Home")).toHaveLength(1);
    expect(screen.getByText(/Non trovi la voce/)).toBeTruthy();
  });

  it("iPhone con Chrome: Condividi è in alto, accanto all'indirizzo", () => {
    conUserAgent(CHROME_IPHONE);
    render(<AvvisoInstalla />);
    expect(screen.getByText(/accanto all'indirizzo/)).toBeTruthy();
  });

  it("Android senza pulsante: passi dal menu ⋮", () => {
    conUserAgent(ANDROID);
    render(<AvvisoInstalla />);
    expect(screen.getByText("Installa app")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Installa Rapportino/ })).toBeNull();
  });

  it("Android con Chrome: un pulsante Installa Rapportino apre la finestra del telefono", async () => {
    conUserAgent(ANDROID);
    render(<AvvisoInstalla />);
    const evento = new Event("beforeinstallprompt", { cancelable: true });
    evento.prompt = vi.fn();
    evento.userChoice = Promise.resolve({ outcome: "accepted" });
    act(() => window.dispatchEvent(evento));

    const pulsante = screen.getByRole("button", { name: /Installa Rapportino/ });
    expect(screen.queryByRole("list")).toBeNull();
    await act(async () => fireEvent.click(pulsante));

    expect(evento.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("dentro Instagram: spiega di aprire il link nel browser", () => {
    conUserAgent(INSTAGRAM);
    render(<AvvisoInstalla />);
    expect(screen.getByText(/aprire il link nel browser/)).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("«Più tardi» nasconde l'avviso", () => {
    conUserAgent(SAFARI);
    render(<AvvisoInstalla />);
    fireEvent.click(screen.getByRole("button", { name: "Più tardi" }));
    expect(screen.queryByRole("note")).toBeNull();
  });
});
