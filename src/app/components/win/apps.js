import { caseStudies } from "@/content/caseStudies";

export const APPS = {
  resume: { title: "Resume", icon: "doc", path: "/resume", size: [940, 760] },
  projects: { title: "Projects", icon: "folder", path: "/?app=projects", size: [960, 640] },
  music: { title: "Music", icon: "music", path: "/music" },
  gallery: { title: "Gallery", icon: "photo", path: "/?app=gallery", size: [980, 700] },
  contact: { title: "Contact", icon: "mail", path: "/?app=contact", size: [880, 580] },
  grind: { title: "Grind", icon: "chart", path: "/grind" },
  home: { title: "About Oladele", icon: "user", path: "/", size: [820, 620] },
  personalize: { title: "Personalize", icon: "brush", path: "/?app=personalize", size: [820, 640] },
};

export const DESKTOP = ["resume", "projects", "music", "gallery", "contact", "grind", "home"];
export const PINNED = ["resume", "projects", "music", "gallery", "contact", "grind"];
export const PLACES = ["home", "resume", "projects", "gallery", "music", "personalize"];

export const STUDIES = caseStudies.map((c) => ({ id: `case-${c.slug}`, title: c.title, icon: "doc", path: `/projects/${c.slug}`, size: [1040, 760] }));

const titleCase = (slug) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function appFor(href) {
  const url = new URL(href, location.origin);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const q = url.searchParams.get("app");
  if (path === "/" && q && APPS[q]) return { id: q, ...APPS[q], url: APPS[q].path };
  if (path === "/projects") return { id: "projects", ...APPS.projects, url: APPS.projects.path };
  const study = STUDIES.find((s) => s.path === path);
  if (study) return { ...study, url: path };
  const hit = Object.entries(APPS).find(([, a]) => a.path === path);
  if (hit) return { id: hit[0], ...hit[1], url: path };
  return { id: `page-${path}`, title: titleCase(path.slice(1).split("/").pop() || "Page"), icon: "doc", path, url: path };
}
