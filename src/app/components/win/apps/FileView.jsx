"use client";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ContextMenu from "../ContextMenu";

export function useSelection(first = null) {
  const [state, setState] = useState(() => ({
    sel: first ? [first] : [],
    anchor: first,
    lead: first,
  }));
  const set = useCallback(
    (v) => setState((s) => ({ ...s, ...(typeof v === "function" ? v(s) : v) })),
    [],
  );
  const only = useCallback(
    (id) => set({ sel: id ? [id] : [], anchor: id, lead: id }),
    [set],
  );
  return { ...state, set, only };
}

export const selectedText = (n) =>
  n ? `${n} ${n === 1 ? "item" : "items"} selected` : "";

function columns(box) {
  const items = box.querySelectorAll("[data-file]");
  if (items.length < 2) return 1;
  const top = items[0].offsetTop;
  let n = 0;
  for (const el of items) {
    if (el.offsetTop !== top) break;
    n++;
  }
  return Math.max(1, n);
}

export default function FileView({
  label,
  items,
  idOf,
  selection,
  onOpen,
  menuFor,
  renderItem,
  className = "",
}) {
  const box = useRef(null);
  const [band, setBand] = useState(null);
  const [menu, setMenu] = useState(null);
  const ids = items.map(idOf);
  const { sel, lead, set } = selection;
  const has = (id) => sel.includes(id);

  const range = (a, b) => {
    const i = ids.indexOf(a);
    const j = ids.indexOf(b);
    if (i < 0 || j < 0) return [b];
    return ids.slice(Math.min(i, j), Math.max(i, j) + 1);
  };

  const click = (e, id) => {
    if (e.shiftKey)
      set((s) => ({
        ...s,
        sel: [
          ...new Set([
            ...(e.ctrlKey || e.metaKey ? s.sel : []),
            ...range(s.anchor ?? id, id),
          ]),
        ],
        lead: id,
      }));
    else if (e.ctrlKey || e.metaKey)
      set((s) => ({
        sel: s.sel.includes(id)
          ? s.sel.filter((x) => x !== id)
          : [...s.sel, id],
        anchor: id,
        lead: id,
      }));
    else set({ sel: [id], anchor: id, lead: id });
  };

  const focus = (id) =>
    box.current?.querySelector(`[data-file="${CSS.escape(id)}"]`)?.focus();

  const onKeys = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      set((s) => ({ ...s, sel: ids }));
      return;
    }
    const cols = columns(box.current);
    const step = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: cols,
      ArrowUp: -cols,
      Home: -Infinity,
      End: Infinity,
    }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      const i = ids.indexOf(lead);
      const id =
        ids[Math.min(ids.length - 1, Math.max(0, (i < 0 ? 0 : i) + step))];
      if (!id) return;
      if (e.shiftKey)
        set((s) => ({ ...s, sel: range(s.anchor ?? id, id), lead: id }));
      else if (e.ctrlKey || e.metaKey) set((s) => ({ ...s, lead: id }));
      else set({ sel: [id], anchor: id, lead: id });
      focus(id);
    } else if (e.key === " " && (e.ctrlKey || e.metaKey) && lead) {
      e.preventDefault();
      set((s) => ({
        ...s,
        sel: s.sel.includes(lead)
          ? s.sel.filter((x) => x !== lead)
          : [...s.sel, lead],
        anchor: lead,
      }));
    } else if (e.key === "Enter") {
      const picked = items.filter((it) => has(idOf(it)));
      if (picked.length) {
        e.preventDefault();
        onOpen(picked);
      }
    } else if (e.key === "Escape" && sel.length) {
      set((s) => ({ ...s, sel: [] }));
    }
  };

  const startBand = (e) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    const el = e.currentTarget;
    const add = e.ctrlKey || e.metaKey;
    const base = add ? sel : [];
    if (!add) set((s) => ({ ...s, sel: [] }));
    el.focus({ preventScroll: true });
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const x0 = e.clientX - rect.left + el.scrollLeft;
    const y0 = e.clientY - rect.top + el.scrollTop;
    const nodes = [...el.querySelectorAll("[data-file]")].map((n) => ({
      id: n.dataset.file,
      l: n.offsetLeft,
      t: n.offsetTop,
      r: n.offsetLeft + n.offsetWidth,
      b: n.offsetTop + n.offsetHeight,
    }));
    const move = (m) => {
      const x1 = m.clientX - rect.left + el.scrollLeft;
      const y1 = m.clientY - rect.top + el.scrollTop;
      const b = {
        left: Math.min(x0, x1),
        top: Math.min(y0, y1),
        width: Math.abs(x1 - x0),
        height: Math.abs(y1 - y0),
      };
      if (b.width < 3 && b.height < 3) return;
      setBand(b);
      const hit = nodes
        .filter(
          (n) =>
            n.l < b.left + b.width &&
            n.r > b.left &&
            n.t < b.top + b.height &&
            n.b > b.top,
        )
        .map((n) => n.id);
      set((s) => ({
        ...s,
        sel: [...new Set([...base, ...hit])],
        lead: hit[hit.length - 1] ?? s.lead,
      }));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setBand(null);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const openMenu = (e, id) => {
    if (!menuFor) return;
    e.preventDefault();
    const keep = id && has(id);
    if (id && !keep) set({ sel: [id], anchor: id, lead: id });
    const picked = id
      ? keep
        ? items.filter((it) => has(idOf(it)))
        : items.filter((it) => idOf(it) === id)
      : [];
    const list = menuFor(picked);
    if (list?.length) setMenu({ x: e.clientX, y: e.clientY, items: list });
  };

  return (
    <>
      <div
        ref={box}
        className={`wa-files ${className}`}
        role="listbox"
        aria-label={label}
        aria-multiselectable="true"
        tabIndex={-1}
        onKeyDown={onKeys}
        onPointerDown={startBand}
        onContextMenu={(e) => e.target === e.currentTarget && openMenu(e, null)}
      >
        {items.map((it) => {
          const id = idOf(it);
          return (
            <button
              key={id}
              type="button"
              role="option"
              data-file={id}
              aria-selected={has(id)}
              data-lead={lead === id || undefined}
              tabIndex={lead === id || (!lead && it === items[0]) ? 0 : -1}
              className="wa-file"
              onClick={(e) => click(e, id)}
              onDoubleClick={(e) => !e.ctrlKey && !e.shiftKey && onOpen([it])}
              onContextMenu={(e) => openMenu(e, id)}
            >
              {renderItem(it)}
            </button>
          );
        })}
        {band && <span className="wa-band" aria-hidden style={band} />}
      </div>
      {menu &&
        createPortal(
          <ContextMenu {...menu} onClose={() => setMenu(null)} />,
          document.body,
        )}
    </>
  );
}

export function Stack({ thumbs, count }) {
  return (
    <>
      <span className="wa-stack" aria-hidden>
        {thumbs.slice(0, 3).map((t, i) => (
          <span key={i} className="wa-stack-i" style={{ "--n": i }}>
            {t}
          </span>
        ))}
      </span>
      <div>
        <h3>{selectedText(count)}</h3>
      </div>
    </>
  );
}
