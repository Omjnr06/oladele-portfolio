"use client";
import SpotifyEmbed from "@/app/music/components/SpotifyEmbed";
import { spotifyUrl, useSong } from "@/app/music/hooks/useTopTracks";
import { useNowPlaying } from "../nowPlaying";
import "./apps.css";

export default function SpotifyApp() {
  const track = useNowPlaying();
  const song = useSong(track);

  if (!song)
    return (
      <div className="wsp-empty">
        <p>Nothing playing.</p>
        <p className="wa-dim">Open Music, go to Top 10 and double-click a song.</p>
      </div>
    );

  return (
    <div className="wsp">
      <SpotifyEmbed id={song.id} title={song.title} height={352} />
      <div className="wsp-foot">
        <span className="wa-dim">{song.live ? `No. ${song.rank + 1} in Oladele's top 10 this month` : "From Oladele's playlist"}</span>
        <a className="wa-btn" href={spotifyUrl(song.id)} target="_blank" rel="noopener noreferrer">
          Open in Spotify
        </a>
      </div>
    </div>
  );
}
