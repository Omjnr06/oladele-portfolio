export const ROUTES = [
  { name: "home", path: "/" },
  { name: "resume", path: "/resume" },
  { name: "jam", path: "/projects/jam" },
  { name: "pimplenet", path: "/projects/pimplenet" },
  { name: "vault", path: "/projects/vault" },
  { name: "music", path: "/music" },
  { name: "grind", path: "/grind" },
];

export const SIZES = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1366x600", width: 1366, height: 600 },
  { name: "1280x540", width: 1280, height: 540 },
  { name: "ipad", width: 820, height: 1180 },
  { name: "phone", width: 390, height: 700 },
];

const IGNORED = [/_vercel\/(insights|speed-insights)/, /favicon/];

export function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const where = m.location()?.url || "";
    if (IGNORED.some((r) => r.test(m.text()) || r.test(where))) return;
    errors.push(`console: ${m.text()} ${where}`);
  });
  page.on("requestfailed", (r) => {
    if (IGNORED.some((re) => re.test(r.url()))) return;
    if (r.failure()?.errorText === "net::ERR_ABORTED") return;
    errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });
  return errors;
}
