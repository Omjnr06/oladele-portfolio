export function IconDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <linearGradient id="wi-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe7f1" />
        </linearGradient>
        <linearGradient id="wi-folder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset="1" stopColor="#e9b53c" />
        </linearGradient>
        <linearGradient id="wi-folder-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c55a" />
          <stop offset="1" stopColor="#c98f1d" />
        </linearGradient>
        <linearGradient id="wi-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset="1" stopColor="#1f63c6" />
        </linearGradient>
        <linearGradient id="wi-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9be27a" />
          <stop offset="1" stopColor="#2f8f3a" />
        </linearGradient>
        <linearGradient id="wi-violet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7a6ff" />
          <stop offset="1" stopColor="#6a3fd0" />
        </linearGradient>
        <linearGradient id="wi-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc07a" />
          <stop offset="1" stopColor="#e0601c" />
        </linearGradient>
        <radialGradient id="wi-orb" cx="0.5" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#bfe6ff" />
          <stop offset="0.45" stopColor="#2f8fe0" />
          <stop offset="1" stopColor="#0b3c86" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const shine = <path d="M6 6h36v14C30 22 18 22 6 20z" fill="#fff" opacity=".25" />;

const ICONS = {
  doc: (
    <>
      <path d="M11 3h19l9 9v33H11z" fill="url(#wi-paper)" stroke="#7d8da1" />
      <path d="M30 3v9h9" fill="#cfd9e6" stroke="#7d8da1" />
      <path d="M16 20h17M16 25h17M16 30h17M16 35h11" stroke="#5d82b8" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  folder: (
    <>
      <path d="M4 12h15l4 4h21v26H4z" fill="url(#wi-folder-back)" stroke="#a87414" />
      <path d="M4 19h40l-3 23H7z" fill="url(#wi-folder)" stroke="#b9861e" />
      <path d="M6 21h36" stroke="#fff" opacity=".7" />
    </>
  ),
  music: (
    <>
      <rect x="5" y="5" width="38" height="38" rx="8" fill="url(#wi-violet)" stroke="#4b2a9e" />
      {shine}
      <path d="M20 33V14l14-3v18" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="17" cy="33" r="4" fill="#fff" />
      <circle cx="31" cy="30" r="4" fill="#fff" />
    </>
  ),
  photo: (
    <>
      <rect x="5" y="9" width="38" height="31" rx="3" fill="#fff" stroke="#7d8da1" />
      <rect x="9" y="13" width="30" height="21" fill="url(#wi-blue)" />
      <path d="M9 34l9-10 6 6 5-5 10 9z" fill="#3f9a45" />
      <circle cx="31" cy="18" r="3" fill="#ffe27a" />
    </>
  ),
  mail: (
    <>
      <rect x="4" y="11" width="40" height="27" rx="3" fill="url(#wi-paper)" stroke="#7d8da1" />
      <path d="M5 13l19 14 19-14" fill="none" stroke="#3f6fb6" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 37l14-12M43 37L29 25" stroke="#9aaabf" />
    </>
  ),
  chart: (
    <>
      <rect x="5" y="5" width="38" height="38" rx="8" fill="url(#wi-green)" stroke="#23702d" />
      {shine}
      <path d="M13 33l7-8 6 5 9-12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="35" cy="18" r="2.5" fill="#fff" />
    </>
  ),
  user: (
    <>
      <rect x="5" y="5" width="38" height="38" rx="8" fill="url(#wi-orange)" stroke="#a5440f" />
      {shine}
      <circle cx="24" cy="19" r="7" fill="#fff" />
      <path d="M11 39c2-8 7-11 13-11s11 3 13 11" fill="#fff" />
    </>
  ),
  brush: (
    <>
      <rect x="5" y="5" width="38" height="38" rx="8" fill="url(#wi-blue)" stroke="#164d9e" />
      {shine}
      <path d="M33 11l4 4-13 13-4-4z" fill="#fff" />
      <path d="M19 26l4 4c-1 5-5 7-10 6 2-2 2-4 2-6s2-4 4-4z" fill="#ffe27a" stroke="#fff" />
    </>
  ),
  speaker: (
    <>
      <path d="M8 19h7l9-8v26l-9-8H8z" fill="currentColor" />
      <path d="M30 18a8 8 0 0 1 0 12M34 13a15 15 0 0 1 0 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  mute: (
    <>
      <path d="M8 19h7l9-8v26l-9-8H8z" fill="currentColor" />
      <path d="M30 18l10 12M40 18L30 30" stroke="#ff6b5b" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  power: (
    <>
      <path d="M17 12a15 15 0 1 0 14 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 6v17" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
};

export default function WinIcon({ name, className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {ICONS[name] ?? ICONS.doc}
    </svg>
  );
}

export function Orb({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="url(#wi-orb)" stroke="#06244f" strokeWidth="1.5" />
      <ellipse cx="24" cy="15" rx="15" ry="8" fill="#fff" opacity=".35" />
      <text x="24" y="29" textAnchor="middle" fontFamily="Segoe UI, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#fff" letterSpacing=".5">OMJ</text>
    </svg>
  );
}
