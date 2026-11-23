import { setPrefs } from "@/lib/prefs";

export function reloadClean() {
  const url = new URL(location.href);
  url.searchParams.delete("theme");
  url.searchParams.delete("preview");
  location.replace(url.pathname + url.search + url.hash);
}

export function leaveTo(pack, variant) {
  setPrefs({ pack, variant });
  reloadClean();
}
