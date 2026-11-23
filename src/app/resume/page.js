import { profile } from "@/content/profile";
import { skills, experience, resumeProjects, education } from "@/content/resume";
import SiteNav from "../components/SiteNav";
import BackToTop from "../components/BackToTop";
import { ICONS } from "../components/ContactLinks";
import { contact } from "@/content/contact";
import CompanyLogo from "../components/CompanyLogo";
import TypedText from "../components/TypedText";
import WrittenName from "../components/paper/WrittenName";
import MarginNote from "../components/paper/MarginNote";

function Heading({ dot = "accent", children }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-2 h-2 rounded-full paper:hidden ${dot === "accent" ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-accent-2 shadow-[0_0_10px_var(--color-accent-2)]"}`} />
      <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-bright paper:font-hand paper:text-[32px] paper:normal-case paper:tracking-normal paper:text-accent-2 paper:underline paper:decoration-2 paper:underline-offset-[6px]">{children}</h2>
    </div>
  );
}

function Node({ hover = "accent" }) {
  return <div className={`absolute w-3 h-3 bg-panel border-2 border-bright/40 rounded-full -left-[6.5px] top-1.5 transition-colors paper:hidden ${hover === "accent" ? "hover:border-accent" : "hover:border-accent-2"}`} />;
}

function Points({ points }) {
  return (
    <ul className="space-y-2 paper:space-y-0">
      {points.map((point, i) => (
        <li key={i} className="text-bright/75 leading-relaxed flex items-start text-sm">
          <span aria-hidden className="text-accent-2 mr-3 font-mono mt-0.5 paper:font-hand paper:mt-0 paper:text-lg">
            <span className="paper:hidden">{`>`}</span>
            <span className="hidden paper:inline">–</span>
          </span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ResumePage() {
  return (
    <main className="min-h-screen w-full flex flex-row bg-ink font-sans selection:bg-accent selection:text-on-accent relative">
      <SiteNav page="resume" />

      <div className="paper-page flex-1 min-w-0 bg-ink relative overflow-x-clip">
        <div className="px-6 md:px-12 lg:px-16 py-10 md:py-14 pill:pt-24 max-w-7xl mx-auto w-full z-10 flex flex-col lg:flex-row gap-10 lg:gap-12">
          <div className="w-full lg:w-[30%] lg:min-w-[300px] lg:shrink-0 space-y-8 lg:sticky lg:top-10 h-fit lg:max-h-[calc(100svh-5rem)] lg:overflow-y-auto lg:pr-3 lg:-mr-3 lg:pb-6 lg:paper:static lg:paper:max-h-none lg:paper:overflow-visible">
            <div>
              <h1 className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-extrabold leading-tight tracking-tight text-bright mb-2 paper:font-normal">
                <span className="sr-only">{profile.firstName} {profile.lastName}</span>
                <TypedText text={`${profile.firstName} ${profile.lastName}`} label={false} className="whitespace-nowrap paper:hidden" />
                <WrittenName as="span" look="hidden paper:inline-block text-[44px] tracking-normal" />
              </h1>
              <p className="font-mono text-xs tracking-widest text-accent mb-4">{profile.title}</p>
              <div className="inline-block px-3 py-1 bg-bright/5 border border-bright/10 rounded-sm font-mono text-[11px] text-muted paper:bg-panel paper:border-line">{profile.status}</div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <a href={profile.resumePdf.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  View resume
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>
                </a>
                <a href={profile.resumePdf.href} download className="inline-flex h-11 items-center rounded-lg border border-bright/10 bg-panel px-4 text-sm text-bright transition-[border-color,transform] duration-150 hover:border-accent/50 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  Download
                </a>
              </div>
              <div id="contact" className="grid grid-flow-col auto-cols-fr gap-2 scroll-mt-24">
                {contact.map((c) => (
                  <a key={c.id} href={c.href} target={c.id === "email" ? undefined : "_blank"} rel="noopener noreferrer" aria-label={c.label} title={c.label} className="grid h-10 place-items-center rounded-lg border border-bright/10 bg-panel text-muted transition-[color,border-color,transform] duration-150 hover:border-accent/50 hover:text-accent active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                    <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>{ICONS[c.icon]}</svg>
                  </a>
                ))}
              </div>
            </div>

            <div id="skills" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[11px] text-muted paper:font-hand paper:text-[32px] paper:leading-none paper:text-accent-2 paper:underline paper:decoration-2 paper:underline-offset-[6px]">
                  <span className="paper:hidden">SKILLS</span>
                  <span className="hidden paper:inline">Skills</span>
                </span>
                <div className="h-[1px] flex-1 bg-bright/5 paper:hidden" />
              </div>
              <dl className="space-y-3 paper:space-y-0">
                {skills.map((group) => (
                  <div key={group.id}>
                    <dt className="font-mono text-[11px] tracking-[0.12em] text-accent-2 mb-1 uppercase paper:mb-0 paper:font-hand paper:text-[22px] paper:normal-case paper:tracking-normal">{group.category.toLowerCase()}</dt>
                    <dd className="text-sm leading-relaxed text-bright/80">
                      {group.items.map((s, i) => (
                        <span key={s} className="paper:mr-4 paper:whitespace-nowrap">
                          <svg aria-hidden viewBox="0 0 16 16" className="mr-1 hidden h-3.5 w-3.5 align-[-1px] text-accent-2 paper:inline-block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 8.5 6 12l7.5-8.5" />
                          </svg>
                          {s}
                          {i < group.items.length - 1 && <span className="paper:hidden">, </span>}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="w-full lg:w-[70%] lg:pl-10 lg:border-l border-bright/5 space-y-12 pb-12">
            <div>
              <MarginNote id="resume" className="mb-3 rotate-[-2deg]" />
              <Heading>Experience</Heading>
              <div className="space-y-8 relative border-l border-bright/10 ml-1 paper:border-accent-2/30">
                {experience.map((exp) => (
                  <div key={exp.id} id={exp.id} data-rule-lead className="group relative pl-8 scroll-mt-24">
                    <Node />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-lg font-bold text-bright tracking-tight">{exp.role}</h3>
                      <span className="font-mono text-[11px] text-muted whitespace-nowrap">{exp.date}</span>
                    </div>
                    <div className="font-mono text-xs text-accent mb-3 paper:mb-0">
                      <CompanyLogo src={exp.logo} className="mr-2 h-4 align-[-4px]" />
                      {exp.company} {"//"} {exp.location}
                    </div>
                    <Points points={exp.points} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Heading>Projects</Heading>
              <div className="space-y-8 relative border-l border-bright/10 ml-1 paper:border-accent-2/30">
                {resumeProjects.map((prj) => (
                  <div key={prj.id} id={prj.id} data-rule-lead className="relative pl-8 scroll-mt-24">
                    <Node />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-lg font-bold text-bright tracking-tight">{prj.title}</h3>
                      <span className="font-mono text-[11px] text-muted whitespace-nowrap">{prj.date}</span>
                    </div>
                    <div className="font-mono text-[11px] text-muted mb-3 flex flex-wrap gap-2">STACK: <span className="text-accent-2">{prj.stack}</span></div>
                    <Points points={prj.points} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Heading dot="accent-2">Education</Heading>
              <div className="space-y-8 relative border-l border-bright/10 ml-1 paper:border-accent-2/30">
                {education.map((edu) => (
                  <div key={edu.id} id={edu.id} data-rule-lead className="relative pl-8 scroll-mt-24">
                    <Node hover="accent-2" />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-lg font-bold text-bright tracking-tight">{edu.degree}</h3>
                      <span className="font-mono text-[11px] text-muted whitespace-nowrap">{edu.date}</span>
                    </div>
                    <div className="font-mono text-xs text-accent-2 mb-2">{edu.school}</div>
                    <p className="text-bright/75 leading-relaxed text-sm">{edu.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <BackToTop label="Back to Top" />
    </main>
  );
}
