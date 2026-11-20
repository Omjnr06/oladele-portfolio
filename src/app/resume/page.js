import { profile } from "@/content/profile";
import { skills, experience, resumeProjects, education } from "@/content/resume";
import SiteNav from "../components/SiteNav";
import BackToTop from "../components/BackToTop";
import { ContactSection } from "../components/ContactLinks";
import ReportHeader from "../components/paper/ReportHeader";
import MarginNote from "../components/paper/MarginNote";

function Heading({ dot = "accent", children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-2 h-2 rounded-full ${dot === "accent" ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-accent-2 shadow-[0_0_10px_var(--color-accent-2)]"}`} />
      <h2 className="font-mono text-sm tracking-[0.2em] text-bright">{children}</h2>
    </div>
  );
}

function Node({ hover = "accent" }) {
  return <div className={`absolute w-3 h-3 bg-panel border-2 border-bright/40 rounded-full -left-[6.5px] top-1.5 transition-colors ${hover === "accent" ? "hover:border-accent" : "hover:border-accent-2"}`} />;
}

function Points({ points }) {
  return (
    <ul className="space-y-3">
      {points.map((point, i) => (
        <li key={i} className="text-bright/75 leading-relaxed flex items-start text-sm">
          <span className="text-accent-2 mr-3 font-mono mt-0.5">{`>`}</span>
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
        <div className="px-6 md:px-16 lg:px-24 py-16 md:py-24 max-w-7xl mx-auto w-full z-10 flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/3 space-y-12 lg:sticky lg:top-24 h-fit lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto lg:pr-3 lg:-mr-3 lg:pb-6">
            <div>
              <ReportHeader path="/resume" className="mb-8" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-bright mb-2">{profile.firstName} {profile.lastName}</h1>
              <p className="font-mono text-xs tracking-widest text-accent mb-4">{profile.title}</p>
              <div className="inline-block px-3 py-1 bg-bright/5 border border-bright/10 rounded-sm font-mono text-[11px] text-muted">{profile.status}</div>
            </div>

            <a href={profile.resumePdf.href} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden bg-panel border border-bright/10 text-bright font-mono text-sm px-6 py-4 w-full block transition hover:border-accent hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] rounded-md">
              <span className="relative z-10 flex items-center justify-between">
                <span>{`> EXPORT_PDF`}</span>
                <span className="text-muted text-xs">{profile.resumePdf.size}</span>
              </span>
              <div className="absolute top-0 left-0 h-full bg-accent w-0 group-hover:w-full transition duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-10" />
            </a>

            <div id="skills" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[11px] text-muted">SKILLS</span>
                <div className="h-[1px] flex-1 bg-bright/5" />
              </div>
              <div className="space-y-6">
                {skills.map((group) => (
                  <div key={group.id}>
                    <h3 className="font-mono text-[11px] tracking-widest text-accent-2 mb-3 uppercase">[{group.category}]</h3>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span key={item} className="px-3 py-1 bg-bright/5 border border-bright/5 text-bright text-xs rounded-full hover:bg-bright/10 transition-colors cursor-default">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 lg:pl-10 lg:border-l border-bright/5 space-y-16 pb-12">
            <div>
              <MarginNote id="resume" className="mb-3 rotate-[-2deg]" />
              <Heading>EXPERIENCE</Heading>
              <div className="space-y-12 relative border-l border-bright/10 ml-1">
                {experience.map((exp) => (
                  <div key={exp.id} id={exp.id} className="relative pl-8 scroll-mt-24">
                    <Node />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-xl font-bold text-bright tracking-tight">{exp.role}</h3>
                      <span className="font-mono text-[11px] text-muted whitespace-nowrap">{exp.date}</span>
                    </div>
                    <div className="font-mono text-xs text-accent mb-4">{exp.company} {"//"} {exp.location}</div>
                    <Points points={exp.points} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Heading>PROJECTS</Heading>
              <div className="space-y-12 relative border-l border-bright/10 ml-1">
                {resumeProjects.map((prj) => (
                  <div key={prj.id} id={prj.id} className="relative pl-8 scroll-mt-24">
                    <Node />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-xl font-bold text-bright tracking-tight">{prj.title}</h3>
                      <span className="font-mono text-[11px] text-muted whitespace-nowrap">{prj.date}</span>
                    </div>
                    <div className="font-mono text-[11px] text-muted mb-4 flex flex-wrap gap-2">STACK: <span className="text-accent-2">{prj.stack}</span></div>
                    <Points points={prj.points} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Heading dot="accent-2">EDUCATION</Heading>
              <div className="space-y-10 relative border-l border-bright/10 ml-1">
                {education.map((edu) => (
                  <div key={edu.id} id={edu.id} className="relative pl-8 scroll-mt-24">
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

        <ContactSection />
      </div>

      <BackToTop label="Back to Top" />
    </main>
  );
}
