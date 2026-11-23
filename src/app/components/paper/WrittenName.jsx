import { profile } from "@/content/profile";

export default function WrittenName({ as: Tag = "p", look = "hidden paper:block text-[32px] text-accent-2", className = "" }) {
  const name = `${profile.firstName} ${profile.lastName}`;
  return (
    <Tag aria-hidden data-no-rule data-replay="" className={`written-name relative w-fit font-hand leading-none ${look} ${className}`}>
      <span className="invisible whitespace-nowrap pr-[0.15em]">{name}</span>
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <text x="0" y="52%" dominantBaseline="central">
          {name}
        </text>
      </svg>
      <span className="written-line" />
    </Tag>
  );
}
