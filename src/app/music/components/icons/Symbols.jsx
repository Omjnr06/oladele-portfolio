"use client";
import React from "react";

export function Treble({ className }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="mdi-music-clef-treble" /></svg>);
}
export function Bassclef({ className }) {
  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="mdi-music-clef-bass" /></svg>);
}
export function Vinyl({ className }) {
  return (<svg viewBox="0 0 256 256" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-144a56.06,56.06,0,0,0-56,56,8,8,0,0,1-16,0,72.08,72.08,0,0,1,72-72,8,8,0,0,1,0,16Zm72,56a72.08,72.08,0,0,1-72,72,8,8,0,0,1,0-16,56.06,56.06,0,0,0,56-56,8,8,0,0,1,16,0Zm-40,0a32,32,0,1,0-32,32A32,32,0,0,0,160,128Zm-48,0a16,16,0,1,1,16,16A16,16,0,0,1,112,128Z" /></svg>);
}
export function Headphones({ className }) {
  return (<svg viewBox="0 0 256 256" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M201.89,54.66A103.43,103.43,0,0,0,128.79,24H128A104,104,0,0,0,24,128v56a24,24,0,0,0,24,24H64a24,24,0,0,0,24-24V144a24,24,0,0,0-24-24H40.36A88,88,0,0,1,128,40h.67a87.71,87.71,0,0,1,87,80H192a24,24,0,0,0-24,24v40a24,24,0,0,0,24,24h16a24,24,0,0,0,24-24V128A103.41,103.41,0,0,0,201.89,54.66ZM64,136a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V136Zm152,48a8,8,0,0,1-8,8H192a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h24Z" /></svg>);
}
export function Metronome({ className }) {
  return (<svg viewBox="0 0 256 256" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M187.14,114.84l26.78-29.46a8,8,0,0,0-11.84-10.76l-20.55,22.6-17.2-54.07A15.94,15.94,0,0,0,149.08,32H106.91A15.94,15.94,0,0,0,91.66,43.15l-50.91,160A16,16,0,0,0,56,224H200a16,16,0,0,0,15.25-20.85ZM184.72,160H146.08l28.62-31.48ZM106.91,48h42.17l20,62.9L124.46,160H71.27ZM56,208l10.18-32H189.81L200,208Z" /></svg>);
}
export function Notes({ className }) {
  return (<svg viewBox="0 0 256 256" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M212.92,17.69a8,8,0,0,0-6.86-1.45l-128,32A8,8,0,0,0,72,56V166.08A36,36,0,1,0,88,196V110.25l112-28v51.83A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.69ZM52,216a20,20,0,1,1,20-20A20,20,0,0,1,52,216ZM88,93.75V62.25l112-28v31.5ZM180,184a20,20,0,1,1,20-20A20,20,0,0,1,180,184Z" /></svg>);
}
export function Sheet({ className }) {
  return (<svg viewBox="0 -40 320 300" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"><path d="M20 60 h280 M20 100 h280 M20 140 h280 M20 180 h280 M20 220 h280"/><path d="M100 180 V70 M185 140 V30 M270 100 V-6"/><path d="M100 70 q46 -16 85 -30 M185 30 q46 -16 85 -30"/></g><g fill="currentColor"><circle cx="84" cy="180" r="17"/><circle cx="169" cy="140" r="17"/><circle cx="254" cy="100" r="17"/></g></svg>);
}

export const SYMBOL_ICONS = { treble: Treble, bassclef: Bassclef, vinyl: Vinyl, headphones: Headphones, metronome: Metronome, notes: Notes, sheet: Sheet };