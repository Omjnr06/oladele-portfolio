import { companyKey } from "./normalize";

export function hydrateRows(rows) {
  return rows.map(([tier, track, company, title, location, regions, season, source, url, seen]) => ({
    id: url, tier, track, company, ck: companyKey(company), title, location, regions, season, source, url, seen,
  }));
}
