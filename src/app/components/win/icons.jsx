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
        <linearGradient id="wi-cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb24a" />
          <stop offset=".55" stopColor="#ff8a1a" />
          <stop offset="1" stopColor="#d9580f" />
        </linearGradient>
        <radialGradient id="wi-orb" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0e3a78" />
          <stop offset="0.7" stopColor="#0a2a5c" />
          <stop offset="1" stopColor="#06193a" />
        </radialGradient>
        <radialGradient id="wi-orb-glow" cx="0.5" cy="0.92" r="0.7">
          <stop offset="0" stopColor="#a6f0ff" />
          <stop offset="0.5" stopColor="#3aa8f5" stopOpacity=".7" />
          <stop offset="1" stopColor="#2a9df0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wi-orb-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity=".05" />
        </linearGradient>
        <linearGradient id="wi-orb-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc8f0" />
          <stop offset="0.5" stopColor="#1d3f6e" />
          <stop offset="1" stopColor="#6fc3ff" />
        </linearGradient>
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
  exe: (
    <>
      <rect x="5" y="9" width="38" height="32" rx="3" fill="url(#wi-paper)" stroke="#5e7391" />
      <path d="M5 12a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v5H5z" fill="url(#wi-blue)" stroke="#164d9e" />
      <circle cx="10" cy="13" r="1.4" fill="#fff" />
      <circle cx="14.5" cy="13" r="1.4" fill="#fff" opacity=".7" />
      <rect x="15" y="23" width="18" height="13" rx="2" fill="url(#wi-orange)" stroke="#a5440f" />
      <path d="M20 23v-2.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5V23" fill="none" stroke="#a5440f" strokeWidth="1.6" />
      <path d="M15 29h18" stroke="#a5440f" />
      <rect x="22.5" y="27.5" width="3" height="3" rx=".6" fill="#ffe27a" stroke="#a5440f" strokeWidth=".8" />
    </>
  ),
  notepad: (
    <>
      <rect x="9" y="7" width="30" height="36" rx="1.5" fill="url(#wi-paper)" stroke="#7d8da1" />
      <rect x="9" y="7" width="30" height="6" fill="url(#wi-blue)" stroke="#164d9e" />
      <path d="M14 5v5M20 5v5M26 5v5M32 5v5" stroke="#7d8da1" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 20h20M14 25h20M14 30h20M14 35h12" stroke="#9fb3cc" strokeWidth="1.5" />
    </>
  ),
  taskmgr: (
    <>
      <rect x="5" y="7" width="38" height="32" rx="3" fill="#0c1a12" stroke="#5e7391" />
      <path d="M9 13h30M9 19h30M9 25h30M9 31h30M15 11v24M23 11v24M31 11v24" stroke="#1f6b35" strokeWidth=".8" />
      <path d="M9 30l5-4 4 2 5-9 5 5 4-7 7 4" fill="none" stroke="#59f07a" strokeWidth="2" strokeLinejoin="round" />
      <rect x="18" y="39" width="12" height="4" fill="#9aaabf" />
    </>
  ),
  games: (
    <>
      <path d="M4 12h15l4 4h21v26H4z" fill="url(#wi-folder-back)" stroke="#a87414" />
      <path d="M4 19h40l-3 23H7z" fill="url(#wi-folder)" stroke="#b9861e" />
      <rect x="15" y="25" width="18" height="11" rx="5.5" fill="#3a3f4b" stroke="#1d2029" />
      <path d="M20 28.5v4M18 30.5h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="27.5" cy="29.5" r="1.2" fill="#59f07a" />
      <circle cx="29.5" cy="32" r="1.2" fill="#ff6b5b" />
    </>
  ),
  sudoku: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="3" fill="url(#wi-paper)" stroke="#5e7391" />
      <path d="M18 6v36M30 6v36M6 18h36M6 30h36" stroke="#1f63c6" strokeWidth="1.6" />
      <text x="12" y="15.5" textAnchor="middle" fontFamily="Segoe UI, system-ui, sans-serif" fontSize="8" fontWeight="700" fill="#1e395b">5</text>
      <text x="24" y="27.5" textAnchor="middle" fontFamily="Segoe UI, system-ui, sans-serif" fontSize="8" fontWeight="700" fill="#d9480f">3</text>
      <text x="36" y="39.5" textAnchor="middle" fontFamily="Segoe UI, system-ui, sans-serif" fontSize="8" fontWeight="700" fill="#1e395b">9</text>
    </>
  ),
  snake: (
    <>
      <rect x="5" y="5" width="38" height="38" rx="8" fill="url(#wi-green)" stroke="#23702d" />
      {shine}
      <path d="M12 34h12v-8h-9v-8h20" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="35" cy="18" r="1" fill="#23702d" />
      <circle cx="35" cy="33" r="3" fill="#ffd25a" />
    </>
  ),
  cone: (
    <>
      <path d="M6 38.5h36l2.5 4.5h-41z" fill="url(#wi-cone)" stroke="#a5440f" strokeLinejoin="round" />
      <path d="M21.5 5.5h5L36 38.5H12z" fill="url(#wi-cone)" stroke="#a5440f" strokeLinejoin="round" />
      <path d="M19.2 15h9.6l1.5 5H17.7zM15.8 26h16.4l1.5 5H14.3z" fill="#fff" />
      <path d="M22 7.5h1.6L16 36h-2z" fill="#fff" opacity=".35" />
    </>
  ),
  spotify: (
    <>
      <circle cx="24" cy="24" r="19" fill="#1db954" stroke="#128a3e" strokeWidth="1.2" />
      <path d="M13.5 18.5c7.5-2.2 15.5-1.6 21.5 1.8M15 25c6-1.6 12.4-1.1 17.3 1.6M16.5 31c4.6-1.1 9.4-.7 13.2 1.3" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
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
      <circle cx="24" cy="24" r="22.5" fill="#020b1c" opacity=".55" />
      <circle cx="24" cy="24" r="21.5" fill="url(#wi-orb)" stroke="url(#wi-orb-rim)" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="21" fill="url(#wi-orb-glow)" />
      <text x="24" y="28.5" textAnchor="middle" fontFamily="Segoe UI, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#fff" letterSpacing=".4" style={{ filter: "drop-shadow(0 0 2px rgb(120 210 255 / .9))" }}>
        OMJ
      </text>
      <path d="M6.5 21C7.5 11 15 4.5 24 4.5S40.5 11 41.5 21C36 18 30.5 17 24 17S12 18 6.5 21z" fill="url(#wi-orb-shine)" />
    </svg>
  );
}
