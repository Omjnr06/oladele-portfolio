export default function TypedText({ text, className = "", start = 0.15, step = 0.05, label = true }) {
  return (
    <span aria-hidden={!label || undefined} data-replay="" className={`typed ${className}`}>
      {label && <span className="sr-only">{text}</span>}
      {[...text].map((c, i) => (
        <span key={i} aria-hidden style={{ animationDelay: `${start + i * step}s` }}>
          {c}
        </span>
      ))}
      <span aria-hidden className="typed-caret" style={{ animationDelay: `${start + text.length * step}s` }} />
    </span>
  );
}
