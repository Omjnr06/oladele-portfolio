"use client";
import { useRef, useState } from "react";
import { profile } from "@/content/profile";
import { contact } from "@/content/contact";
import { education, experience, resumeProjects, skills } from "@/content/resume";
import WinIcon from "../icons";
import "./apps.css";

const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
];

const LINKS = contact.filter((c) => ["linkedin", "github", "devpost"].includes(c.id));

function Entry({ title, sub, date, location, points, children }) {
  return (
    <div className="wa-doc-entry">
      <div className="wa-doc-meta">
        <h3>{title}</h3>
        <span>{date}</span>
      </div>
      {(sub || location) && (
        <div className="wa-doc-meta">
          <span className="wa-doc-sub">{sub}</span>
          {location && <span>{location}</span>}
        </div>
      )}
      {children}
      {points?.length > 0 && (
        <ul>
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResumeApp() {
  const scroller = useRef(null);
  const [current, setCurrent] = useState("experience");

  const jump = (id) => {
    setCurrent(id);
    const el = scroller.current?.querySelector(`#wa-resume-${id}`);
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.current.scrollTo({ top: el.offsetTop - 12, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="wa">
      <div className="wa-cmd">
        <a className="wa-cmd-btn" href={profile.resumePdf.href} target="_blank" rel="noopener noreferrer">
          <WinIcon name="doc" className="wa-nav-ico" />
          Open PDF
        </a>
        <a className="wa-cmd-btn" href={profile.resumePdf.href} download>
          Download
        </a>
        <span className="wa-cmd-sep" />
        {LINKS.map((l) => (
          <a key={l.id} className="wa-cmd-btn" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
      </div>
      <div className="wa-row">
        <nav className="wa-nav" aria-label="Resume sections">
          <p className="wa-nav-head">Sections</p>
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" className="wa-nav-item" aria-current={current === s.id} onClick={() => jump(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
        <div ref={scroller} className="wa-doc-scroll">
          <article className="wa-doc">
            <h1>
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="wa-doc-sub">{profile.title}</p>
            <p className="wa-dim">{profile.status}</p>

            <h2 id="wa-resume-experience">Experience</h2>
            {experience.map((e) => (
              <Entry key={e.id} title={e.role} sub={e.company} date={e.date} location={e.location} points={e.points} />
            ))}

            <h2 id="wa-resume-projects">Projects</h2>
            {resumeProjects.map((p) => (
              <Entry key={p.id} title={p.title} sub={p.stack} date={p.date} points={p.points} />
            ))}

            <h2 id="wa-resume-education">Education</h2>
            {education.map((e) => (
              <Entry key={e.id} title={e.degree} sub={e.school} date={e.date}>
                {e.details && <p>{e.details}</p>}
              </Entry>
            ))}

            <h2 id="wa-resume-skills">Skills</h2>
            {skills.map((g) => (
              <div key={g.id} className="wa-doc-entry">
                <h3>{g.category.charAt(0) + g.category.slice(1).toLowerCase()}</h3>
                <div className="wa-chips" style={{ marginTop: 6 }}>
                  {g.items.map((i) => (
                    <span key={i} className="wa-chip">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </article>
        </div>
      </div>
      <div className="wa-status">
        <span>{experience.length} roles</span>
        <span>{resumeProjects.length} projects</span>
        <span>{profile.resumePdf.size.replace("_", " ")} PDF</span>
      </div>
    </div>
  );
}
