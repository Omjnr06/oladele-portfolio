import { NextResponse } from "next/server";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;
const DASHBOARD_SECRET = process.env.DASHBOARD_SECRET;

function rich(prop) {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title || []).map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return (prop.rich_text || []).map((t) => t.plain_text).join("");
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "date") return prop.date?.start || "";
  return "";
}

export async function GET(request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!DASHBOARD_SECRET || key !== DASHBOARD_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ page_size: 100, sorts: [{ timestamp: "created_time", direction: "descending" }] }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: "notion failed", detail: data }, { status: 502 });
    }
    const rows = (data.results || []).map((p) => {
      const props = p.properties || {};
      return {
        company: rich(props.Company),
        role: rich(props.Role),
        location: rich(props.Location),
        link: rich(props.Link),
        source: rich(props.Source),
        status: rich(props.Status),
        dateApplied: rich(props["Date Applied"]),
      };
    });
    return NextResponse.json({ ok: true, count: rows.length, rows });
  } catch (e) {
    return NextResponse.json({ error: "request failed", detail: String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  const p = new URL(request.url).searchParams;
  const key = p.get("key");
  if (!DASHBOARD_SECRET || key !== DASHBOARD_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }
  const company = p.get("c");
  if (!company) {
    return NextResponse.json({ error: "missing company" }, { status: 400 });
  }
  const props = {
    Company: { title: [{ text: { content: company.slice(0, 200) } }] },
    Status: { select: { name: "Applied" } },
    "Date Applied": { date: { start: new Date().toISOString().slice(0, 10) } },
  };
  const role = p.get("r"), loc = p.get("loc"), link = p.get("u"), src = p.get("src");
  if (role) props.Role = { rich_text: [{ text: { content: role.slice(0, 200) } }] };
  if (loc) props.Location = { rich_text: [{ text: { content: loc.slice(0, 200) } }] };
  if (src) props.Source = { rich_text: [{ text: { content: src.slice(0, 100) } }] };
  if (link && /^https?:\/\//.test(link)) props.Link = { url: link };

  try {
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ parent: { database_id: NOTION_DB_ID }, properties: props }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: "notion failed", detail: data }, { status: 502 });
    }
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ error: "request failed", detail: String(e) }, { status: 500 });
  }
}