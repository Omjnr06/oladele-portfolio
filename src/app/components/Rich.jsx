const TOKEN = /\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;

export function plainText(text) {
  return text.replace(TOKEN, (_, em, label) => em ?? label);
}

export default function Rich({ text, em, link }) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<span key={m.index} className={em}>{m[1]}</span>);
    } else {
      const external = /^https?:/.test(m[3]);
      out.push(
        <a key={m.index} href={m[3]} className={link} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {m[2]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
