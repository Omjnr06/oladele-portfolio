"use client";
import { useEffect, useState } from "react";
import Nav from "./nav/Nav";
import { scrollToId } from "@/lib/scroll";
import { CONTACT_EVENT } from "@/lib/events";

const jump = (id) => (e) => {
  e.preventDefault();
  scrollToId(id);
};

function useHashOnLoad() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => scrollToId(id), 150);
    return () => clearTimeout(t);
  }, []);
}

const item = (key, label, href, onClick) => ({ key, label, href, onClick });

const openContact = (e) => {
  e.preventDefault();
  window.dispatchEvent(new Event(CONTACT_EVENT));
};

const CONTACT = item("contact", "Contact", "#contact", openContact);

function HomeNav() {
  useHashOnLoad();
  return (
    <Nav
      active="home"
      items={[
        item("home", "Home", "#home", jump("home")),
        item("projects", "Projects", "/projects"),
        item("resume", "Resume", "/resume"),
        item("music", "Music", "/music"),
        CONTACT,
      ]}
    />
  );
}

function ResumeNav() {
  useHashOnLoad();
  return (
    <Nav
      active="resume"
      items={[
        item("home", "Home", "/#home"),
        item("projects", "Projects", "/projects"),
        item("resume", "Resume", "/resume"),
        item("music", "Music", "/music"),
        CONTACT,
      ]}
    />
  );
}

const OTHER = [item("home", "Home", "/#home"), item("projects", "Projects", "/projects"), item("resume", "Resume", "/resume"), item("music", "Music", "/music"), CONTACT];

export default function SiteNav({ page }) {
  if (page === "home") return <HomeNav />;
  if (page === "resume") return <ResumeNav />;
  if (page === "music") return <Nav active="music" items={OTHER} shape="dock" />;
  return <Nav active={page === "case" || page === "projects" ? "projects" : null} items={OTHER} />;
}
