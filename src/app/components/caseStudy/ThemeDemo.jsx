"use client";
import { useState } from "react";

export default function ThemeDemo({ themes, initial }) {
  const keys = Object.keys(themes);
  const [theme, setTheme] = useState(initial ?? keys[0]);
  const t = themes[theme];

  return (
    <>
      <div data-colors="fixed" className="flex flex-wrap gap-2 mb-4">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => setTheme(k)}
            aria-pressed={theme === k}
            className={`font-mono text-[11px] px-3 py-1.5 rounded border transition-colors capitalize ${theme === k ? "text-on-accent" : "text-bright/60 hover:text-bright/90 border-bright/10"}`}
            style={theme === k ? { background: themes[k].accent, borderColor: themes[k].accent } : {}}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="rounded-xl p-5 border transition-colors" style={{ background: t.surface, borderColor: t.borderSubtle }}>
        <div className="rounded-lg p-4" style={{ background: t.surfaceRaised }}>
          <div className="text-[11px] mb-1" style={{ color: t.textMuted }}>Safe to spend · week</div>
          <div className="text-3xl font-bold mb-3" style={{ color: t.textPrimary }}>CA$800.00</div>
          <div className="flex items-center gap-3 text-[11px]">
            <span style={{ color: t.textMuted }}>Balance</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: t.borderSubtle }}>
              <div className="h-full w-[14%]" style={{ background: t.accent }} />
            </div>
            <span style={{ color: t.success }}>on track</span>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-[11px] px-2 py-1 rounded" style={{ background: t.accent, color: t.surface }}>Primary</span>
            <span className="text-[11px] px-2 py-1 rounded border" style={{ borderColor: t.danger, color: t.danger }}>Over budget</span>
          </div>
        </div>
      </div>
    </>
  );
}
