create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (char_length(type) <= 32),
  name text not null check (char_length(name) <= 48),
  pack text check (char_length(pack) <= 16),
  variant text check (char_length(variant) <= 24),
  path text check (char_length(path) <= 64)
);

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);

create table if not exists public.event_limits (
  key_hash text not null,
  bucket timestamptz not null,
  count int not null default 0,
  primary key (key_hash, bucket)
);

alter table public.site_events enable row level security;
alter table public.event_limits enable row level security;
revoke all on public.site_events, public.event_limits from anon, authenticated;

create or replace function public.log_event(
  p_key text,
  p_type text,
  p_name text,
  p_pack text,
  p_variant text,
  p_path text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  per_minute int;
  per_day int;
begin
  insert into event_limits (key_hash, bucket, count)
  values (p_key, date_trunc('minute', now()), 1)
  on conflict (key_hash, bucket) do update set count = event_limits.count + 1
  returning count into per_minute;
  if per_minute > 30 then
    return 'limited';
  end if;

  insert into event_limits (key_hash, bucket, count)
  values ('*day*', date_trunc('day', now()), 1)
  on conflict (key_hash, bucket) do update set count = event_limits.count + 1
  returning count into per_day;
  if per_day > 20000 then
    return 'capped';
  end if;

  insert into site_events (type, name, pack, variant, path)
  values (p_type, p_name, p_pack, p_variant, p_path);

  if random() < 0.02 then
    delete from event_limits
    where (key_hash <> '*day*' and bucket < now() - interval '1 hour')
       or bucket < now() - interval '2 days';
  end if;

  return 'ok';
end;
$$;

create or replace function public.site_stats()
returns table (event_type text, event_name text, pack_id text, variant_id text, d7 bigint, d30 bigint, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.type,
    e.name,
    e.pack,
    e.variant,
    count(*) filter (where e.created_at > now() - interval '7 days'),
    count(*) filter (where e.created_at > now() - interval '30 days'),
    count(*)
  from site_events e
  group by 1, 2, 3, 4
  order by 7 desc;
$$;

revoke all on function public.log_event(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.site_stats() from public, anon, authenticated;
grant execute on function public.log_event(text, text, text, text, text, text) to service_role;
grant execute on function public.site_stats() to service_role;
