"use client";
import { THEMES } from "@/lib/themes";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { leaveTo } from "../leave";
import "./apps.css";
import "./system.css";

const GROUPS = [
  { pack: "windows", label: "Aero themes", note: "You're here." },
  { pack: "modern", label: "Modern themes", note: "The default site, in ten colours." },
  { pack: "paper", label: "Paper themes", note: "A student's notebook, submitted as a report." },
];

function Swatch({ swatch }) {
  const [bg, a, b] = swatch;
  return (
    <span className="wp-swatch" style={{ background: bg }} aria-hidden>
      <b style={{ background: a }} />
      <i style={{ background: b }} />
    </span>
  );
}

export default function PersonalizeApp() {
  const prefs = usePrefs();
  return (
    <div className="wa">
      <div className="wa-main ws-main">
        <h1 className="ws-title">Change the visuals and sounds on this site</h1>
        <p className="wp-intro">Click a theme to change how the whole site looks. Modern and Paper leave this desktop.</p>
        {GROUPS.map((g) => (
          <section key={g.pack} className="wp-group" aria-label={g.label}>
            <h2>
              {g.label} ({THEMES[g.pack].variants.length}) <span className="wa-dim" style={{ fontWeight: 400 }}>{g.note}</span>
            </h2>
            <div className="wp-themes">
              {THEMES[g.pack].variants.map((v) => {
                const on = prefs.pack === g.pack && prefs.variant === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className="wp-theme"
                    aria-pressed={on}
                    onClick={() => {
                      if (on) return;
                      if (g.pack === "windows") setPrefs({ pack: "windows", variant: v.id });
                      else leaveTo(g.pack, v.id);
                    }}
                  >
                    <Swatch swatch={v.swatch} />
                    {v.label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <div className="wp-foot">
          <label className="wp-option">
            <input type="checkbox" checked={prefs.sound} onChange={(e) => setPrefs({ sound: e.target.checked })} />
            Play Windows sounds
          </label>
        </div>
      </div>
    </div>
  );
}
