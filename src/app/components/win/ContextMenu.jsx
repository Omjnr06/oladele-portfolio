"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const own = (el) => [...el.querySelectorAll(":scope > button, :scope > .cm-has > button")];

function move(e, el) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return false;
  e.preventDefault();
  const list = own(el);
  const i = list.indexOf(document.activeElement);
  list[(i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length]?.focus();
  return true;
}

function Items({ items, onClose, sub, setSub }) {
  return items.map((it, i) => {
    if (it === "sep") return <div key={i} className="cm-sep" role="separator" />;
    if (it.head) return <p key={i} className="cm-head" role="presentation">{it.head}</p>;
    if (it.items) {
      const open = sub === it.label;
      return (
        <div key={it.label} className="cm-has" onPointerEnter={() => setSub(it.label)}>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open}
            className="cm-item cm-item--parent"
            onClick={() => setSub(open ? null : it.label)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "Enter") return;
              e.preventDefault();
              setSub(it.label);
              requestAnimationFrame(() => e.target.parentElement.querySelector(".cm-sub button")?.focus());
            }}
          >
            {it.label}
            <svg viewBox="0 0 10 10" aria-hidden className="cm-caret"><path d="M3.5 2l3 3-3 3z" /></svg>
          </button>
          {open && <SubMenu label={it.label} items={it.items} onClose={onClose} onBack={() => setSub(null)} />}
        </div>
      );
    }
    return (
      <button
        key={it.label}
        type="button"
        role={it.checked === undefined ? "menuitem" : "menuitemradio"}
        aria-checked={it.checked}
        className={it.strong ? "cm-item cm-item--strong" : "cm-item"}
        onPointerEnter={() => setSub?.(null)}
        onClick={() => {
          onClose();
          it.onSelect();
        }}
      >
        {it.checked && <span aria-hidden className="cm-dot" />}
        {it.label}
      </button>
    );
  });
}

function SubMenu({ label, items, onClose, onBack }) {
  const ref = useRef(null);
  const [flip, setFlip] = useState(false);

  useLayoutEffect(() => {
    const r = ref.current.getBoundingClientRect();
    if (r.right > innerWidth - 4) setFlip(true);
  }, []);

  return (
    <div
      ref={ref}
      className="cm cm-sub"
      role="menu"
      aria-label={label}
      data-flip={flip || undefined}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (move(e, ref.current)) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          ref.current.parentElement.querySelector("button")?.focus();
          onBack();
        } else if (e.key === "Escape") onClose();
      }}
    >
      <Items items={items} onClose={onClose} />
    </div>
  );
}

export default function ContextMenu({ x, y, items, onClose, above = false, label }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });
  const [sub, setSub] = useState(null);

  useLayoutEffect(() => {
    const r = ref.current.getBoundingClientRect();
    if (above) setPos({ left: Math.min(Math.max(4, x - r.width / 2), innerWidth - r.width - 4), top: Math.max(4, y - r.height - 6) });
    else setPos({ left: Math.min(x, innerWidth - r.width - 4), top: Math.min(y, innerHeight - r.height - 4) });
    ref.current.querySelector("button")?.focus({ preventScroll: true });
  }, [x, y, above]);

  useEffect(() => {
    const onDown = (e) => !ref.current?.contains(e.target) && onClose();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <div ref={ref} className={above ? "cm cm-jump" : "cm"} role="menu" aria-label={label} style={pos} onKeyDown={(e) => move(e, ref.current)} onContextMenu={(e) => e.preventDefault()}>
      <Items items={items} onClose={onClose} sub={sub} setSub={setSub} />
    </div>
  );
}
