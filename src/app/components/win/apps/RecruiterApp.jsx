"use client";
import { useState } from "react";
import Image from "next/image";
import { profile } from "@/content/profile";
import { contact } from "@/content/contact";
import { highlightedExperience } from "@/content/resume";
import { highlightedProjects } from "@/content/projects";
import { displayTitle, projectLinks } from "../../projects/links";
import WinIcon from "../icons";
import "./apps.css";
import "./recruiter.css";

const NAME = `${profile.firstName} ${profile.lastName}`;
const email = contact.find((c) => c.id === "email");
const socials = ["linkedin", "github", "x"].map((id) => contact.find((c) => c.id === id)).filter(Boolean);

function Go({ link, open, primary }) {
  const cls = primary ? "wa-btn wa-btn--default" : "wa-btn";
  if (link.internal)
    return (
      <button type="button" className={cls} onClick={() => open(link.href)}>
        {link.label}
      </button>
    );
  return (
    <a className={cls} href={link.href} target="_blank" rel="noopener noreferrer">
      {link.label}
    </a>
  );
}

export default function RecruiterApp({ open }) {
  const [copied, setCopied] = useState(false);
  const address = email?.href.replace(/^mailto:/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = email.href;
    }
  };

  return (
    <div className="wa rx">
      <header className="rx-head">
        <Image src="/assets/images/junior-headshot.JPG" alt={NAME} width={180} height={180} sizes="88px" className="rx-avatar" />
        <div className="rx-who">
          <h1>{NAME}</h1>
          <p>{profile.status}</p>
          <p className="rx-open">Open to {profile.openTo.charAt(0).toLowerCase() + profile.openTo.slice(1)}</p>
          <p className="rx-dim">{profile.locations.join("  ·  ")}</p>
        </div>
        <div className="rx-cta">
          <button type="button" className="wa-btn wa-btn--default" onClick={() => open("/resume")}>
            View resume
          </button>
          <a className="wa-btn" href={profile.resumePdf.href} target="_blank" rel="noopener noreferrer">
            Resume PDF
          </a>
          <a className="wa-btn" href={profile.resumePdf.href} download>
            Download
          </a>
        </div>
      </header>

      <div className="rx-body">
        <div className="rx-main">
          <section aria-labelledby="rx-exp">
            <h2 id="rx-exp" className="rx-h">Experience</h2>
            <ul className="rx-roles">
              {highlightedExperience.map((e) => (
                <li key={e.id} className="rx-role">
                  <span className="rx-logo">{e.logo ? <Image src={e.logo} alt="" width={28} height={28} sizes="28px" /> : null}</span>
                  <div>
                    <p className="rx-role-title">
                      {e.role} <span className="rx-dim">at</span> {e.company.split(",")[0]}
                    </p>
                    <p className="rx-dim">{e.date}</p>
                    <p className="rx-sum">{e.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="rx-proj">
            <h2 id="rx-proj" className="rx-h">Projects</h2>
            <ul className="rx-projects">
              {highlightedProjects.map((p) => (
                <li key={p.id} className="rx-project">
                  <span className="rx-shot">{(p.media?.poster || p.media?.image) && <Image src={p.media.poster || p.media.image} alt="" fill sizes="132px" />}</span>
                  <div className="rx-project-text">
                    <h3>
                      {displayTitle(p)}
                      {p.tag && <span className="rx-tag">{p.tag}</span>}
                    </h3>
                    <p>{p.tagline}</p>
                    <div className="rx-links">
                      {projectLinks(p).map((l, i) => (
                        <Go key={l.id} link={l} open={open} primary={i === 0} />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="wa-link rx-more" onClick={() => open("/?app=projects")}>
              See every project
            </button>
          </section>
        </div>

        <aside className="rx-side" aria-labelledby="rx-contact">
          <h2 id="rx-contact" className="rx-h">Contact</h2>
          {email && (
            <div className="rx-email">
              <WinIcon name="mail" className="rx-ico" />
              <span>{address}</span>
              <button type="button" className="wa-btn" onClick={copy} aria-live="polite">
                {copied ? "Copied" : "Copy email"}
              </button>
            </div>
          )}
          <ul className="rx-socials">
            {socials.map((s) => (
              <li key={s.id}>
                <a className="wa-link" href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="wa-btn rx-write" onClick={() => open("/?app=contact")}>
            Write a message
          </button>
          <p className="rx-dim rx-note">Run this anytime from the desktop or the top of the Start menu.</p>
        </aside>
      </div>
    </div>
  );
}
