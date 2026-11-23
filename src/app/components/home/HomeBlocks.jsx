import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { contact } from "@/content/contact";
import { caseStudyHref } from "@/content/projects";
import { ICONS } from "../ContactLinks";
import CompanyLogo from "../CompanyLogo";

export function SectionLabel({ children, note, action, caption = false, taped = false }) {
  const text = note && profile.marginNotes?.[note];
  return (
    <div className={`mb-3 flex items-baseline justify-between gap-4 ${caption ? "paper:order-last paper:mb-0 paper:mt-3 paper:justify-center" : taped ? "paper:mb-5" : ""}`}>
      <h2 className={`font-mono text-[11px] uppercase tracking-[0.12em] text-muted ${text ? "paper:hidden" : ""}`}>{children}</h2>
      {text && <p className="hidden paper:block font-hand text-xl leading-none text-accent-2">{text}</p>}
      {action}
    </div>
  );
}

const linkCls =
  "inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ExperienceList({ roles }) {
  return (
    <section id="experience" aria-labelledby="home-experience" className="relative flex h-full min-h-0 flex-col paper-note paper-tape-top">
      <SectionLabel action={<Link href="/resume" className={linkCls}>Full resume</Link>}>
        <span id="home-experience">Experience</span>
      </SectionLabel>
      <ol className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden paper:gap-2 [@media(max-height:800px)]:gap-2">
        {roles.map((r) => (
          <li key={r.id} className="group border-l border-bright/10 pl-4 transition-colors duration-150 hover:border-accent paper:border-accent-2/40">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-bright">{r.role}</h3>
              <span className="shrink-0 font-mono text-[11px] text-muted">{r.date.replace(" - ", " – ")}</span>
            </div>
            <p className="text-sm text-accent">
              <CompanyLogo src={r.logo} className="mr-2 h-[18px] align-[-4px]" />
              {r.company}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-2 paper:line-clamp-1 [@media(max-height:860px)]:line-clamp-1">{r.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function target(p) {
  if (p.caseStudy) return { href: caseStudyHref(p.caseStudy), label: "Read case study", internal: true };
  const live = p.links?.live;
  if (live) return { href: live, label: live.startsWith("/") ? "Open it live" : "Visit live site", internal: live.startsWith("/") };
  if (p.links?.github) return { href: p.links.github, label: "View source", internal: false };
  return null;
}

export function FeaturedProjects({ items }) {
  return (
    <section id="projects" aria-labelledby="home-projects" className="flex h-full min-h-0 flex-col scroll-mt-24">
      <SectionLabel note="projects" taped action={<Link href="/projects" className={linkCls}>All projects</Link>}>
        <span id="home-projects">Featured projects</span>
      </SectionLabel>
      <ul className="grid min-h-0 flex-1 gap-4 sm:grid-cols-3 paper:gap-6">
        {items.map((p, i) => {
          const go = target(p);
          const title = p.title.split(" - ")[0];
          return (
            <li key={p.id} className={`group relative flex min-h-[220px] transition-[translate] duration-200 hover:-translate-y-1 sm:min-h-0 paper-tape-top ${i === 1 ? "paper-tilt-r" : "paper-tilt-l"}`}>
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-bright/10 bg-panel transition-[border-color] duration-200 group-hover:border-accent/50 paper-note-card">
                <div className="relative min-h-[96px] flex-1 overflow-hidden bg-ink sm:max-h-[40vh]" data-surface="media">
                  <Image src={p.media.image} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="flex flex-col gap-1 p-3 lg:p-4">
                  <h3 className="text-base font-semibold tracking-tight text-bright">
                    {go ? (
                      go.internal ? (
                        <Link href={go.href} className="after:absolute after:inset-0 focus-visible:outline-none after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent">
                          {title}
                        </Link>
                      ) : (
                        <a href={go.href} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 focus-visible:outline-none after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent">
                          {title}
                        </a>
                      )
                    ) : (
                      title
                    )}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted line-clamp-2">{p.tagline}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[11px] text-muted">{p.stack.slice(0, 3).join(", ")}</span>
                    {go && <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{go.label}</span>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const QUICK = ["email", "linkedin", "github", "x"];

export function ContactBar() {
  const links = contact.filter((c) => QUICK.includes(c.id));
  return (
    <div id="contact" className="flex shrink-0 items-center gap-2 scroll-mt-24">
      <a
        href={profile.resumePdf.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        View resume
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </a>
      {links.map((c) => (
        <a
          key={c.id}
          href={c.href}
          target={c.id === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={c.label}
          title={c.label}
          className="grid h-11 w-11 place-items-center rounded-lg border border-bright/10 bg-panel text-muted transition-[color,border-color,transform] duration-150 hover:border-accent/50 hover:text-accent active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
            {ICONS[c.icon]}
          </svg>
        </a>
      ))}
    </div>
  );
}
