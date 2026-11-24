const ALL = 0x3fe;

const boxOf = (i) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3);

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function masks(grid) {
  const row = Array(9).fill(0);
  const col = Array(9).fill(0);
  const box = Array(9).fill(0);
  grid.forEach((v, i) => {
    if (!v) return;
    const b = 1 << v;
    row[Math.floor(i / 9)] |= b;
    col[i % 9] |= b;
    box[boxOf(i)] |= b;
  });
  return { row, col, box };
}

function solve(grid, limit, random) {
  const g = [...grid];
  const { row, col, box } = masks(g);
  let count = 0;
  let first = null;
  const go = () => {
    let best = -1;
    let bestFree = 0;
    let bestN = 10;
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue;
      const free = ALL & ~(row[Math.floor(i / 9)] | col[i % 9] | box[boxOf(i)]);
      let n = 0;
      for (let v = free; v; v &= v - 1) n++;
      if (n < bestN) {
        best = i;
        bestFree = free;
        bestN = n;
        if (n <= 1) break;
      }
    }
    if (best < 0) {
      count++;
      if (!first) first = [...g];
      return count >= limit;
    }
    if (!bestN) return false;
    const r = Math.floor(best / 9);
    const c = best % 9;
    const b = boxOf(best);
    const digits = [];
    for (let v = 1; v <= 9; v++) if (bestFree & (1 << v)) digits.push(v);
    for (const v of random ? shuffle(digits) : digits) {
      const bit = 1 << v;
      g[best] = v;
      row[r] |= bit;
      col[c] |= bit;
      box[b] |= bit;
      if (go()) return true;
      row[r] &= ~bit;
      col[c] &= ~bit;
      box[b] &= ~bit;
    }
    g[best] = 0;
    return false;
  };
  go();
  return { count, first };
}

export const LEVELS = { easy: 40, medium: 32, hard: 27 };

export function makePuzzle(level = "easy") {
  const solution = solve(Array(81).fill(0), 1, true).first;
  const puzzle = [...solution];
  let left = 81;
  for (const i of shuffle([...Array(81).keys()])) {
    if (left <= LEVELS[level]) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (solve(puzzle, 2, false).count !== 1) puzzle[i] = keep;
    else left--;
  }
  return { puzzle, solution };
}

export function conflicts(grid) {
  const bad = new Set();
  const groups = [];
  for (let k = 0; k < 9; k++) {
    groups.push(Array.from({ length: 9 }, (_, j) => k * 9 + j));
    groups.push(Array.from({ length: 9 }, (_, j) => j * 9 + k));
    groups.push(Array.from({ length: 9 }, (_, j) => (Math.floor(k / 3) * 3 + Math.floor(j / 3)) * 9 + (k % 3) * 3 + (j % 3)));
  }
  for (const cells of groups) {
    const seen = new Map();
    for (const i of cells) {
      const v = grid[i];
      if (!v) continue;
      if (seen.has(v)) {
        bad.add(i);
        bad.add(seen.get(v));
      } else seen.set(v, i);
    }
  }
  return bad;
}

export const peers = (a, b) => Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9 || boxOf(a) === boxOf(b);
