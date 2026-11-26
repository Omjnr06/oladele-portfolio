"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { profile } from "@/content/profile";
import { PALETTE_EVENT } from "@/lib/events";
import { APPS, PINNED, PLACES, STUDIES } from "./apps";
import WinIcon from "./icons";
import { useShell } from "./context";

const ALL = [...Object.entries(APPS).map(([id, a]) => ({ id, ...a })), ...STUDIES].sort((a, b) => a.title.localeCompare(b.title));

export default function StartMenu({ onOpen, onClose, onShutDown, onRestart, onSwitchUser }) {
  const [all, setAll] = useState(false);
  const [power, setPower] = useState(false);
  const [peek, setPeek] = useState(null);
  const { wins } = useShell();
  const ref = useRef(null);
  const search = useRef(null);

  useEffect(() => {
    search.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose({ restoreFocus: true });
      }
    };
    const onDown = (e) => {
      if (!ref.current?.contains(e.target) && !e.target.closest?.(".win-orb")) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown, true);
    };
  }, [onClose]);

  const go = (path) => {
    onClose();
    onOpen(path);
  };

  const onListKeys = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll("button")];
    const i = items.indexOf(document.activeElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  const pinned = PINNED.map((id) => ({ id, ...APPS[id] }));
  const recent = [...wins]
    .sort((a, b) => b.z - a.z)
    .filter((w) => !PINNED.includes(w.id) && (APPS[w.id] || w.id.startsWith("case-")))
    .slice(0, 5);
  const row = (app, small) => (
    <button key={app.id} type="button" className="sm-item" onClick={() => go(app.path)}>
      <WinIcon name={app.icon} className={small ? "sm-item-ico sm-item-ico--sm" : "sm-item-ico"} />
      <span>{app.label ?? app.title}</span>
    </button>
  );

  return (
    <div ref={ref} className="sm" role="dialog" aria-label="Start menu">
      <div className="sm-left">
        <div className="sm-list" onKeyDown={onListKeys}>
          {all ? (
            ALL.map((app) => row(app, true))
          ) : (
            <>
              {pinned.map((app) => row(app))}
              {recent.length > 0 && <div className="sm-sep" role="separator" />}
              {recent.map((w) => row({ ...(APPS[w.id] ?? {}), ...w }))}
            </>
          )}
        </div>
        <button type="button" className="sm-all" aria-expanded={all} onClick={() => setAll((a) => !a)}>
          {all ? (
            <>
              <svg viewBox="0 0 10 10" aria-hidden><path d="M6.5 2L3.5 5l3 3" /></svg>
              Back
            </>
          ) : (
            <>
              All Programs
              <svg viewBox="0 0 10 10" aria-hidden><path d="M3.5 2l3 3-3 3" /></svg>
            </>
          )}
        </button>
        <div className="sm-search">
          <svg viewBox="0 0 16 16" aria-hidden className="sm-mag">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l4.5 4.5" />
          </svg>
          <input
            ref={search}
            type="search"
            aria-label="Search programs and files"
            placeholder="Search programs and files"
            onChange={(e) => {
              const query = e.target.value;
              if (!query.trim()) return;
              onClose();
              window.dispatchEvent(new CustomEvent(PALETTE_EVENT, { detail: { query } }));
            }}
          />
        </div>
      </div>
      <div className="sm-right">
        <figure className="sm-user" data-peek={peek ? "" : undefined}>
          <Image src="/assets/images/junior-headshot.JPG" alt={`${profile.firstName} ${profile.lastName}`} width={180} height={180} sizes="180px" className="sm-user-img" />
          {peek && <WinIcon key={peek} name={peek} className="sm-user-ico" />}
        </figure>
        <nav className="sm-places" aria-label="Places" onKeyDown={onListKeys} onPointerLeave={() => setPeek(null)}>
          {PLACES.map((group, g) => (
            <div key={g} className="sm-group">
              {group.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="sm-place"
                  onPointerEnter={() => setPeek(APPS[id].icon)}
                  onFocus={() => setPeek(APPS[id].icon)}
                  onBlur={() => setPeek(null)}
                  onClick={() => go(APPS[id].path)}
                >
                  {id === "home" ? profile.firstName : APPS[id].title}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sm-power">
          <button type="button" className="sm-shut" onClick={onShutDown}>
            Shut down
          </button>
          <button type="button" className="sm-arrow" aria-label="More shut down options" aria-expanded={power} onClick={() => setPower((p) => !p)}>
            <svg viewBox="0 0 10 10" aria-hidden><path d="M3.5 2l3 3-3 3" /></svg>
          </button>
          {power && (
            <div className="sm-powermenu" role="menu" aria-label="Shut down options">
              <button type="button" role="menuitem" onClick={onSwitchUser}>
                Switch user
                <small>Paper</small>
              </button>
              <button type="button" role="menuitem" onClick={onRestart}>
                Restart
                <small>Choose a version</small>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
