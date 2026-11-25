"use client";
import { useCallback, useMemo, useState } from "react";
import { clipItems, SONGS } from "@/app/music/data/boardItems";
import { musicLibrary } from "@/app/music/data/musicLibrary";
import useDeepLink from "@/app/music/hooks/useDeepLink";
import useSpotifyMeta from "@/app/music/hooks/useSpotifyMeta";
import WinIcon from "../icons";
import FileView, { Stack, selectedText, useSelection } from "./FileView";
import "./apps.css";
import "./music.css";

const ALL = "ALL";
const PLAYLIST = "PLAYLIST";
const FOLDERS = [
  { id: ALL, label: "All music" },
  ...musicLibrary.map((m) => ({ id: m.id, label: m.label })),
  { id: PLAYLIST, label: "My Playlist" },
];
const SONG_ITEMS = SONGS.map((s) => ({ id: `song-${s.spotifyTrackId}`, song: s.spotifyTrackId }));
const spotify = (id) => `https://open.spotify.com/track/${id}`;
const folderOf = (id) => FOLDERS.find((f) => f.id === id)?.label ?? "";
const fileName = (c) => `${c.title}.${c.audioOnly ? "mp3" : "mp4"}`;
const idOf = (c) => c.id;

function listFor(folder) {
  if (folder === PLAYLIST) return SONG_ITEMS;
  if (folder === ALL) return clipItems;
  return clipItems.filter((c) => c.categoryId === folder);
}

function play(clips) {
  if (clips.length) window.__omjWin?.play(clips[0].id, clips.map(idOf));
}

const openSong = (s) => window.open(spotify(s.song), "_blank", "noopener,noreferrer");

const copy = (text) => navigator.clipboard?.writeText(text).catch(() => {});

function ClipThumb({ c }) {
  return (
    <span className="wa-thumb wm-thumb" data-audio={c.audioOnly || undefined}>
      {c.thumb ? <img src={c.thumb} alt="" loading="lazy" draggable="false" /> : <WinIcon name="music" className="wa-thumb-ico" />}
      {c.thumb && <span className="wm-film" aria-hidden />}
    </span>
  );
}

function SongThumb({ s }) {
  const meta = useSpotifyMeta(s.song);
  return (
    <span className="wa-thumb wm-thumb wm-song">
      {meta?.thumb ? <img src={meta.thumb} alt="" loading="lazy" draggable="false" /> : <WinIcon name="music" className="wa-thumb-ico" />}
    </span>
  );
}

function SongName({ s }) {
  const meta = useSpotifyMeta(s.song);
  return <span>{meta?.title || "Spotify track"}</span>;
}

function SongDetails({ s }) {
  const meta = useSpotifyMeta(s.song);
  return (
    <>
      <SongThumb s={s} />
      <div>
        <h3>{meta?.title || "Spotify track"}</h3>
        <p className="wa-dim">In Oladele&apos;s playlist on Spotify</p>
        <div className="wa-details-actions">
          <a className="wa-btn wa-btn--default" href={spotify(s.song)} target="_blank" rel="noopener noreferrer">
            Open in Spotify
          </a>
        </div>
      </div>
    </>
  );
}

function ClipDetails({ c }) {
  return (
    <>
      <ClipThumb c={c} />
      <div>
        <h3>{c.title}</h3>
        <dl className="wm-props">
          <dt>Original artist</dt>
          <dd>{c.originalArtist}</dd>
          <dt>Recorded</dt>
          <dd>{c.date}</dd>
          <dt>Location</dt>
          <dd>{c.location}</dd>
        </dl>
        {c.notes && <p>{c.notes}</p>}
        <div className="wa-details-actions">
          <button type="button" className="wa-btn wa-btn--default" onClick={() => play([c])}>
            Play
          </button>
        </div>
      </div>
    </>
  );
}

const thumbOf = (it) => (it.song ? <SongThumb s={it} /> : <ClipThumb c={it} />);

export default function MusicApp() {
  const selection = useSelection(clipItems[0]?.id ?? null);
  const [folder, setFolder] = useState(ALL);
  const list = useMemo(() => listFor(folder), [folder]);
  const songs = folder === PLAYLIST;
  const picked = list.filter((c) => selection.sel.includes(c.id));
  const one = picked.length === 1 ? picked[0] : null;

  const go = (f) => {
    setFolder(f);
    selection.only(listFor(f)[0]?.id ?? null);
  };

  const { only } = selection;
  const onDeep = useCallback(
    (c) => {
      setFolder(c.categoryId);
      only(c.id);
      play([c]);
    },
    [only],
  );
  useDeepLink(onDeep);

  const open = (items) => {
    const clips = items.filter((it) => !it.song);
    if (clips.length) play(clips);
    items.filter((it) => it.song).forEach(openSong);
  };

  const menuFor = (items) => {
    if (!items.length) return [{ label: "Select all", onSelect: () => selection.set((s) => ({ ...s, sel: list.map(idOf) })) }];
    if (items[0].song)
      return [
        { label: "Open in Spotify", strong: true, onSelect: () => items.forEach(openSong) },
        { label: items.length > 1 ? "Copy links" : "Copy link", onSelect: () => copy(items.map((s) => spotify(s.song)).join("\n")) },
      ];
    return [
      { label: items.length > 1 ? `Play ${items.length} clips` : "Play", strong: true, onSelect: () => play(items) },
      { label: items.length > 1 ? "Copy links" : "Copy link", onSelect: () => copy(items.map((c) => `${location.origin}/music?track=${encodeURIComponent(c.trackId)}`).join("\n")) },
    ];
  };

  return (
    <div className="wa wm">
      <div className="wa-addr">
        <WinIcon name="music" className="wa-nav-ico" />
        <div className="wa-crumbs" aria-label="Location">
          <button type="button" className="wa-crumb" onClick={() => go(ALL)}>
            Libraries
          </button>
          <span className="wa-crumb-sep">›</span>
          <button type="button" className="wa-crumb" onClick={() => go(ALL)}>
            Music
          </button>
          {folder !== ALL && (
            <>
              <span className="wa-crumb-sep">›</span>
              <span className="wa-crumb">{folderOf(folder)}</span>
            </>
          )}
        </div>
      </div>
      <div className="wa-cmd">
        {songs ? (
          <button type="button" className="wa-cmd-btn" disabled={!picked.length} onClick={() => picked.forEach(openSong)}>
            Open in Spotify
          </button>
        ) : (
          <>
            <button type="button" className="wa-cmd-btn" onClick={() => play(list)}>
              <WinIcon name="cone" className="wa-nav-ico" />
              Play all
            </button>
            {picked.length > 1 && (
              <button type="button" className="wa-cmd-btn" onClick={() => play(picked)}>
                Play selected
              </button>
            )}
          </>
        )}
      </div>
      <div className="wa-row">
        <nav className="wa-nav" aria-label="Music folders">
          <p className="wa-nav-head">Music</p>
          {FOLDERS.map((f) => (
            <button key={f.id} type="button" className="wa-nav-item" aria-pressed={folder === f.id} onClick={() => go(f.id)}>
              <WinIcon name={f.id === ALL ? "music" : "folder"} className="wa-nav-ico" />
              {f.label}
            </button>
          ))}
        </nav>
        <div className="wa-main">
          <FileView
            key={folder}
            label={folderOf(folder)}
            items={list}
            idOf={idOf}
            selection={selection}
            onOpen={open}
            menuFor={menuFor}
            renderItem={(it) =>
              it.song ? (
                <>
                  <SongThumb s={it} />
                  <SongName s={it} />
                </>
              ) : (
                <>
                  <ClipThumb c={it} />
                  <span>{fileName(it)}</span>
                </>
              )
            }
          />
        </div>
      </div>
      <div className="wa-details">
        {one ? (
          one.song ? <SongDetails s={one} /> : <ClipDetails c={one} />
        ) : picked.length ? (
          <Stack thumbs={picked.map(thumbOf)} count={picked.length} />
        ) : (
          <p className="wa-dim">{list.length} items</p>
        )}
      </div>
      <div className="wa-status">
        <span>{list.length} items</span>
        {picked.length > 0 && <span>{selectedText(picked.length)}</span>}
      </div>
    </div>
  );
}
