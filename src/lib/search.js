export const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();

const SCORES = {
  title: { exact: 120, prefix: 100, inner: 50, fuzzy: 60 },
  tags: { exact: 70, prefix: 55, fuzzy: 40 },
  keys: { exact: 60, prefix: 45, fuzzy: 30 },
  text: { exact: 35, prefix: 25, fuzzy: 12 },
};

const TYPE_BOOST = { page: 6, section: 4, project: 3, action: 2 };

function osa(a, b, max = 1) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let low = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1);
      d[i][j] = v;
      if (v < low) low = v;
    }
    if (low > max) return max + 1;
  }
  return d[a.length][b.length];
}

function matchKind(s, alt, { exactOnly, fuzzy, inner }) {
  if (!s) return null;
  const padded = ` ${s} `;
  if (padded.includes(` ${alt} `)) return { kind: "exact", word: alt };
  if (exactOnly) return null;
  if (padded.includes(` ${alt}`)) return { kind: "prefix", word: alt };
  if (inner && alt.length >= 3 && s.includes(alt)) return { kind: "inner", word: alt };
  if (fuzzy && alt.length >= 4 && !alt.includes(" ")) {
    for (const w of s.split(" ")) {
      if (osa(w, alt) <= 1) return { kind: "fuzzy", word: w };
      if (alt.length >= 5 && w.length > alt.length && osa(w.slice(0, alt.length), alt) <= 1) return { kind: "fuzzy", word: w };
    }
  }
  return null;
}

const tidy = (label) => (label === label.toUpperCase() || label === label.toLowerCase() ? label.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : label);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function quote(original, alt) {
  const re = new RegExp(`(^|[^a-z0-9])(${alt.split(" ").map(escape).join("[^a-z0-9]+")}[a-z0-9+#.]*)`, "i");
  const m = original.match(re);
  return m ? m[2].replace(/[.,;:]+$/, "") : alt;
}

export function prepare(data) {
  const groups = (data.aliases ?? []).map((g) => g.words.map(norm));
  const items = data.items.map((it) => ({
    ...it,
    _title: norm(it.title),
    _tags: (it.tags ?? []).map((label) => ({ label, n: norm(label) })),
    _keys: (it.keys ?? []).map((label) => ({ label, n: norm(label) })),
    _text: norm(it.text),
  }));
  return { items, groups, chips: data.chips ?? [] };
}

function terms(query, groups) {
  const q = norm(query);
  if (!q) return [];
  const whole = groups.find((g) => q.includes(" ") && g.includes(q));
  if (whole) return [{ alts: [q], aliasAlts: whole.filter((w) => w !== q) }];
  return q.split(" ").map((t) => {
    const alts = [t];
    if (t.length > 3 && t.endsWith("s")) alts.push(t.slice(0, -1));
    const g = groups.find((g) => alts.some((a) => g.includes(a)));
    return { alts, aliasAlts: g ? g.filter((w) => !alts.includes(w)) : [] };
  });
}

function bestFor(item, term) {
  let best = null;
  const consider = (score, why) => {
    if (!best || score > best.score) best = { score, why };
  };
  const tryAlt = (alt, aliased) => {
    const opts = { exactOnly: aliased, fuzzy: !aliased, inner: !aliased };
    const mult = aliased ? 0.5 : 1;
    const k = matchKind(item._title, alt, opts);
    if (k) consider(SCORES.title[k.kind] * mult, null);
    for (const t of item._tags) {
      const kk = matchKind(t.n, alt, opts);
      if (kk) consider(SCORES.tags[kk.kind] * mult, `uses ${t.label}`);
    }
    for (const t of item._keys) {
      const kk = matchKind(t.n, alt, opts);
      if (kk) consider(SCORES.keys[kk.kind] * mult, tidy(t.label));
    }
    const kt = matchKind(item._text, alt, opts);
    if (kt) consider(SCORES.text[kt.kind] * mult, `mentions ${quote(item.text, kt.word)}`);
  };
  term.alts.forEach((a) => tryAlt(a, false));
  term.aliasAlts.forEach((a) => tryAlt(a, true));
  return best;
}

export function search(index, query, { limit = 24, types = null } = {}) {
  const ts = terms(query, index.groups);
  if (!ts.length) return [];
  const out = [];
  for (const item of index.items) {
    if (types && !types.includes(item.type)) continue;
    let score = 0;
    let why = null;
    let ok = true;
    for (const t of ts) {
      const b = bestFor(item, t);
      if (!b) {
        ok = false;
        break;
      }
      score += b.score;
      if (!why && b.why) why = b.why;
    }
    if (ok) out.push({ item, score: score + (TYPE_BOOST[item.type] ?? 0), why });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function parseCommand(query) {
  const m = /^\s*(cd|open|go)\s+(.*)$/i.exec(query);
  if (!m) return { query, command: null };
  const rest = m[2].trim();
  if (rest === ".." || rest === "../") return { query: "", command: "up" };
  if (rest === "/" || rest === "~" || rest === "~/") return { query: "home", command: "cd" };
  return { query: rest.replace(/^~?\/+/, "").replace(/\/+$/, ""), command: "cd" };
}
