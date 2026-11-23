import { caseStudyHref } from "@/content/projects";

export function projectLinks(p) {
  const out = [];
  if (p.caseStudy) out.push({ id: "case", href: caseStudyHref(p.caseStudy), label: "Read case study", internal: true });
  if (p.links?.live) out.push({ id: "live", href: p.links.live, label: p.links.live.startsWith("/") ? "Open it live" : "Visit live site", internal: p.links.live.startsWith("/") });
  if (p.links?.github) out.push({ id: "github", href: p.links.github, label: "View source", internal: false });
  return out;
}

export const displayTitle = (p) => p.title.split(" - ")[0];
