export function isInstallata(win = globalThis.window) {
  if (!win) return false;
  return Boolean(win.matchMedia?.("(display-mode: standalone)").matches || win.navigator?.standalone === true);
}

export function isIOS(nav = globalThis.navigator) {
  if (!nav) return false;
  const ua = nav.userAgent || "";
  if (/Android/i.test(ua)) return false;
  return /iPad|iPhone|iPod/.test(ua) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
}

/** Browser dentro altre app (Facebook, Instagram, LINE, WebView di Android): da lì non si installa. */
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Line\/|; wv\)/i;

/**
 * Quale guida all'installazione mostrare per questo telefono e browser:
 * "in-app", "ios-safari", "ios-chrome", "ios-altro", "android" oppure "altro".
 */
export function guidaInstallazione(nav = globalThis.navigator) {
  const ua = nav?.userAgent || "";
  if (IN_APP.test(ua)) return "in-app";
  if (isIOS(nav)) {
    if (/CriOS/.test(ua)) return "ios-chrome";
    if (/FxiOS|EdgiOS|OPiOS/.test(ua)) return "ios-altro";
    return "ios-safari";
  }
  if (/Android/i.test(ua)) return "android";
  return "altro";
}
