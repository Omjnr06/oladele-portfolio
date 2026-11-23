import { projects, projectCategories, caseStudyHref } from "@/content/projects";
import SiteNav from "../components/SiteNav";
import WrittenName from "../components/paper/WrittenName";
import ProjectBrowser from "../components/home/ProjectBrowser";
import TypedText from "../components/TypedText";

export const metadata = {
  title: "Projects | Oladele Magbadelo",
  description: "Every project Oladele Magbadelo has built: full stack apps, machine learning, data science and infrastructure.",
};

const withHref = (p) => ({ ...p, caseStudyHref: p.caseStudy ? caseStudyHref(p.caseStudy) : null });

export default function ProjectsPage() {
  return (
    <main className="min-h-screen w-full flex flex-row bg-ink font-sans selection:bg-accent selection:text-on-accent relative">
      <SiteNav page="projects" />
      <div className="paper-page flex-1 min-w-0 bg-journal-dots bg-ink relative overflow-x-clip">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 md:px-16 md:py-16 pill:pt-24">
          <WrittenName className="mb-10" />
          <h1 className="mb-8 font-mono text-xl uppercase tracking-[0.3em] text-bright md:text-2xl">
            <TypedText text="Projects and hackathons" step={0.035} />
          </h1>
          <ProjectBrowser projects={projects.map(withHref)} categories={projectCategories} />
        </div>
      </div>
    </main>
  );
}
