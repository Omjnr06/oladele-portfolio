"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { clipItems, clipItemsForCategory } from "@/app/music/data/boardItems";
import { musicLibrary } from "@/app/music/data/musicLibrary";
import { APPS } from "../apps";
import { useShell } from "../context";
import WinIcon from "../icons";
import Menubar from "./Menubar";
import DetailsList from "./DetailsList";
import "./apps.css";
import "./player.css";

const LOOPS = ["off", "all", "one"];
const LOOP_LABEL = { off: "Loop: off", all: "Loop: all", one: "Loop: one" };
const label = (c) => musicLibrary.find((m) => m.id === c.categoryId)?.label ?? "";

function fmt(t) {
  if (!t || !isFinite(t)) return "00:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function listFor(id, ids) {
  const clip = clipItems.find((c) => c.id === id);
  if (!clip) return { list: clipItems, idx: -1 };
  const list = ids?.length > 1 ? clipItems.filter((c) => ids.includes(c.id)) : clipItemsForCategory(clip.categoryId);
  return { list, idx: Math.max(0, list.findIndex((c) => c.id === id)) };
}

const COLUMNS = [
  { key: "title", label: "Title", render: (c) => c.title },
  { key: "cat", label: "Instrument", width: "130px", render: label },
  { key: "date", label: "Date", width: "90px", render: (c) => c.date },
];

function Icon({ d, fill = true }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={fill ? "vp-i" : "vp-i vp-i--line"}>
      <path d={d} />
    </svg>
  );
}

function Cone() {
  return <WinIcon name="cone" className="vp-cone" />;
}

export default function PlayerApp({ win, open }) {
  const { media, actions } = useShell();
  const [seen, setSeen] = useState(media?.n ?? null);
  const [state, setState] = useState(() => listFor(media?.id, media?.ids));
  const [sel, setSel] = useState(() => state.list[Math.max(0, state.idx)]?.id ?? null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(80);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState("off");
  const [shuffle, setShuffle] = useState(false);
  const [showList, setShowList] = useState(true);
  const [about, setAbout] = useState(false);
  const root = useRef(null);
  const stage = useRef(null);
  const video = useRef(null);

  if (media && media.n !== seen) {
    const next = listFor(media.id, media.ids);
    setSeen(media.n);
    setState(next);
    setSel(next.list[next.idx]?.id ?? null);
    setCur(0);
    setDur(0);
  }

  const { list, idx } = state;
  const current = idx >= 0 ? list[idx] : null;

  const playAt = useCallback((i) => {
    setState((s) => ({ ...s, idx: i }));
    setSel((prev) => list[i]?.id ?? prev);
    setCur(0);
    setDur(0);
  }, [list]);

  const step = useCallback(
    (d) => {
      if (!list.length) return;
      if (shuffle && list.length > 1) {
        let n = idx;
        while (n === idx) n = Math.floor(Math.random() * list.length);
        return playAt(n);
      }
      playAt((Math.max(0, idx) + d + list.length) % list.length);
    },
    [idx, list.length, shuffle, playAt],
  );

  const toggle = useCallback(() => {
    const v = video.current;
    if (!current) return playAt(Math.max(0, list.findIndex((c) => c.id === sel)));
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, [current, list, sel, playAt]);

  const stop = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  const seekBy = (s) => {
    const v = video.current;
    if (v?.duration) v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + s));
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stage.current?.requestFullscreen?.().catch(() => {});
  };

  useEffect(() => {
    if (video.current) {
      video.current.volume = vol / 100;
      video.current.muted = muted;
    }
  }, [vol, muted, current]);

  useEffect(() => {
    actions?.patch(win.id, { title: current ? `${current.title} - ${APPS.player.title}` : APPS.player.title });
  }, [actions, win.id, current]);

  useEffect(() => {
    root.current?.focus({ preventScroll: true });
  }, [seen]);

  useEffect(() => {
    const run = { toggle, next: () => step(1), prev: () => step(-1) };
    const on = (e) => run[e.detail]?.();
    window.addEventListener("omj-player", on);
    return () => window.removeEventListener("omj-player", on);
  }, [toggle, step]);

  const ended = () => {
    if (loop === "one") {
      video.current.currentTime = 0;
      return video.current.play().catch(() => {});
    }
    if (shuffle || idx < list.length - 1 || loop === "all") return step(1);
    setPlaying(false);
  };

  const onKeys = (e) => {
    if (e.target.closest("input, [role=listbox], [role=menubar], .cm")) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const map = {
      " ": toggle,
      ArrowRight: () => seekBy(10),
      ArrowLeft: () => seekBy(-10),
      ArrowUp: () => setVol((v) => Math.min(100, v + 5)),
      ArrowDown: () => setVol((v) => Math.max(0, v - 5)),
      f: fullscreen,
      n: () => step(1),
      p: () => step(-1),
      m: () => setMuted((m) => !m),
      s: stop,
      l: () => setLoop((l) => LOOPS[(LOOPS.indexOf(l) + 1) % LOOPS.length]),
    };
    if (!map[k] || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    map[k]();
  };

  const menus = {
    Media: [
      { label: "Open Music library", run: () => open(APPS.music.path) },
      "sep",
      { label: "Quit", run: () => actions?.close(win.id) },
    ],
    Playback: [
      { label: playing ? "Pause" : "Play", keys: "Space", run: toggle },
      { label: "Stop", keys: "S", run: stop },
      { label: "Previous", keys: "P", run: () => step(-1) },
      { label: "Next", keys: "N", run: () => step(1) },
      "sep",
      { label: "Jump forward", keys: "→", run: () => seekBy(10) },
      { label: "Jump backward", keys: "←", run: () => seekBy(-10) },
      "sep",
      { label: "Shuffle", checked: shuffle, run: () => setShuffle((s) => !s) },
      { label: LOOP_LABEL[loop], keys: "L", run: () => setLoop((l) => LOOPS[(LOOPS.indexOf(l) + 1) % LOOPS.length]) },
    ],
    Audio: [
      { label: "Increase Volume", keys: "↑", run: () => setVol((v) => Math.min(100, v + 5)) },
      { label: "Decrease Volume", keys: "↓", run: () => setVol((v) => Math.max(0, v - 5)) },
      { label: "Mute", checked: muted, keys: "M", run: () => setMuted((m) => !m) },
    ],
    View: [
      { label: "Playlist", checked: showList, run: () => setShowList((s) => !s) },
      { label: "Fullscreen", keys: "F", run: fullscreen },
    ],
    Help: [{ label: "About", run: () => setAbout(true) }],
  };

  const loud = muted ? 0 : vol;

  return (
    <div ref={root} className="wa vp" tabIndex={-1} onKeyDown={onKeys}>
      <Menubar label="Media player menu" menus={menus} />
      <div ref={stage} className="vp-stage">
        <div className="vp-row">
          <div className="vp-screen" onClick={toggle} onDoubleClick={fullscreen}>
            {current ? (
              <>
                <video
                  key={current.id}
                  ref={video}
                  src={current.videoUrl}
                  className="vp-video"
                  data-audio={current.audioOnly || undefined}
                  preload="metadata"
                  autoPlay
                  playsInline
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
                  onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
                  onEnded={ended}
                />
                {current.audioOnly && (
                  <div className="vp-audio">
                    <Cone />
                    <p>{current.title}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="vp-idle">
                <Cone />
                <p>Double-click a clip in the playlist, or pick one in Music.</p>
              </div>
            )}
          </div>
          {showList && (
            <aside className="vp-list" aria-label="Playlist">
              <p className="vp-list-head">
                Playlist <span>{list.length} clips</span>
              </p>
              <DetailsList
                label="Playlist"
                columns={COLUMNS.map((c) => (c.key === "title" ? { ...c, render: (r) => <>{current?.id === r.id && <WinIcon name="cone" className="wl-ico" />}{r.title}</> } : c))}
                rows={list}
                rowKey={(c) => c.id}
                selected={sel}
                onSelect={setSel}
                onOpen={(c) => playAt(list.findIndex((x) => x.id === c.id))}
              />
            </aside>
          )}
        </div>
        <div className="vp-seek">
          <span className="vp-time">{fmt(cur)}</span>
          <input
            type="range"
            className="vp-range"
            aria-label="Seek"
            min={0}
            max={dur || 0}
            step={0.1}
            value={Math.min(cur, dur || 0)}
            disabled={!current || !dur}
            style={{ "--p": `${dur ? (cur / dur) * 100 : 0}%` }}
            onChange={(e) => {
              if (video.current) video.current.currentTime = Number(e.target.value);
            }}
          />
          <span className="vp-time">{fmt(dur)}</span>
        </div>
        <div className="vp-ctrl">
          <button type="button" className="vp-btn vp-play" aria-label={playing ? "Pause" : "Play"} onClick={toggle}>
            {playing ? <Icon d="M4 3h3v10H4zM9 3h3v10H9z" /> : <Icon d="M4.5 2.5v11l9-5.5z" />}
          </button>
          <div className="vp-group">
            <button type="button" className="vp-btn" aria-label="Previous" onClick={() => step(-1)}>
              <Icon d="M3 3h2v10H3zM13 3v10L6 8z" />
            </button>
            <button type="button" className="vp-btn" aria-label="Stop" onClick={stop}>
              <Icon d="M4 4h8v8H4z" />
            </button>
            <button type="button" className="vp-btn" aria-label="Next" onClick={() => step(1)}>
              <Icon d="M11 3h2v10h-2zM3 3v10l7-5z" />
            </button>
          </div>
          <div className="vp-group">
            <button type="button" className="vp-btn" aria-label="Fullscreen" onClick={fullscreen}>
              <Icon fill={false} d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            </button>
            <button type="button" className="vp-btn" aria-label="Show playlist" aria-pressed={showList} onClick={() => setShowList((s) => !s)}>
              <Icon d="M2 3h9v1.6H2zM2 7h9v1.6H2zM2 11h6v1.6H2zM12 9v5l3-2.5z" />
            </button>
            <button type="button" className="vp-btn" aria-label={LOOP_LABEL[loop]} aria-pressed={loop !== "off"} data-one={loop === "one" || undefined} onClick={() => setLoop((l) => LOOPS[(LOOPS.indexOf(l) + 1) % LOOPS.length])}>
              <Icon fill={false} d="M3 9V6.5A2.5 2.5 0 0 1 5.5 4H12M10 2l2 2-2 2M13 7v2.5A2.5 2.5 0 0 1 10.5 12H4M6 14l-2-2 2-2" />
            </button>
            <button type="button" className="vp-btn" aria-label="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle((s) => !s)}>
              <Icon fill={false} d="M2 4h3l6 8h3M2 12h3l2-2.7M10 6.7L11 4h3M12.5 2.5L14 4l-1.5 1.5M12.5 10.5L14 12l-1.5 1.5" />
            </button>
          </div>
          <div className="vp-fill" />
          <button type="button" className="vp-btn vp-mute" aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted} onClick={() => setMuted((m) => !m)}>
            <WinIcon name={muted ? "mute" : "speaker"} className="vp-spk" />
          </button>
          <label className="vp-vol" style={{ "--v": `${loud}%` }}>
            <span className="vp-wedge" aria-hidden />
            <input type="range" aria-label="Volume" min={0} max={100} step={1} value={loud} onChange={(e) => {
              setVol(Number(e.target.value));
              setMuted(false);
            }} />
          </label>
          <span className="vp-pct">{loud}%</span>
        </div>
      </div>
      {about && (
        <div className="vp-about" role="dialog" aria-label="About VLC media player">
          <div className="vp-about-box">
            <Cone />
            <div>
              <h2>VLC media player</h2>
              <p>Plays the clips from Oladele&apos;s Music library.</p>
              <p className="wa-dim">A tribute to VLC media player by VideoLAN, the player that opened every file I ever threw at it. Hand drawn, not affiliated with VideoLAN.</p>
              <button type="button" className="wa-btn wa-btn--default" onClick={() => setAbout(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
