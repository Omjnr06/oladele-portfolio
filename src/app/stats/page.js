import Link from "next/link";
import { notFound } from "next/navigation";
import { isOwner } from "../grind/lib/auth";
import { rpc, supabaseConfigured } from "@/lib/supabase";

export const metadata = {
  title: "Site stats",
  robots: { index: false, follow: false },
};

const LABELS = {
  pack_selected: "Packs picked",
  variant_selected: "Colours picked",
  palette_used: "Palette picks (result type)",
  boot_skipped: "Boots skipped",
  window_opened: "Windows opened",
};

async function load() {
  if (!supabaseConfigured()) return { error: "Supabase isn't configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };
  try {
    return { rows: await rpc("site_stats") };
  } catch {
    return { error: "Couldn't reach Supabase. Check that supabase/site_events.sql has been run." };
  }
}

export default async function StatsPage() {
  if (!(await isOwner())) notFound();
  const { rows, error } = await load();
  const groups = Object.keys(LABELS)
    .map((type) => ({ type, rows: (rows ?? []).filter((r) => r.event_type === type) }))
    .filter((g) => g.rows.length);
  const total = (rows ?? []).reduce((n, r) => n + Number(r.total), 0);

  return (
    <main className="min-h-screen bg-ink px-6 py-16 font-sans text-fg md:px-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/grind" className="font-mono text-xs text-muted transition-colors hover:text-fg">
          ← /grind
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Site stats</h1>
        <p className="mt-2 text-sm text-muted">{error ?? `${total.toLocaleString()} events all time. Only you can see this page.`}</p>

        {!error && !groups.length && <p className="mt-12 text-sm text-muted">No events yet. They show up here as people pick themes and use search.</p>}

        {groups.map((g) => (
          <section key={g.type} className="mt-12">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{LABELS[g.type]}</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-[11px] text-muted">
                  <th className="py-2 font-normal">Name</th>
                  <th className="py-2 font-normal">Theme at the time</th>
                  <th className="py-2 text-right font-normal">7d</th>
                  <th className="py-2 text-right font-normal">30d</th>
                  <th className="py-2 text-right font-normal">All</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={`${r.event_name}-${r.pack_id}-${r.variant_id}`} className="border-b border-line/60">
                    <td className="py-2 font-medium">{r.event_name}</td>
                    <td className="py-2 text-muted">{[r.pack_id, r.variant_id].filter(Boolean).join(" / ") || "—"}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{r.d7}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{r.d30}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </main>
  );
}
