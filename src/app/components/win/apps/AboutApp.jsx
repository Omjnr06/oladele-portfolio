"use client";
import Image from "next/image";
import { profile } from "@/content/profile";
import { experience, skills } from "@/content/resume";
import { projects } from "@/content/projects";
import { Orb } from "../icons";
import "./apps.css";
import "./system.css";

const plain = (t) => t.replace(/\*/g, "");

export default function AboutApp({ open }) {
  const languages = skills.find((s) => s.id === "languages")?.items.slice(0, 6).join(", ");
  return (
    <div className="wa">
      <div className="wa-row">
        <nav className="wa-nav ws-nav" aria-label="Control panel">
          <p className="wa-nav-head">Control Panel Home</p>
          <button type="button" className="wa-nav-item" onClick={() => open("/resume")}>
            Resume
          </button>
          <button type="button" className="wa-nav-item" onClick={() => open("/?app=projects")}>
            Projects
          </button>
          <button type="button" className="wa-nav-item" onClick={() => open("/?app=contact")}>
            Contact
          </button>
          <button type="button" className="wa-nav-item" onClick={() => open("/?app=personalize")}>
            Personalize
          </button>
        </nav>
        <div className="wa-main ws-main">
          <h1 className="ws-title">View basic information about this developer</h1>

          <section className="ws-section">
            <h2>OMJ OS edition</h2>
            <div className="ws-edition">
              <div>
                <p>{profile.title.replace(" // ", " and ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</p>
                <p className="wa-dim">Copyright © {new Date().getFullYear()} {profile.firstName} {profile.lastName}. All rights reserved.</p>
                <p className="wa-dim">A tribute to Windows 7 and the Microsoft team behind it, which shaped so much of my computing journey. Hand drawn, not affiliated with Microsoft.</p>
              </div>
              <Orb className="ws-orb" />
            </div>
          </section>

          <section className="ws-section">
            <h2>System</h2>
            <dl className="ws-grid">
              <dt>Status:</dt>
              <dd>{profile.status}</dd>
              <dt>Processor:</dt>
              <dd>{plain(profile.intro.map((i) => i.text).join(" "))}</dd>
              <dt>Installed languages:</dt>
              <dd>{languages}</dd>
              <dt>Experience:</dt>
              <dd>
                {experience.length} roles, {projects.length} projects
              </dd>
              <dt>Now playing:</dt>
              <dd>{profile.now}</dd>
            </dl>
          </section>

          <section className="ws-section">
            <h2>Developer name, school and workgroup settings</h2>
            <div className="ws-user">
              <Image src="/assets/images/junior-headshot.JPG" alt={`${profile.firstName} ${profile.lastName}`} width={180} height={180} sizes="96px" className="ws-avatar" />
              <dl className="ws-grid">
                <dt>Full name:</dt>
                <dd>
                  {profile.firstName} {profile.lastName}
                </dd>
                <dt>Course:</dt>
                <dd>{profile.course}</dd>
                <dt>Workgroup:</dt>
                <dd>Code + music</dd>
              </dl>
            </div>
            <div className="wa-details-actions">
              <button type="button" className="wa-btn wa-btn--default" onClick={() => open("/resume")}>
                Open resume
              </button>
              <a className="wa-btn" href={profile.resumePdf.href} target="_blank" rel="noopener noreferrer">
                Resume PDF
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
