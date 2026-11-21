import { profile } from "@/content/profile";

export default function MarginNote({ id, note, className = "" }) {
  const text = note ?? profile.marginNotes?.[id];
  if (!text) return null;
  return <p className={`hidden paper:block pointer-events-none font-hand text-[22px] leading-tight text-accent-2 ${className}`}>{text}</p>;
}
