"use client";
import { useEffect, useRef, useState } from "react";
import "./menubar.css";

export default function Menubar({ label, menus, className = "" }) {
  const [menu, setMenu] = useState(null);
  const bar = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e) => !bar.current?.contains(e.target) && setMenu(null);
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <div ref={bar} className={`mb ${className}`} role="menubar" aria-label={label}>
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} className="mb-menu">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={menu === name}
            className="mb-top"
            onClick={() => setMenu((m) => (m === name ? null : name))}
            onPointerEnter={() => menu && setMenu(name)}
          >
            {name}
          </button>
          {menu === name && (
            <div className="cm mb-drop" role="menu" aria-label={name}>
              {items.map((it, i) =>
                it === "sep" ? (
                  <div key={i} className="cm-sep" role="separator" />
                ) : (
                  <button
                    key={it.label}
                    type="button"
                    role={it.checked === undefined ? "menuitem" : "menuitemcheckbox"}
                    aria-checked={it.checked}
                    className="cm-item"
                    onClick={() => {
                      setMenu(null);
                      it.run();
                    }}
                  >
                    {it.checked && <span aria-hidden className="mb-check">✓</span>}
                    {it.label}
                    {it.keys && <span className="mb-keys">{it.keys}</span>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
