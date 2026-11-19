"use client";
import { useEffect, useState } from "react";
import Nav from "./nav/Nav";
import { onScroll, scrollToId } from "@/lib/scroll";

const jump = (id) => (e) => {
  e.preventDefault();
  scrollToId(id);
};

function useHomeSection() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const update = () => {
      const projects = document.getElementById("projects");
      const contact = document.getElementById("contact");
      if (contact && contact.getBoundingClientRect().top <= 300) setActive("contact");
      else if (projects && projects.getBoundingClientRect().top <= 300) setActive("projects");
      else setActive("home");
    };
    update();
    return onScroll(update);
  }, []);
  return active;
}

function useHashOnLoad() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => scrollToId(id), 150);
    return () => clearTimeout(t);
  }, []);
}

const item = (key, label, href, onClick) => ({ key, label, href, onClick });

function HomeNav() {
  const active = useHomeSection();
  useHashOnLoad();
  return (
    <Nav
      active={active}
      items={[
        item("home", "Home", "#home", jump("home")),
        item("projects", "Projects", "#projects", jump("projects")),
        item("resume", "Resume", "/resume"),
        item("music", "Music", "/music"),
        item("contact", "Contact", "#contact", jump("contact")),
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
        item("projects", "Projects", "/#projects"),
        item("resume", "Resume", "/resume"),
        item("music", "Music", "/music"),
        item("contact", "Contact", "#contact", jump("contact")),
      ]}
    />
  );
}

const OTHER = [item("home", "Home", "/#home"), item("projects", "Projects", "/#projects"), item("resume", "Resume", "/resume"), item("music", "Music", "/music"), item("contact", "Contact", "/#contact")];

export default function SiteNav({ page }) {
  if (page === "home") return <HomeNav />;
  if (page === "resume") return <ResumeNav />;
  if (page === "music") return <Nav active="music" items={OTHER} shape="dock" />;
  return <Nav active={page === "case" ? "projects" : null} items={OTHER} />;
}
