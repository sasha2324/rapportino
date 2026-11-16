import { describe, it, expect } from "vitest";
import { guidaInstallazione, isInstallata, isIOS } from "./installazione.js";

const win = (standaloneMedia, standaloneIOS) => ({
  matchMedia: () => ({ matches: standaloneMedia }),
  navigator: { standalone: standaloneIOS },
});

describe("isInstallata", () => {
  it("vera se aperta come app (Android/desktop)", () => expect(isInstallata(win(true, undefined))).toBe(true));
  it("vera se aperta dalla Home di iPhone", () => expect(isInstallata(win(false, true))).toBe(true));
  it("falsa nel browser", () => expect(isInstallata(win(false, false))).toBe(false));
  it("falsa senza window", () => expect(isInstallata(null)).toBe(false));
});

describe("isIOS", () => {
  it("iPhone", () => expect(isIOS({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" })).toBe(true));
  it("iPad in modalità desktop", () => expect(isIOS({ userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 })).toBe(true));
  it("Mac", () => expect(isIOS({ userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 0 })).toBe(false));
  it("Android", () => expect(isIOS({ userAgent: "Mozilla/5.0 (Linux; Android 15)" })).toBe(false));
  it("Android emulato su Mac (platform MacIntel con touch)", () =>
    expect(isIOS({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8)", platform: "MacIntel", maxTouchPoints: 5 })).toBe(false));
  it("senza navigator", () => expect(isIOS(null)).toBe(false));
});

describe("guidaInstallazione", () => {
  const ua = (userAgent, extra = {}) => guidaInstallazione({ userAgent, ...extra });
  const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)";
  const ANDROID = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko)";

  it("iPhone con Safari", () => expect(ua(`${IPHONE} Version/26.1 Mobile/15E148 Safari/604.1`)).toBe("ios-safari"));
  it("iPhone con Chrome", () => expect(ua(`${IPHONE} CriOS/142.0.7444.46 Mobile/15E148 Safari/604.1`)).toBe("ios-chrome"));
  it("iPhone con Firefox", () => expect(ua(`${IPHONE} FxiOS/145.0 Mobile/15E148 Safari/605.1.15`)).toBe("ios-altro"));
  it("iPhone con Edge", () => expect(ua(`${IPHONE} EdgiOS/142.0 Mobile/15E148 Safari/605.1.15`)).toBe("ios-altro"));
  it("iPad in modalità desktop con Safari", () =>
    expect(ua("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/26.1 Safari/605.1.15", { platform: "MacIntel", maxTouchPoints: 5 })).toBe("ios-safari"));
  it("Android con Chrome", () => expect(ua(`${ANDROID} Chrome/142.0 Mobile Safari/537.36`)).toBe("android"));
  it("Android con Samsung Internet", () => expect(ua(`${ANDROID} SamsungBrowser/28.0 Chrome/130.0 Mobile Safari/537.36`)).toBe("android"));
  it("Instagram su iPhone", () => expect(ua(`${IPHONE} Mobile/15E148 Instagram 400.0.0`)).toBe("in-app"));
  it("Facebook su iPhone", () => expect(ua(`${IPHONE} Mobile/15E148 [FBAN/FBIOS;FBAV/500.0]`)).toBe("in-app"));
  it("WebView dentro un'app Android", () =>
    expect(ua("Mozilla/5.0 (Linux; Android 15; Pixel 9; wv) AppleWebKit/537.36 Version/4.0 Chrome/142.0 Mobile Safari/537.36")).toBe("in-app"));
  it("computer", () => expect(ua("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/142.0 Safari/537.36")).toBe("altro"));
  it("senza navigator", () => expect(guidaInstallazione(null)).toBe("altro"));
});
