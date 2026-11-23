import { profile } from "@/content/profile";
import { gallery } from "@/content/gallery";
import { highlightedProjects } from "@/content/projects";
import { experience, highlightedExperience } from "@/content/resume";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { musicLibrary } from "./music/data/musicLibrary";
import { clipSlug } from "./music/data/boardItems";
import SiteNav from "./components/SiteNav";
import Boot from "./components/boot/Boot";
import Rich from "./components/Rich";
import Tagline from "./components/home/Tagline";
import BackToTop from "./components/BackToTop";
import Gallery from "./components/home/Gallery";
import MusicSpotlight from "./components/home/MusicSpotlight";
import DotGlow from "./components/home/DotGlow";
import MarginNote from "./components/paper/MarginNote";
import PenSquiggle from "./components/paper/PenSquiggle";
import { ContactBar, ExperienceList, FeaturedProjects, SectionLabel } from "./components/home/HomeBlocks";

function featuredTracks() {
  const all = musicLibrary.flatMap((c) => c.tracks);
  const featured = all.filter((t) => t.isFeatured);
  return (featured.length ? featured : [all[0]]).map(({ id, title, originalArtist, videoUrl }) => {
    const loop = `/assets/music/generated/${clipSlug(id)}-loop.mp4`;
    return { id, title, originalArtist, videoUrl, loop: existsSync(join(process.cwd(), "public", loop)) ? loop : null };
  });
}

function Letters({ word, offset }) {
  return (
    <div className="flex">
      {word.split("").map((letter, index) => (
        <span key={index} className="hover-letter animate-scan" style={{ animationDelay: `${(index + offset) * 0.06}s` }}>
          <span className="ink-letter" style={{ "--i": index + offset }}>
            {letter}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [study, tagline] = profile.intro;
  const musicRole = experience.find((e) => e.id === profile.musicRole);

  return (
    <main className="min-h-screen w-full flex flex-row bg-ink font-sans selection:bg-accent selection:text-on-accent relative">
      <Boot auto />
      <SiteNav page="home" />

      <div className="paper-page flex-1 min-w-0 bg-journal-dots bg-ink relative overflow-x-hidden">
        <DotGlow />
        <div className="absolute left-10 h-full w-[1px] bg-accent opacity-20 pointer-events-none hidden md:block paper:hidden z-0" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-accent-2 opacity-[0.03] rounded-full blur-[120px] pointer-events-none paper:hidden" />

        <div className="home-fit relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[clamp(20px,3.6vh,40px)] px-6 py-8 pb-28 md:px-12 md:pb-8 lg:h-[100svh] lg:min-h-[800px] lg:px-16 lg:py-[clamp(24px,4.5vh,48px)] lg:paper:py-[clamp(16px,2.5vh,32px)] pill:pt-24">
          <header id="home" data-no-rule className="relative flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-4 scroll-mt-24 lg:flex-nowrap">
            <div className="relative min-w-0">
              <div className="relative w-fit">
                <h1 className="relative flex w-fit flex-wrap gap-x-3 overflow-visible text-[clamp(2.25rem,7vh,4.75rem)] font-extrabold leading-[1.05] tracking-tight text-bright md:gap-x-4">
                  <Letters word={profile.firstName} offset={0} />
                  <Letters word={profile.lastName} offset={8} />
                  <PenSquiggle />
                </h1>
                <MarginNote id="home" className="mt-1 rotate-[-3deg] lg:absolute lg:left-full lg:top-1/2 lg:mt-0 lg:ml-6 lg:-translate-y-1/2 lg:whitespace-nowrap" />
              </div>
              <p className="mt-2 max-w-3xl text-base font-light leading-relaxed text-muted lg:text-lg">
                <span className="inline-block">
                  <Rich text={study.text} em="text-bright" />
                </span>{" "}
                <span className="tagline-line inline-block">
                  <Tagline text={tagline.text} em="text-accent" />
                </span>
              </p>
            </div>
            <ContactBar />
          </header>

          <div data-no-rule className="grid min-h-0 flex-1 gap-[clamp(20px,3.2vh,32px)] paper:gap-x-[clamp(24px,4.2vh,44px)] paper:gap-y-[clamp(20px,2.8vh,36px)] lg:grid-cols-12 lg:grid-rows-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="min-h-0 lg:col-span-4">
              <ExperienceList roles={highlightedExperience} />
            </div>
            <div className="min-h-0 lg:col-span-8">
              <FeaturedProjects items={highlightedProjects} />
            </div>
            <div className="flex min-h-0 flex-col lg:col-span-4">
              <SectionLabel note="gallery" caption>Gallery</SectionLabel>
              <div className="min-h-0 flex-1 paper-taped paper-tilt-l">
                <Gallery images={gallery} />
              </div>
            </div>
            <div className="flex min-h-0 flex-col lg:col-span-8">
              <SectionLabel note="spotlight" caption>Music</SectionLabel>
              <div className="min-h-0 flex-1 paper-taped paper-tilt-r">
                <MusicSpotlight tracks={featuredTracks()} role={musicRole} />
              </div>
            </div>
          </div>
        </div>

        <BackToTop label="Back to Home" targetId="home" />
      </div>
    </main>
  );
}
