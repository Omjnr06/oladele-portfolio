"use client";
import { useState } from "react";
import { contact } from "@/content/contact";
import { profile } from "@/content/profile";
import WinIcon from "../icons";
import "./apps.css";
import "./mail.css";

const email = contact.find((c) => c.id === "email");
const links = contact.filter((c) => c.id !== "email");
const NAME = `${profile.firstName} ${profile.lastName}`;

export default function ContactApp() {
  const [view, setView] = useState("inbox");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!email) return;
    const q = new URLSearchParams();
    if (subject.trim()) q.set("subject", subject.trim());
    if (body.trim()) q.set("body", body.trim());
    const qs = q.toString().replace(/\+/g, "%20");
    location.href = `${email.href}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="wa">
      <div className="wa-cmd">
        <button type="button" className="wa-cmd-btn" aria-pressed={view === "compose"} onClick={() => setView("compose")}>
          <WinIcon name="mail" className="wa-nav-ico" />
          New message
        </button>
        <span className="wa-cmd-sep" />
        <button type="button" className="wa-cmd-btn" onClick={() => setView("inbox")}>
          Inbox
        </button>
        <button type="button" className="wa-cmd-btn" onClick={() => setView("contacts")}>
          Contacts
        </button>
      </div>
      <div className="wa-row">
        <nav className="wa-nav" aria-label="Mail folders">
          <p className="wa-nav-head">{NAME}</p>
          <button type="button" className="wa-nav-item" aria-pressed={view === "inbox"} onClick={() => setView("inbox")}>
            Inbox <span className="wm-count">1</span>
          </button>
          <button type="button" className="wa-nav-item" aria-pressed={view === "compose"} onClick={() => setView("compose")}>
            Drafts
          </button>
          <button type="button" className="wa-nav-item" aria-pressed={view === "contacts"} onClick={() => setView("contacts")}>
            Contacts
          </button>
        </nav>
        <div className="wa-main">
          {view === "inbox" && (
            <article className="wm-msg">
              <header className="wm-head">
                <h2>Thanks for stopping by</h2>
                <p>
                  <span className="wa-dim">From:</span> {NAME}
                </p>
                <p>
                  <span className="wa-dim">To:</span> You
                </p>
              </header>
              <div className="wm-body">
                <p>Hey, I&apos;m {profile.firstName}.</p>
                <p>{profile.status}. I build software and play music, and I&apos;m always up for talking about either.</p>
                <p>If you&apos;re hiring, building something, or just want to say hi, write back with the New message button, or find me here:</p>
                <ul className="wm-links">
                  {links.map((l) => (
                    <li key={l.id}>
                      <a className="wa-link" href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p>Talk soon,</p>
                <p>{profile.firstName}</p>
                <div className="wa-details-actions">
                  <button type="button" className="wa-btn wa-btn--default" onClick={() => setView("compose")}>
                    Reply
                  </button>
                </div>
              </div>
            </article>
          )}
          {view === "compose" && (
            <form className="wm-compose" onSubmit={send}>
              <label className="wm-field">
                <span>To:</span>
                <input value={NAME} readOnly aria-label="To" />
              </label>
              <label className="wm-field">
                <span>Subject:</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" />
              </label>
              <textarea className="wm-text" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Message" placeholder={`Hi ${profile.firstName},`} />
              <div className="wm-send">
                <button type="submit" className="wa-btn wa-btn--default">
                  Send
                </button>
                <span className="wa-dim">Opens your email app with this message ready to go.</span>
              </div>
            </form>
          )}
          {view === "contacts" && (
            <ul className="wm-contacts">
              {contact.map((c) => (
                <li key={c.id}>
                  <a className="wa-file" href={c.href} target={c.id === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                    <WinIcon name={c.id === "email" ? "mail" : "user"} className="wa-thumb-ico" />
                    <span>{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="wa-status">
        <span>{view === "compose" ? "Composing" : view === "contacts" ? `${contact.length} contacts` : "1 message"}</span>
      </div>
    </div>
  );
}
