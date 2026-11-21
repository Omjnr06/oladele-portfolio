"use client";
import dynamic from "next/dynamic";
import { usePrefs } from "@/lib/prefs";

const WinShell = dynamic(() => import("./WinShell"), { ssr: false });

export default function WinFrame({ children }) {
  const { pack } = usePrefs();
  return (
    <div className="win-host">
      {pack === "windows" && <WinShell />}
      <div id="win-page" className="win-page">
        <div id="win-client" className="win-client">
          {children}
        </div>
      </div>
    </div>
  );
}
