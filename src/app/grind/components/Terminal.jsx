"use client";
import { useState } from "react";

export function Terminal({ owner, onUnlocked }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [state, setState] = useState({ busy: false, msg: null, error: false });

  const submit = async (e) => {
    e.preventDefault();
    if (!key.trim() || state.busy) return;
    setState({ busy: true, msg: "checking…", error: false });
    try {
      const res = await fetch("/api/grind/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: key.trim() }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setKey("");
      setOpen(false);
      setState({ busy: false, msg: null, error: false });
      onUnlocked();
    } catch (err) {
      setState({ busy: false, msg: `access denied: ${err.message}`, error: true });
    }
  };

  const prompt = <span className="shrink-0">omj@grind:~$</span>;

  if (owner || !open) {
    return (
      <div className="mt-16 border-t border-line pt-6 font-mono text-sm text-muted">
        <button type="button" onClick={() => !owner && setOpen(true)} disabled={owner} aria-label={owner ? undefined : "Owner unlock"}
          className="flex h-10 items-center gap-2 rounded-md transition-[color] duration-150 enabled:hover:text-fg disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          {prompt}
          {owner && <span className="text-accent-2">unlocked</span>}
          <span aria-hidden className="inline-block h-4 w-2 animate-pulse bg-white/60 motion-reduce:animate-none" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-16 border-t border-line pt-6 font-mono text-sm text-muted">
      <label className="flex h-10 items-center gap-2">
        {prompt}
        <span className="text-fg/70">unlock</span>
        <input autoFocus type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="current-password" spellCheck={false}
          onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setState({ busy: false, msg: null, error: false }); } }}
          aria-label="Dashboard key" placeholder="paste key, press enter"
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-fg caret-accent outline-none placeholder:text-muted/60 md:text-sm" />
      </label>
      {state.msg && <p role="status" className={`mt-1 text-xs ${state.error ? "text-red-300" : "text-muted"}`}>{state.msg}</p>}
    </form>
  );
}
