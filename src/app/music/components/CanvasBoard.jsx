"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PillNav from "./PillNav";
import MusicSidebar from "./MusicSidebar";
import InstrumentNode from "./Nodes/InstrumentNode";
import ClipNode from "./Nodes/ClipNode";
import ClipPlayer from "./ClipPlayer";
import MusicTitle from "./MusicTitle";
import useCulling from "../hooks/useCulling";
import useDeepLink from "../hooks/useDeepLink";
import { boardItems, instrumentItems, clipItems, CANVAS_SIZE, CENTER, focusLayout } from "../data/boardItems";

const INITIAL_SCALE = 0.55;
const FOCUS_SCALE = 0.95;
const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;
const DOT = 40;

export default function CanvasBoard() {
  const apiRef = useRef(null);
  const gridRef = useRef(null);
  const pctRef = useRef(null);
  const [view, setView] = useState({ scale: INITIAL_SCALE, x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [start, setStart] = useState(null);
  const [hoveredClip, setHoveredClip] = useState(null);
  const [selectedClip, setSelectedClip] = useState(null);
  const [focus, setFocus] = useState(null);
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
      const ds0 = Math.max(26, DOT * INITIAL_SCALE);
      gridRef.current.style.backgroundSize = `${ds0}px ${ds0}px`;
    }
  }, [start]);

  const onTransform = useCallback((ref, state) => {
    const s = state || ref?.state || {};
    if (gridRef.current) {
      gridRef.current.style.backgroundPosition = `${s.positionX}px ${s.positionY}px`;
      const ds = Math.max(26, DOT * s.scale);
      gridRef.current.style.backgroundSize = `${ds}px ${ds}px`;
    }
    if (pctRef.current && s.scale) {
      pctRef.current.textContent = `${Math.round((s.scale / INITIAL_SCALE) * 100)}%`;
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

  const openClipDeep = useCallback((clipItem) => {
    centerOn(CENTER + clipItem.x, CENTER + clipItem.y, 0.9, 700);
    setSelectedClip(clipItem);
  }, [centerOn]);

  useDeepLink(openClipDeep);

  const enterFocus = useCallback((key) => {
    const inst = instrumentItems.find(
      (it) => it.instrumentId === key || it.id === key || it.categoryId === key
    );
    if (!inst) return;
    const layout = focusLayout(inst.categoryId);
    setFocus(layout);
    const vw = window.innerWidth, vh = window.innerHeight;
    const padV = 150, padH = 120;
    const fitH = (vh - padV) / layout.bounds.height;
    const fitW = (vw - padH) / layout.bounds.width;
    const scale = Math.max(MIN_SCALE, Math.min(0.55, fitH, fitW));
    const fx = CENTER + layout.instFocus.x;
    const fy = CENTER + layout.bounds.top + layout.bounds.height / 2;
    centerOn(fx, fy, scale, 650);
  }, [centerOn]);

  const exitFocus = useCallback(() => {
    setFocus(null);
    centerOn(CENTER, CENTER, INITIAL_SCALE, 650);
  }, [centerOn]);

  const handleInstrumentClick = useCallback((categoryId) => {
    enterFocus(categoryId);
  }, [enterFocus]);

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
        centerZoomedOut={false}
        disablePadding
        wheel={{ step: 0.007, smoothStep: 0.0009 }}
        pinch={{ step: 2 }}
        panning={{ velocityDisabled: true }}
        alignmentAnimation={{ disabled: true }}
        velocityAnimation={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        onTransform={onTransform}
      >
        <TransformComponent
              wrapperClass="mv-tc-wrapper"
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }}
            >
              <div className="mv-canvas" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                <div className="mv-title-wrap" style={{ left: CENTER, top: CENTER, opacity: focus ? 0 : 1, pointerEvents: focus ? "none" : "auto", transition: "opacity .4s ease" }}>
                  <MusicTitle />
                </div>

                {(focus ? boardItems : visible).map((it) => {
                  if (it.type === "instrument") {
                    const isFocused = focus && it.categoryId === focus.categoryId;
                    const dimmed = focus && !isFocused;
                    const fx = isFocused ? focus.instFocus.x : it.x;
                    const fy = isFocused ? focus.instFocus.y : it.y;
                    return (
                      <InstrumentNode
                        key={it.id}
                        item={it}
                        onOpen={handleInstrumentClick}
                        focusX={fx}
                        focusY={fy}
                        dimmed={dimmed}
                      />
                    );
                  }
                  if (it.type === "clip") {
                    const inFocusCat = focus && focus.categoryId === it.categoryId;
                    const slot = inFocusCat ? focus.slots.find((sl) => sl.id === it.id) : null;
                    const slotIdx = inFocusCat ? focus.slots.findIndex((sl) => sl.id === it.id) : 0;
                    const dimmed = focus && it.categoryId !== focus.categoryId;
                    return (
                      <ClipNode
                        key={it.id}
                        item={it}
                        hoveredId={hoveredClip}
                        onHover={setHoveredClip}
                        onOpen={setSelectedClip}
                        focusX={slot ? slot.x : it.x}
                        focusY={slot ? slot.y : it.y}
                        dimmed={dimmed}
                        delay={inFocusCat ? slotIdx * 0.035 : 0}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </TransformComponent>
      </TransformWrapper>

      <div className="mv-zoom-controls">
        <button className="mv-zoom-btn" onClick={() => apiRef.current?.zoomIn(0.2)} aria-label="Zoom in">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <div className="mv-zoom-pct" ref={pctRef}>100%</div>
        <button className="mv-zoom-btn" onClick={() => apiRef.current?.zoomOut(0.2)} aria-label="Zoom out">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
      </div>

      <PillNav onFly={enterFocus} onHome={() => { exitFocus(); goHome(); }} />
      <div className="mv-hint">drag to pan · scroll to zoom · pill-nav to fly</div>

      {focus ? (
        <button className="mv-exit-focus mv-exit-focus--tl" onClick={exitFocus}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l-6 6 6 6M3 12h14M21 4v16" /></svg>
          Exit Focus
        </button>
      ) : null}

      {selectedClip ? (
        <ClipPlayer clip={selectedClip} onClose={() => setSelectedClip(null)} />
      ) : null}
    </div>
  );
}