import { NextResponse } from "next/server";
import { isOwner } from "../../grind/lib/auth";
import { STATUSES } from "../../grind/lib/status";

export const dynamic = "force-dynamic";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;

const notion = (path, body, method = "POST") =>
  fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

function rich(prop) {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title || []).map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return (prop.rich_text || []).map((t) => t.plain_text).join("");
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "status") return prop.status?.name || "";
  if (prop.type === "date") return prop.date?.start || "";
  return "";
}

async function guard() {
  if (!(await isOwner())) return NextResponse.json({ error: "This view is private." }, { status: 401 });
  if (!NOTION_TOKEN || !NOTION_DB_ID) return NextResponse.json({ error: "Notion isn't configured on the server (NOTION_TOKEN / NOTION_DB_ID)." }, { status: 500 });
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    const rows = [];
    let cursor;
    do {
      const res = await notion(`databases/${NOTION_DB_ID}/query`, {
        page_size: 100,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
        ...(cursor ? { start_cursor: cursor } : {}),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: "Notion rejected the query.", detail: data.message }, { status: 502 });
      for (const p of data.results || []) {
        const props = p.properties || {};
        rows.push({
          id: p.id,
          company: rich(props.Company),
          role: rich(props.Role),
          location: rich(props.Location),
          link: rich(props.Link),
          source: rich(props.Source),
          status: rich(props.Status),
          dateApplied: rich(props["Date Applied"]),
          created: p.created_time,
        });
      }
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor && rows.length < 2000);
    return NextResponse.json({ ok: true, count: rows.length, rows });
  } catch (e) {
    return NextResponse.json({ error: "Couldn't reach Notion.", detail: String(e) }, { status: 502 });
  }
}

export async function POST(request) {
  const denied = await guard();
  if (denied) return denied;
  const b = await request.json().catch(() => ({}));
  if (!b.company) return NextResponse.json({ error: "A company is required." }, { status: 400 });
  const props = {
    Company: { title: [{ text: { content: String(b.company).slice(0, 200) } }] },
    Status: { select: { name: "Applied" } },
    "Date Applied": { date: { start: new Date().toISOString().slice(0, 10) } },
  };
  if (b.role) props.Role = { rich_text: [{ text: { content: String(b.role).slice(0, 200) } }] };
  if (b.location) props.Location = { rich_text: [{ text: { content: String(b.location).slice(0, 200) } }] };
  if (b.source) props.Source = { rich_text: [{ text: { content: String(b.source).slice(0, 100) } }] };
  if (b.link && /^https?:\/\//.test(b.link)) props.Link = { url: b.link };
  try {
    const res = await notion("pages", { parent: { database_id: NOTION_DB_ID }, properties: props });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Notion didn't save it.", detail: data.message }, { status: 502 });
    return NextResponse.json({ ok: true, id: data.id, dateApplied: props["Date Applied"].date.start });
  } catch (e) {
    return NextResponse.json({ error: "Couldn't reach Notion.", detail: String(e) }, { status: 502 });
  }
}

export async function DELETE(request) {
  const denied = await guard();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{32,36}$/i.test(id)) return NextResponse.json({ error: "A valid page id is required." }, { status: 400 });
  try {
    const res = await notion(`pages/${id}`, { archived: true }, "PATCH");
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Notion didn't undo it.", detail: data.message }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Couldn't reach Notion.", detail: String(e) }, { status: 502 });
  }
}

export async function PATCH(request) {
  const denied = await guard();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  const { status } = await request.json().catch(() => ({}));
  if (!id || !/^[0-9a-f-]{32,36}$/i.test(id)) return NextResponse.json({ error: "A valid page id is required." }, { status: 400 });
  if (!STATUSES.includes(status)) return NextResponse.json({ error: `Status must be one of: ${STATUSES.join(", ")}.` }, { status: 400 });
  try {
    const res = await notion(`pages/${id}`, { properties: { Status: { select: { name: status } } } }, "PATCH");
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Notion didn't update the status.", detail: data.message }, { status: 502 });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    return NextResponse.json({ error: "Couldn't reach Notion.", detail: String(e) }, { status: 502 });
  }
}
