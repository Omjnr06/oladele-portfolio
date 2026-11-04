const REGION_RULES = [
  ["Bay Area", /\b(san francisco|sf|bay area|san jose|palo alto|mountain view|sunnyvale|menlo park|santa clara|cupertino|redwood city|oakland|berkeley|san mateo|foster city|fremont|milpitas|south san francisco|emeryville|burlingame|san bruno|los gatos|campbell|pleasanton|san carlos|belmont)\b/],
  ["NYC", /\b(new york|nyc|ny|brooklyn|manhattan|jersey city|hoboken)\b/],
  ["Seattle", /\b(seattle|bellevue|redmond|kirkland)\b/],
  ["Austin", /\baustin\b/],
  ["Chicago", /\bchicago\b/],
  ["Boston", /\b(boston|cambridge, ma|somerville)\b/],
  ["LA", /^la$|\b(los angeles|santa monica|culver city|irvine|pasadena|playa vista|el segundo)\b/],
  ["Toronto", /\b(toronto|gta|mississauga|markham|waterloo|vaughan|oakville)\b/],
  ["Montreal", /\b(montreal|montréal)\b/],
  ["Vancouver", /\b(vancouver|burnaby)\b/],
  ["Remote", /\bremote\b/],
];

const US_STATES = "al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc";
const US_RE = new RegExp(`\\b(united states|usa|u\\.s\\.|us)\\b|,\\s*(${US_STATES})\\b`);
const CA_RE = /\b(canada|ontario|quebec|british columbia|alberta)\b|,\s*(on|qc|bc|ab|mb|ns|sk)\b/;
const UK_RE = /\b(united kingdom|uk|england|scotland|wales|northern ireland|gb|edinburgh|manchester|cambridge, uk|belfast|bristol)\b|\blondon\b(?!.*\b(on|ontario|canada)\b)/;

export const REGIONS = ["Bay Area", "NYC", "Seattle", "Austin", "Chicago", "Boston", "LA", "Toronto", "Montreal", "Vancouver", "Remote", "Other US", "Other Canada", "UK", "Elsewhere"];

export function regionsFor(location) {
  const loc = (location || "").toLowerCase();
  const out = [];
  for (const [name, re] of REGION_RULES) if (re.test(loc)) out.push(name);
  if (UK_RE.test(loc)) out.push("UK");
  if (!out.length || out.every((r) => r === "Remote")) {
    if (CA_RE.test(loc)) out.push("Other Canada");
    else if (US_RE.test(loc)) out.push("Other US");
  }
  if (!out.length) out.push("Elsewhere");
  return out;
}

export function seasonFor(raw) {
  const s = (raw || "").toLowerCase();
  const term = ["summer", "fall", "winter", "spring"].find((t) => s.includes(t));
  if (!term) return "Unspecified";
  const year = s.match(/20\d\d/)?.[0];
  const label = term[0].toUpperCase() + term.slice(1);
  return year ? `${label} ${year}` : label;
}

export function companyKey(name) {
  return (name || "").toLowerCase().replace(/[,.]|\b(inc|llc|ltd|corp|corporation|co)\b/g, "").replace(/\s+/g, " ").trim();
}
