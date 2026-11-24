"use client";
import { useRef } from "react";
import "./list.css";

export default function DetailsList({ label, columns, rows, rowKey, selected, onSelect, onOpen, sort, onSort, footer, empty }) {
  const box = useRef(null);
  const tmpl = columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");

  const onKeys = (e) => {
    const i = rows.findIndex((r) => rowKey(r) === selected);
    const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 10, PageUp: -10, Home: -Infinity, End: Infinity }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      const next = rows[Math.min(rows.length - 1, Math.max(0, (i < 0 ? 0 : i) + step))];
      if (!next) return;
      onSelect(rowKey(next));
      box.current?.querySelector(`[data-key="${CSS.escape(rowKey(next))}"]`)?.focus();
    } else if (e.key === "Enter" && i >= 0 && onOpen) {
      e.preventDefault();
      onOpen(rows[i]);
    }
  };

  return (
    <div className="wl" style={{ "--cols": tmpl }}>
      <div className="wl-head" role="presentation">
        {columns.map((c) =>
          onSort && c.sort !== false ? (
            <button
              key={c.key}
              type="button"
              className="wl-th"
              data-align={c.align}
              aria-sort={sort?.key === c.key ? (sort.dir > 0 ? "ascending" : "descending") : undefined}
              onClick={() => onSort({ key: c.key, dir: sort?.key === c.key ? -sort.dir : c.dir ?? 1 })}
            >
              {c.label}
              {sort?.key === c.key && (
                <svg viewBox="0 0 10 6" aria-hidden className="wl-caret">
                  <path d={sort.dir > 0 ? "M1 5l4-4 4 4" : "M1 1l4 4 4-4"} />
                </svg>
              )}
            </button>
          ) : (
            <span key={c.key} className="wl-th" data-align={c.align}>
              {c.label}
            </span>
          ),
        )}
      </div>
      <div ref={box} className="wl-body" role="listbox" aria-label={label} onKeyDown={onKeys}>
        {rows.length === 0 && empty}
        {rows.map((r) => {
          const k = rowKey(r);
          const on = k === selected;
          return (
            <div
              key={k}
              data-key={k}
              role="option"
              aria-selected={on}
              tabIndex={on || (!selected && r === rows[0]) ? 0 : -1}
              className="wl-row"
              onClick={() => onSelect(k)}
              onDoubleClick={() => onOpen?.(r)}
            >
              {columns.map((c) => (
                <span key={c.key} className="wl-td" data-align={c.align}>
                  {c.render ? c.render(r) : r[c.key]}
                </span>
              ))}
            </div>
          );
        })}
        {footer}
      </div>
    </div>
  );
}
