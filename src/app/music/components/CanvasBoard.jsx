"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PillNav from "./PillNav";
import MusicSidebar from "./MusicSidebar";
import useCulling from "../hooks/useCulling";
import { boardItems, CANVAS_SIZE, CENTER } from "../data/boardItems";

const INITIAL_SCALE = 0.55;
const FOCUS_SCALE = 0.95;
const MIN_SCALE = 0.42;
const MAX_SCALE = 2.5;
const DOT = 22;

export default function CanvasBoard() {
  const apiRef = useRef(null);
  const gridRef = useRef(null);
  const [view, setView] = useState({ scale: INITIAL_SCALE, x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [start, setStart] = useState(null);
  const raf = useRef(0);

  useEffect(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const sx = (vw - CANVAS_SIZE * INITIAL_SCALE) / 2;
    const sy = (vh - CANVAS_SIZE * INITIAL_SCALE) / 2;
    setStart({ sx, sy });
    setView({ scale: INITIAL_SCALE, x: sx, y: sy });
    setViewport({ w: vw, h: vh });
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (start && gridRef.current) {
      gridRef.current.style.backgroundPosition = `${start.sx}px ${start.sy}px`;
      gridRef.current.style.backgroundSize = `${DOT * INITIAL_SCALE}px ${DOT * INITIAL_SCALE}px`;
    }
  }, [start]);

  const onTransformed = useCallback((ref) => {
    const s = ref.state || {};
    if (gridRef.current) {
      gridRef.current.style.backgroundPosition = `${s.positionX}px ${s.positionY}px`;
      gridRef.current.style.backgroundSize = `${DOT * s.scale}px ${DOT * s.scale}px`;
    }
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      setView({ scale: s.scale, x: s.positionX, y: s.positionY });
    });
  }, []);

  const visible = useCulling(boardItems, view, viewport);

  const centerOn = useCallback((worldX, worldY, scale, time = 700) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const px = vw / 2 - worldX * scale;
    const py = vh / 2 - worldY * scale;
    apiRef.current?.setTransform(px, py, scale, time, "easeOutCubic");
  }, []);

  const flyToItem = useCallback((anchorId) => {
    const it = boardItems.find((b) => b.id === anchorId);
    if (it) centerOn(CENTER + it.x, CENTER + it.y, FOCUS_SCALE);
  }, [centerOn]);

  const goHome = useCallback(() => centerOn(CENTER, CENTER, INITIAL_SCALE), [centerOn]);

  if (!start) return <div className="mv-board" />;

  return (
    <div className="mv-board">
      <div ref={gridRef} className="mv-grid-bg" aria-hidden="true" />

      <MusicSidebar />

      <TransformWrapper
        ref={apiRef}
        initialScale={INITIAL_SCALE}
        initialPositionX={start.sx}
        initialPositionY={start.sy}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        limitToBounds={false}
        centerOnInit={false}
        wheel={{ step: 0.007, smoothStep: 0.0009 }}
        pinch={{ step: 2 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        onTransformed={onTransformed}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            <TransformComponent
              wrapperClass="mv-tc-wrapper"
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }}
            >
              <div className="mv-canvas" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                <div id="mv-home" className="mv-title" style={{ left: CENTER, top: CENTER }}>
                  Oladele&apos;s<br />Music Portfolio
                </div>

                {visible.map((it) => (
                  <div
                    key={it.id}
                    id={it.id}
                    className="mv-anchor"
                    style={{ left: CENTER + it.x, top: CENTER + it.y, width: it.size, height: it.size }}
                  >
                    <span>{it.label}</span>
                  </div>
                ))}
              </div>
            </TransformComponent>

            <div className="mv-zoom-controls">
              <button className="mv-zoom-btn" onClick={() => zoomIn(0.2)} aria-label="Zoom in">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </button>
              <button className="mv-zoom-btn" onClick={() => zoomOut(0.2)} aria-label="Zoom out">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14" /></svg>
              </button>
            </div>
          </>
        )}
      </TransformWrapper>

      <PillNav onFly={flyToItem} onHome={goHome} />
      <div className="mv-hint">drag to pan · scroll to zoom · pill-nav to fly</div>
    </div>
  );
}