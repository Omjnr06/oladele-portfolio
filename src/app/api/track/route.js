import { NextResponse } from "next/server";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;
const TRACK_SECRET = process.env.TRACK_SECRET;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function handle(company, role, location, link, source, secret) {
  if (!TRACK_SECRET || secret !== TRACK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }
  if (!company) {
    return NextResponse.json({ error: "missing company" }, { status: 400 });
  }

  const props = {
    Company: { title: [{ text: { content: company.slice(0, 200) } }] },
    Status: { select: { name: "Applied" } },
    "Date Applied": { date: { start: todayISO() } },
  };
  if (role) props.Role = { rich_text: [{ text: { content: role.slice(0, 200) } }] };
  if (location) props.Location = { rich_text: [{ text: { content: location.slice(0, 200) } }] };
  if (source) props.Source = { rich_text: [{ text: { content: source.slice(0, 100) } }] };
  if (link && /^https?:\/\//.test(link)) props.Link = { url: link };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({ parent: { database_id: NOTION_DB_ID }, properties: props }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: "notion failed", detail: data }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  return handle(p.get("c"), p.get("r"), p.get("loc"), p.get("u"), p.get("src"), p.get("k"));
}

export async function POST(request) {
  const p = new URL(request.url).searchParams;
  return handle(p.get("c"), p.get("r"), p.get("loc"), p.get("u"), p.get("src"), p.get("k"));
}