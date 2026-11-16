let probe = null;

export function tokenRgb(name) {
  if (typeof document === "undefined") return [0, 0, 0];
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
  if (!probe) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    probe = c.getContext("2d", { willReadFrequently: true });
  }
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = raw || "#000";
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

export function rgba([r, g, b], a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function onThemeChange(cb) {
  if (typeof MutationObserver === "undefined") return () => {};
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-pack"] });
  return () => obs.disconnect();
}
