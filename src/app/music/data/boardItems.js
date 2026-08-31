

export const CANVAS_SIZE = 6000;        
export const CENTER = CANVAS_SIZE / 2;   


export const boardItems = [
  { id: "inst-piano",  type: "instrument", instrumentId: "piano",  label: "Piano",  x: -1100, y: -520, size: 360 },
  { id: "inst-drums",  type: "instrument", instrumentId: "drums",  label: "Drums",  x:  1180, y: -420, size: 360 },
  { id: "inst-guitar", type: "instrument", instrumentId: "guitar", label: "Guitar", x: -900,  y:  760, size: 360 },
  { id: "inst-bass",   type: "instrument", instrumentId: "bass",   label: "Bass",   x:  1040, y:  700, size: 360 },
];


export const NAV_INSTRUMENTS = [
  { instrumentId: "piano",  anchorId: "inst-piano",  label: "Piano" },
  { instrumentId: "drums",  anchorId: "inst-drums",  label: "Drums" },
  { instrumentId: "guitar", anchorId: "inst-guitar", label: "Guitar" },
  { instrumentId: "bass",   anchorId: "inst-bass",   label: "Bass" },
];