import { contact } from "@/content/contact";

export const dynamic = "force-static";
export const revalidate = 900;

const USER = contact.find((c) => c.id === "github")?.href.split("/").filter(Boolean).pop();
const SKIP_REFS = ["refs/heads/bot-state"];
const BOT = /\b(bot|github-actions|automated|auto-update)\b/i;

function describe(e) {
  const repo = e.repo?.name?.split("/").pop();
  if (!repo) return null;
  const p = e.payload ?? {};
  if (e.type === "PushEvent") {
    if (SKIP_REFS.includes(p.ref)) return null;
    const commits = p.commits ?? [];
    if (commits.length && commits.every((c) => BOT.test(c.author?.name ?? "") || BOT.test(c.message ?? ""))) return null;
    return { action: "pushed to", repo };
  }
  if (e.type === "PullRequestEvent") {
    if (p.action === "merged" || (p.action === "closed" && p.pull_request?.merged)) return { action: "merged a PR in", repo };
    if (p.action === "opened") return { action: "opened a PR in", repo };
    return null;
  }
  if (e.type === "CreateEvent" && p.ref_type === "repository") return { action: "created", repo };
  if (e.type === "ReleaseEvent" && p.action === "published") return { action: "released", repo };
  return null;
}

export async function GET() {
  const empty = { activity: null };
  if (!USER) return Response.json(empty);
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_FEED_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_FEED_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/events/public?per_page=50`, { headers, next: { revalidate: 900 } });
    if (!res.ok) return Response.json(empty);
    const events = (await res.json()).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    for (const e of events) {
      const d = describe(e);
      if (d) return Response.json({ activity: { ...d, url: `https://github.com/${e.repo.name}`, at: e.created_at } });
    }
    return Response.json(empty);
  } catch {
    return Response.json(empty);
  }
}
