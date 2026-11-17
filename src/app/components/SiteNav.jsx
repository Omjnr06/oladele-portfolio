"use client";
import { useEffect, useState } from "react";
import NavRail from "./NavRail";
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

function HomeNav() {
  const active = useHomeSection();
  useHashOnLoad();
  return (
    <NavRail
      active={active}
      items={[
        { key: "home", label: "Home", href: "#home", onClick: jump("home") },
        { key: "projects", label: "Projects", href: "#projects", onClick: jump("projects") },
        { key: "resume", label: "Resume", href: "/resume" },
        { key: "music", label: "Music", href: "/music" },
        { key: "contact", label: "Contact", href: "#contact", onClick: jump("contact") },
      ]}
    />
  );
}

function ResumeNav() {
  return (
    <NavRail
      active="resume"
      items={[
        { key: "home", label: "Home", href: "/#home" },
        { key: "projects", label: "Projects", href: "/#projects" },
        { key: "resume", label: "Resume", href: "/resume" },
        { key: "music", label: "Music", href: "/music" },
        { key: "contact", label: "Contact", href: "#contact", onClick: jump("contact") },
      ]}
    />
  );
}

export default function SiteNav({ page }) {
  return page === "home" ? <HomeNav /> : <ResumeNav />;
}
