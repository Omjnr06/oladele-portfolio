import { readFileSync } from "node:fs";
import { join } from "node:path";

const ratios = new Map();

function ratio(src) {
  if (!ratios.has(src)) {
    let r = 1;
    try {
      const buf = readFileSync(join(process.cwd(), "public", src));
      r = buf.readUInt32BE(16) / buf.readUInt32BE(20);
    } catch {}
    ratios.set(src, r);
  }
  return ratios.get(src);
}

export default function CompanyLogo({ src, className = "" }) {
  if (!src) return null;
  const style = { aspectRatio: ratio(src) };
  if (src.includes("-color")) {
    return <span aria-hidden className={`company-logo inline-block bg-contain bg-center bg-no-repeat ${className}`} style={{ ...style, backgroundImage: `url(${src})` }} />;
  }
  const mask = `url(${src}) center / contain no-repeat`;
  return <span aria-hidden className={`company-logo inline-block bg-current ${className}`} style={{ ...style, mask, WebkitMask: mask }} />;
}
