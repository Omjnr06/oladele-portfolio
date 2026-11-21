export const APPS = {
  resume: { title: "Resume", icon: "doc", path: "/resume" },
  projects: { title: "Projects", icon: "folder", path: "/?app=projects" },
  music: { title: "Music", icon: "music", path: "/music" },
  gallery: { title: "Gallery", icon: "photo", path: "/?app=gallery" },
  contact: { title: "Contact", icon: "mail", path: "/?app=contact" },
  grind: { title: "Grind", icon: "chart", path: "/grind" },
  home: { title: "About Oladele", icon: "user", path: "/" },
};

export const DESKTOP = ["resume", "projects", "music", "gallery", "contact", "grind", "home"];

const titleCase = (slug) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function appFor(href) {
  const url = new URL(href, location.origin);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const q = url.searchParams.get("app");
  if (path === "/" && q && APPS[q]) return { id: q, ...APPS[q], url: APPS[q].path };
  const study = path.match(/^\/projects\/([a-z0-9-]+)$/);
  if (study) return { id: `case-${study[1]}`, title: `${titleCase(study[1])} case study`, icon: "doc", path, url: path };
  const hit = Object.entries(APPS).find(([, a]) => a.path === path);
  if (hit) return { id: hit[0], ...hit[1], url: path };
  return { id: `page-${path}`, title: titleCase(path.slice(1).split("/").pop() || "Page"), icon: "doc", path, url: path };
}
