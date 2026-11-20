const PLACES = { "/": "home", "/resume": "resume", "/music": "music vault", "/grind": "the grind", "/stats": "site stats", "/lab": "lab" };

export const place = (path) => PLACES[path] ?? (path.startsWith("/projects/") ? `case study: ${path.split("/")[2]}` : path.slice(1));
