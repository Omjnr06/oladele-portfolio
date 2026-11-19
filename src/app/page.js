import { profile } from "@/content/profile";
import { gallery } from "@/content/gallery";
import { projects, featuredProjects, projectCategories, caseStudyHref } from "@/content/projects";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { musicLibrary } from "./music/data/musicLibrary";
import { clipSlug } from "./music/data/boardItems";
import SiteNav from "./components/SiteNav";
import Rich from "./components/Rich";
import BackToTop from "./components/BackToTop";
import { ContactSection } from "./components/ContactLinks";
import Gallery from "./components/home/Gallery";
import Spotlight from "./components/home/Spotlight";
import ProjectBrowser from "./components/home/ProjectBrowser";

const withHref = (p) => ({ ...p, caseStudyHref: p.caseStudy ? caseStudyHref(p.caseStudy) : null });

function featuredTracks() {
  const all = musicLibrary.flatMap((c) => c.tracks);
  const featured = all.filter((t) => t.isFeatured);
  return (featured.length ? featured : [all[0]]).map(({ id, title, originalArtist, notes, videoUrl }) => {
    const loop = `/assets/music/generated/${clipSlug(id)}-loop.mp4`;
    return { id, title, originalArtist, notes, videoUrl, loop: existsSync(join(process.cwd(), "public", loop)) ? loop : null };
  });
}

function Letters({ word, offset }) {
  return (
    <div className="flex">
      {word.split("").map((letter, index) => (
        <span key={index} className="hover-letter animate-scan" style={{ animationDelay: `${(index + offset) * 0.06}s` }}>
          {letter}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [study, tagline] = profile.intro;

  return (
    <main className="min-h-screen w-full flex flex-row bg-ink font-sans selection:bg-accent selection:text-on-accent relative">
      <SiteNav page="home" />

      <div className="flex-1 min-w-0 bg-journal-dots bg-ink relative overflow-x-hidden">
        <div className="absolute left-10 h-full w-[1px] bg-accent opacity-20 pointer-events-none hidden md:block z-0" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-accent-2 opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-accent opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="px-6 md:px-16 lg:px-24 w-full z-10 py-16 md:py-24 max-w-7xl mx-auto flex flex-col">
          <div id="home" className="mb-16 scroll-mt-24">
            <h1 className="text-[2.8rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[7rem] font-extrabold mb-8 md:mb-10 tracking-tight flex flex-wrap gap-x-3 md:gap-x-5 overflow-visible pl-1 md:pl-2">
              <Letters word={profile.firstName} offset={0} />
              <Letters word={profile.lastName} offset={8} />
            </h1>

            <div className="max-w-3xl space-y-6 text-muted">
              <p className="text-xl md:text-2xl leading-relaxed font-light">
                <Rich text={study.text} em="text-bright" />
              </p>
              <p className="text-lg md:text-xl leading-relaxed font-light border-l border-bright/10 pl-6">
                <Rich text={tagline.text} em="text-accent" />
              </p>
            </div>
          </div>

          <Gallery images={gallery} />

          <Spotlight projects={featuredProjects.map(withHref)} tracks={featuredTracks()} />

          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
            <h1 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-bright uppercase">PROJECTS AND HACKATHONS</h1>
            <div className="h-[1px] flex-1 bg-bright/5" />
          </div>

          <ProjectBrowser projects={projects.map(withHref)} categories={projectCategories} />

          <ContactSection compact />
        </div>

        <BackToTop label="Back to Home" targetId="home" />
      </div>
    </main>
  );
}
