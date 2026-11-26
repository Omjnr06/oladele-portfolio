import { savePrefs } from "@/lib/prefs";

export function reloadClean() {
  const url = new URL(location.href);
  url.searchParams.delete("theme");
  url.searchParams.delete("preview");
  location.replace(url.pathname + url.search + url.hash);
}

export function leaveTo(pack, variant) {
  savePrefs({ pack, variant });
  reloadClean();
}

export function restartToMenu() {
  try {
    sessionStorage.setItem("omj-boot-menu", "windows");
    sessionStorage.removeItem("omj-win-booted");
  } catch {}
  location.replace("/");
}
