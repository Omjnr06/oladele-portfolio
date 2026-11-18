const url = () => process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = () => Boolean(url() && key());

export async function rpc(fn, args = {}, init = {}) {
  const k = key();
  const headers = { apikey: k, "Content-Type": "application/json" };
  if (k.startsWith("eyJ")) headers.Authorization = `Bearer ${k}`;
  const res = await fetch(`${url()}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers,
    body: JSON.stringify(args),
    cache: "no-store",
    ...init,
  });
  if (!res.ok) throw new Error(`supabase ${fn} ${res.status}`);
  return res.json();
}
