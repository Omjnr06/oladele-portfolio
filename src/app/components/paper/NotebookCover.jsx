import Image from "next/image";
import { profile } from "@/content/profile";

export default function NotebookCover({ photo, className = "" }) {
  return (
    <div aria-hidden className={`nb-cover ${className}`}>
      <span className="book-spine" />
      <span className="book-band" />
      <div className="book-label">
        <p className="book-title font-hand">Oladele&apos;s Portfolio</p>
        <p className="book-sub font-mono">{profile.course}</p>
      </div>
      <p className="book-owner font-hand">property of {profile.firstName} {profile.lastName}</p>
      {photo && (
        <figure className="book-photo">
          <Image src="/assets/images/junior-headshot.JPG" alt="" width={180} height={180} sizes="180px" loading="eager" className="book-photo-img" />
        </figure>
      )}
    </div>
  );
}
