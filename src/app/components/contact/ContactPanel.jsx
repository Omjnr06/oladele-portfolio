"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { profile } from "@/content/profile";
import { contact } from "@/content/contact";
import { ICONS } from "../ContactLinks";
import Randomart from "./Randomart";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function handle(c) {
  if (c.href.startsWith("mailto:")) return c.href.slice(7);
  const seg = new URL(c.href).pathname.split("/").filter(Boolean).pop() ?? "";
  return ["x", "instagram"].includes(c.id) ? `@${seg}` : seg;
}

function Icon({ name, className = "h-[18px] w-[18px]" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

function CopyEmail({ value }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(value).then(() => setDone(true), () => {})}
      className={`h-10 shrink-0 rounded-lg px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-[color,background-color,transform] duration-150 hover:bg-bright/5 hover:text-accent active:scale-[0.97] paper:font-hand paper:text-lg paper:normal-case paper:tracking-normal ${focus}`}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function Label({ children }) {
  return <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted paper:font-hand paper:text-xl paper:normal-case paper:tracking-normal paper:text-accent-2">{children}</p>;
}

export default function ContactPanel({ open, onClose }) {
  const reduce = useReducedMotion();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (back instanceof HTMLElement) back.focus();
    };
  }, [open, onClose]);

  const slide = reduce ? { opacity: 0 } : { x: "100%" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            aria-hidden
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-scrim/50 paper:bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            data-contact-panel=""
            initial={slide}
            animate={{ x: 0, opacity: 1 }}
            exit={{ ...slide, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            className="fixed inset-y-0 right-0 z-[71] flex w-[min(420px,100vw)] flex-col overflow-y-auto border-l border-line bg-panel shadow-[-24px_0_48px_-24px_rgb(0_0_0/.6)] paper:border-l-0 paper:bg-[#fffdf8] paper:shadow-[-16px_0_40px_-20px_rgb(0_0_0/.35)]"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <p className="mb-2 font-mono text-[11px] text-accent paper:hidden">$ contact --open</p>
                <h2 id="contact-title" className="text-2xl font-bold tracking-tight text-bright paper:font-hand paper:text-4xl paper:font-normal paper:tracking-normal">
                  Get in touch
                </h2>
              </div>
              <div className="flex items-start gap-3">
                <div className="paper:hidden">
                  <Randomart />
                </div>
                <motion.div
                  aria-hidden
                  initial={reduce ? false : { scale: 1.8, rotate: -14, opacity: 0 }}
                  animate={{ scale: 1, rotate: 3, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 520, damping: 22 }}
                  whileHover={reduce ? undefined : { rotate: -4, scale: 1.06 }}
                  className="stamp relative hidden paper:grid h-[72px] w-16 place-items-center border-2 border-dashed border-accent-2/60 bg-ink font-hand text-2xl leading-none text-accent-2"
                >
                  OMJ
                  <motion.svg
                    viewBox="0 0 80 40"
                    className="pointer-events-none absolute -bottom-3 -left-9 h-10 w-20 text-accent-2/70"
                    initial={reduce ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55, duration: 0.3, ease: "easeOut" }}
                  >
                    <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M40 12q8-4 16 0t16 0M40 20q8-4 16 0t16 0M40 28q8-4 16 0t16 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <text x="20" y="23" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-hand)">
                      LDN
                    </text>
                  </motion.svg>
                </motion.div>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close contact"
                  onClick={onClose}
                  className={`grid h-10 w-10 place-items-center rounded-lg text-muted transition-[color,background-color,transform] duration-150 hover:bg-bright/5 hover:text-fg active:scale-[0.97] ${focus}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-8">
              <div>
                <Label>Open to</Label>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-bright paper:text-base">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ok" aria-hidden />
                  {profile.openTo}
                </p>
              </div>
              <div>
                <Label>Based in</Label>
                <ul className="grid gap-1 text-sm text-bright paper:gap-0 paper:text-base">
                  {profile.locations.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-3">
              <div className="px-3 pb-2">
                <Label>Contact me @</Label>
              </div>
              <ul className="grid gap-1">
                {contact.map((c) => {
                  const email = c.id === "email";
                  return (
                    <li key={c.id} className="flex items-center gap-1">
                      <a
                        href={c.href}
                        target={email ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className={`group flex h-12 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 transition-[background-color,transform] duration-150 hover:bg-bright/5 active:scale-[0.99] paper:hover:bg-accent-2/10 ${focus}`}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line text-muted transition-colors duration-150 group-hover:border-accent/50 group-hover:text-accent">
                          <Icon name={c.icon} className="h-4 w-4" />
                        </span>
                        <span className="w-20 shrink-0 text-sm font-medium text-bright">{c.label}</span>
                        <span className="truncate font-mono text-xs text-muted transition-colors duration-150 group-hover:text-accent paper:pr-1 paper:font-hand paper:text-lg">{handle(c)}</span>
                      </a>
                      {email && <CopyEmail value={handle(c)} />}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-auto px-6 pb-6 pt-8">
              <a
                href={profile.resumePdf.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97] ${focus}`}
              >
                View resume
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
