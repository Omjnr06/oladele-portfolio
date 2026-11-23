import { profile } from "@/content/profile";
import { contact } from "@/content/contact";
import { gallery } from "@/content/gallery";
import { projects, caseStudyHref } from "@/content/projects";
import { skills, experience, resumeProjects, education } from "@/content/resume";
import { caseStudies } from "@/content/caseStudies";
import { searchAliases } from "@/content/searchAliases";
import { musicLibrary } from "@/app/music/data/musicLibrary";

const PAGES = [
  { id: "page-home", type: "page", title: "Home", sub: "/", href: "/", keys: ["index", "main"] },
  { id: "page-resume", type: "page", title: "Resume", sub: "/resume", href: "/resume", keys: ["cv", "experience", "education", "skills"] },
  { id: "page-music", type: "page", title: "Music Vault", sub: "/music", href: "/music", keys: ["music", "covers", "clips", "piano", "guitar", "drums", "bass"] },
  { id: "page-grind", type: "page", title: "Grind", sub: "/grind", href: "/grind", keys: ["internships", "jobs", "applications", "roles", "new grad"] },
  { id: "section-gallery", type: "section", title: "Gallery", sub: "Home", href: "/#gallery", keys: ["photos", "pictures"] },
  { id: "section-spotlight", type: "section", title: "Music spotlight", sub: "Home", href: "/#spotlight", keys: ["music", "clip", "live session"] },
  { id: "section-experience", type: "section", title: "Experience", sub: "Home", href: "/#experience", keys: ["jobs", "work history", "roles"] },
  { id: "section-projects", type: "section", title: "Projects", sub: "All projects", href: "/projects", keys: ["work", "portfolio"] },
  { id: "section-contact", type: "section", title: "Contact", sub: "Home", href: "/#contact", keys: ["email", "reach out", "socials"] },
];

const blockWords = (blocks) =>
  blocks.flatMap((b) => {
    if (b.type === "tags") return b.items;
    return [];
  });

const blockText = (blocks) =>
  blocks
    .flatMap((b) => {
      if (b.type === "heading") return [b.text];
      if (b.type === "points") return b.items.map((i) => (typeof i === "string" ? i : i.title));
      return [];
    })
    .filter(Boolean);

function projectItems() {
  const linked = new Map(resumeProjects.filter((r) => r.project).map((r) => [r.project, r]));
  return projects.map((p) => {
    const study = p.caseStudy && caseStudies.find((c) => c.slug === p.caseStudy);
    const resume = linked.get(p.id);
    const href = study ? caseStudyHref(study.slug) : p.links.live || p.links.github || "/projects";
    return {
      id: `project-${p.id}`,
      type: "project",
      title: p.title,
      sub: study ? "Case study" : p.categories.map((c) => c.toLowerCase()).join(", "),
      href,
      external: !study && href.startsWith("http"),
      tags: [...new Set([...p.stack, ...(study ? study.sections.flatMap((s) => blockWords(s.blocks)) : [])])],
      keys: [...p.categories, ...(p.internship ? ["internship"] : []), ...(study ? study.sections.map((s) => s.label) : [])],
      text: [p.summary, study?.summary, study?.kicker, ...(study ? study.sections.flatMap((s) => blockText(s.blocks)) : []), ...(resume?.points ?? [])].filter(Boolean).join(" "),
    };
  });
}

function caseStudyOnly() {
  const ids = new Set(projects.map((p) => p.caseStudy).filter(Boolean));
  return caseStudies
    .filter((c) => !ids.has(c.slug))
    .map((c) => ({
      id: `project-${c.id}`,
      type: "project",
      title: c.title,
      sub: "Case study",
      href: caseStudyHref(c.slug),
      tags: [...new Set(c.sections.flatMap((s) => blockWords(s.blocks)))],
      keys: [c.badge?.label, ...c.sections.map((s) => s.label)].filter(Boolean),
      text: [c.summary, c.kicker, ...c.sections.flatMap((s) => blockText(s.blocks)), ...(resumeProjects.find((r) => r.project === c.project)?.points ?? [])].filter(Boolean).join(" "),
    }));
}

function resumeItems() {
  const known = new Set([...projects.map((p) => p.id), ...caseStudies.map((c) => c.project)]);
  return [
    ...experience.map((e) => ({
      id: `exp-${e.id}`,
      type: "experience",
      title: e.role,
      sub: `${e.company} · ${e.date}`,
      href: `/resume#${e.id}`,
      keys: [e.company, e.location],
      text: e.points.join(" "),
    })),
    ...resumeProjects
      .filter((r) => !known.has(r.project))
      .map((r) => ({
        id: `exp-${r.id}`,
        type: "experience",
        title: r.title,
        sub: `Project · ${r.date}`,
        href: `/resume#${r.id}`,
        tags: r.stack.split(",").map((s) => s.trim()),
        text: r.points.join(" "),
      })),
    ...education.map((e) => ({
      id: `exp-${e.id}`,
      type: "experience",
      title: e.degree,
      sub: `${e.school} · ${e.date}`,
      href: `/resume#${e.id}`,
      keys: [e.school, "education"],
      text: e.details,
    })),
    ...skills.flatMap((g) =>
      g.items.map((s) => ({
        id: `skill-${g.id}-${s}`,
        type: "skill",
        title: s,
        sub: g.category.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()),
        href: "/resume#skills",
      })),
    ),
  ];
}

const instrument = (id) => id.charAt(0) + id.slice(1).toLowerCase();

function musicItems() {
  return musicLibrary.flatMap((cat) =>
    cat.tracks.map((t) => ({
      id: `clip-${t.id}`,
      type: "clip",
      title: t.title,
      sub: [cat.label, t.originalArtist].filter(Boolean).join(" · "),
      href: `/music?track=${encodeURIComponent(t.id)}`,
      keys: [cat.label, instrument(cat.id), t.originalArtist, t.location].filter(Boolean),
      text: t.notes ?? "",
    })),
  );
}

function photoItems() {
  return gallery.map((g) => ({
    id: `photo-${g.id}`,
    type: "photo",
    title: g.caption,
    sub: "Gallery",
    href: `/?photo=${g.id}`,
    keys: g.id.split("-"),
  }));
}

function linkItems() {
  return [
    ...contact.map((c) =>
      c.id === "email"
        ? { id: "action-copy-email", type: "action", title: "Copy email", sub: c.href.replace("mailto:", ""), act: "copy", value: c.href.replace("mailto:", ""), keys: ["email", "contact", "mail"] }
        : { id: `link-${c.id}`, type: "link", title: c.label, sub: c.href.replace(/^https?:\/\/(www\.)?/, ""), href: c.href, external: true, keys: ["contact", "social"] },
    ),
    { id: "action-resume-pdf", type: "action", title: "Open resume PDF", sub: profile.resumePdf.href.split("/").pop(), href: profile.resumePdf.href, external: true, keys: ["resume", "cv", "pdf", "download"] },
  ];
}

function chips(items) {
  const count = new Map();
  for (const p of projects) for (const s of p.stack) count.set(s, (count.get(s) ?? 0) + 1);
  for (const g of skills) for (const s of g.items) count.set(s, (count.get(s) ?? 0) + 0.5);
  const tech = [...count].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => s);
  const music = musicLibrary.map((c) => instrument(c.id)).slice(0, 2);
  return [...tech, ...music].filter((c) => items.some((i) => i.title === c || i.tags?.includes(c) || i.keys?.includes(c)));
}

export function buildPaletteIndex() {
  const items = [...PAGES, ...projectItems(), ...caseStudyOnly(), ...resumeItems(), ...musicItems(), ...photoItems(), ...linkItems()];
  return { items, chips: chips(items), aliases: searchAliases };
}
