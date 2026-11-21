import { setPrefs } from "./prefs";
import { themeTransition } from "./themeTransition";
import { PACK_BOOT_EVENT } from "./events";

const key = (pack) => `omj-booted-${pack}`;

export function markPackBooted(pack) {
  try {
    sessionStorage.setItem(key(pack), "1");
  } catch {}
}

function wantsPackBoot(pack) {
  if (pack === "windows" || navigator.webdriver || matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !sessionStorage.getItem(key(pack));
  } catch {
    return false;
  }
}

export function switchTheme(event, patch) {
  const current = document.documentElement.dataset.pack;
  if (patch.pack && patch.pack !== current && wantsPackBoot(patch.pack)) {
    markPackBooted(patch.pack);
    document.documentElement.setAttribute("data-pack-boot", patch.pack);
    setPrefs(patch);
    window.dispatchEvent(new CustomEvent(PACK_BOOT_EVENT, { detail: patch.pack }));
    return true;
  }
  themeTransition(event, () => setPrefs(patch));
  return false;
}
