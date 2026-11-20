import { profile } from "@/content/profile";

const PAGES = ["/", "/resume", "/projects/vault", "/projects/jam", "/projects/pimplenet", "/grind"];
const DATE = (process.env.NEXT_PUBLIC_BUILT_AT || "").slice(0, 10).replaceAll("-", ".");

export default function ReportHeader({ path, className = "" }) {
  const page = PAGES.indexOf(path) + 1;
  const cell = "px-3 py-1.5";
  return (
    <div className={`hidden paper:grid mb-10 max-w-xl grid-cols-[1fr_auto] border border-line font-mono text-[11px] uppercase tracking-[0.06em] text-muted ${className}`}>
      <span className={`${cell} border-b border-r border-line`}>
        Name <span className="normal-case tracking-normal text-fg">{profile.firstName} {profile.lastName}</span>
      </span>
      <span className={`${cell} border-b border-line`}>
        Page <span className="text-fg">{page || "–"}</span> of <span className="text-fg">{PAGES.length}</span>
      </span>
      <span className={`${cell} border-r border-line`}>
        Course <span className="normal-case tracking-normal text-fg">{profile.course}</span>
      </span>
      <span className={cell}>
        Date <span className="text-fg">{DATE}</span>
      </span>
    </div>
  );
}
