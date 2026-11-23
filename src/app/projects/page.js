import { projects } from "@/content/projects";
import SiteNav from "../components/SiteNav";
import WrittenName from "../components/paper/WrittenName";
import TypedText from "../components/TypedText";
import ProjectsExplorer from "../components/projects/ProjectsExplorer";

export const metadata = {
  title: "Projects | Oladele Magbadelo",
  description: "Every project Oladele Magbadelo has built: full stack apps, machine learning, data science and infrastructure.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen w-full flex flex-row bg-ink font-sans selection:bg-accent selection:text-on-accent relative">
      <SiteNav page="projects" />
      <div className="paper-page flex-1 min-w-0 bg-journal-dots bg-ink relative overflow-x-clip">
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8 pb-28 md:px-12 md:pb-8 lg:h-[100svh] lg:min-h-[760px] lg:px-16 lg:py-10 pill:pt-24">
          <header data-no-rule className="flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <div>
              <WrittenName className="mb-4" />
              <h1 className="font-mono text-xl uppercase tracking-[0.3em] text-bright md:text-2xl paper:font-hand paper:text-5xl paper:normal-case paper:tracking-normal">
                <TypedText text="Projects and hackathons" step={0.035} />
              </h1>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted paper:font-hand paper:text-xl paper:normal-case paper:tracking-normal">
              {projects.length} projects
            </p>
          </header>
          <ProjectsExplorer />
        </div>
      </div>
    </main>
  );
}
