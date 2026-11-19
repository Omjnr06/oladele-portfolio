"use client";
import SiteNav from "../../components/SiteNav";

export default function MusicSidebar() {
  return (
    <div className="mv-sidebar-dock" data-surface="stage">
      <div className="mv-sidebar-edge" aria-hidden="true" />
      <div className="mv-sidebar absolute left-0 top-0 h-screen w-20">
        <SiteNav page="music" />
      </div>
    </div>
  );
}