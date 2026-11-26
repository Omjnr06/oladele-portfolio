"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { THEMES, packFits } from "@/lib/themes";
import { getPrefs } from "@/lib/prefs";
import { switchTheme } from "@/lib/packSwitch";
import { track } from "@/lib/track";
import "./chooser.css";

const CARDS = [
  { id: "modern", line: "Dark and quiet, a terminal at heart. Ten colour tones." },
  { id: "paper", line: "My notebook: ruled pages, handwriting and taped-in photos." },
  { id: "windows", line: "A Windows 7 desktop. Every page opens in a window you can drag." },
];

const toneVars = (v) => ({ "--m0": v.swatch[0], "--m1": v.swatch[1], "--m2": v.swatch[2], "--mf": v.light ? "#1b1d22" : "#e9edf2" });

function ModernMini({ v }) {
  return (
    <span className="ch-mini ch-modern" style={toneVars(v)} aria-hidden>
      <span className="ch-rail">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="ch-mod-head">
        <i className="w-a" />
        <i className="w-b" />
        <i className="ch-acc" />
      </span>
      <span className="ch-mod-media">
        <i />
      </span>
      <span className="ch-mod-term">
        <i className="ch-acc" />
        <i />
        <i />
      </span>
    </span>
  );
}

function PaperMini({ v }) {
  return (
    <span className="ch-mini ch-paper" data-v={v.id} style={toneVars(v)} aria-hidden>
      <span className="ch-margin" />
      <span className="ch-hand">Oladele</span>
      <span className="ch-ink">
        <i />
        <i />
        <i />
      </span>
      <span className="ch-photo">
        <i className="ch-tape" />
      </span>
    </span>
  );
}

function WinMini() {
  return (
    <span className="ch-mini ch-win" aria-hidden>
      <span className="ch-icons">
        <i />
        <i />
        <i />
      </span>
      <span className="ch-window">
        <span className="ch-title">
          <i />
        </span>
        <span className="ch-client">
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="ch-taskbar">
        <i className="ch-orb" />
        <i />
        <i />
      </span>
    </span>
  );
}

const MINI = { modern: ModernMini, paper: PaperMini, windows: WinMini };

function focusables(el) {
  return [...el.querySelectorAll("button:not([disabled]), [tabindex='0']")].filter((n) => n.offsetParent !== null);
}

export default function Chooser({ onClose }) {
  const ref = useRef(null);
  const cardRefs = useRef({});
  const [tones, setTones] = useState(() => {
    const p = getPrefs();
    const out = Object.fromEntries(Object.entries(THEMES).map(([k, t]) => [k, t.variants[0].id]));
    out[p.pack] = p.variant;
    return out;
  });
  const [current] = useState(() => getPrefs().pack);
  const [fits] = useState(() => packFits("windows"));

  const enter = (e, pack) => {
    const patch = { pack, variant: tones[pack] };
    onClose();
    const p = getPrefs();
    if (p.pack === pack && p.variant === patch.variant) return;
    if (p.pack !== pack) track("pack_selected", pack);
    track("variant_selected", patch.variant);
    switchTheme(e, patch);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-chooser-open", "");
    const start = cardRefs.current[current] ?? cardRefs.current.modern;
    start?.focus({ preventScroll: true });
    return () => root.removeAttribute("data-chooser-open");
  }, [current]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const list = focusables(ref.current);
    const i = list.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : i === list.length - 1 ? 0 : i + 1;
    e.preventDefault();
    list[next]?.focus();
  };

  const moveCard = (e, index) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const ids = CARDS.map((c) => c.id).filter((id) => id !== "windows" || fits);
    const at = ids.indexOf(CARDS[index].id);
    cardRefs.current[ids[(at + step + ids.length) % ids.length]]?.focus();
  };

  const moveTone = (e, pack, index) => {
    const vs = THEMES[pack].variants;
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = vs[(index + step + vs.length) % vs.length];
    setTones((t) => ({ ...t, [pack]: next.id }));
    e.currentTarget.parentElement.querySelector(`[data-tone='${next.id}']`)?.focus();
  };

  return createPortal(
    <div ref={ref} className="ch" role="dialog" aria-modal="true" aria-labelledby="ch-title" aria-describedby="ch-sub" onKeyDown={onKeyDown}>
      <div className="ch-in">
        <header className="ch-head">
          <div>
            <p className="ch-kicker">magbadelojr.com</p>
            <h2 id="ch-title">Compare versions</h2>
            <p id="ch-sub" className="ch-sub">
              Same portfolio, three looks. Pick one to switch, or close to stay where you are.
            </p>
          </div>
          <button type="button" className="ch-skip" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="ch-rule" aria-hidden />
        <ul className="ch-cards">
          {CARDS.map((c, index) => {
            const t = THEMES[c.id];
            const v = t.variants.find((x) => x.id === tones[c.id]) ?? t.variants[0];
            const Mini = MINI[c.id];
            const blocked = c.id === "windows" && !fits;
            return (
              <li key={c.id} className="ch-card" style={{ "--i": index }} data-current={current === c.id || undefined} data-blocked={blocked || undefined}>
                <button
                  ref={(n) => {
                    cardRefs.current[c.id] = n;
                  }}
                  type="button"
                  className="ch-pick"
                  disabled={blocked}
                  aria-describedby={`ch-line-${c.id}`}
                  onKeyDown={(e) => moveCard(e, index)}
                  onClick={(e) => enter(e, c.id)}
                >
                  <Mini v={v} />
                  <span className="ch-name">
                    {t.label}
                    {current === c.id && <span className="ch-tag">Current</span>}
                    {blocked && <span className="ch-tag">Desktop only</span>}
                  </span>
                </button>
                <p id={`ch-line-${c.id}`} className="ch-line">
                  {c.line}
                </p>
                {t.variants.length > 1 && (
                  <div className="ch-tones" role="radiogroup" aria-label={`${t.label} tones`}>
                    {t.variants.map((x, i) => {
                      const on = x.id === v.id;
                      return (
                        <button
                          key={x.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={x.label}
                          title={x.label}
                          data-tone={x.id}
                          tabIndex={on ? 0 : -1}
                          className="ch-tone"
                          onKeyDown={(e) => moveTone(e, c.id, i)}
                          onClick={() => setTones((s) => ({ ...s, [c.id]: x.id }))}
                        >
                          <span style={{ background: `linear-gradient(90deg, ${x.swatch[0]} 0 50%, ${x.swatch[1]} 50% 100%)` }} />
                        </button>
                      );
                    })}
                    <span className="ch-tone-name">{v.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
