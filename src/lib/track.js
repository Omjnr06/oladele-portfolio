const off = () => {
  if (typeof navigator === "undefined") return true;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1") return true;
  if (navigator.webdriver) return true;
  const h = location.hostname;
  return h === "localhost" || h === "127.0.0.1";
};

export function track(type, name) {
  try {
    if (off()) return;
    const d = document.documentElement;
    const body = JSON.stringify({ type, name, pack: d.dataset.pack, variant: d.dataset.theme, path: location.pathname });
    navigator.sendBeacon?.("/api/event", new Blob([body], { type: "text/plain" }));
  } catch {}
}
