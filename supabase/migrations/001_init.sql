-- HargaHantu Database Schema
-- Run this in Supabase SQL Editor or via `supabase db push`

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- MERCHANTS
-- ============================================================
create table public.merchants (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  type       text not null default 'unknown',
  area       text not null,
  created_at timestamptz not null default now(),
  constraint merchants_name_area_unique unique (name, area)
);

create index merchants_name_trgm_idx on public.merchants using gin (name gin_trgm_ops);
create index merchants_area_idx on public.merchants (area);

alter table public.merchants enable row level security;

create policy "merchants_public_read" on public.merchants
  for select to anon, authenticated using (true);

-- No client write policies — service_role bypasses RLS for inserts

-- ============================================================
-- CANONICAL ITEMS
-- ============================================================
create table public.canonical_items (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  category   text not null default 'other',
  created_at timestamptz not null default now(),
  constraint canonical_items_name_unique unique (name)
);

create index canonical_items_name_trgm_idx on public.canonical_items using gin (name gin_trgm_ops);
create index canonical_items_category_idx on public.canonical_items (category);

alter table public.canonical_items enable row level security;

create policy "canonical_items_public_read" on public.canonical_items
  for select to anon, authenticated using (true);

-- ============================================================
-- RECEIPTS (PRIVATE)
-- ============================================================
create table public.receipts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  merchant_id  uuid not null references public.merchants(id),
  receipt_date date,
  area         text not null,
  currency     text not null default 'MYR',
  grand_total  numeric,
  image_path   text not null,
  created_at   timestamptz not null default now()
);

create index receipts_user_id_idx on public.receipts (user_id);
create index receipts_created_at_idx on public.receipts (created_at desc);

alter table public.receipts enable row level security;

create policy "receipts_select_owner" on public.receipts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "receipts_insert_owner" on public.receipts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "receipts_update_owner" on public.receipts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "receipts_delete_owner" on public.receipts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- RECEIPT ITEMS (PRIVATE)
-- ============================================================
create table public.receipt_items (
  id                uuid primary key default uuid_generate_v4(),
  receipt_id        uuid not null references public.receipts(id) on delete cascade,
  canonical_item_id uuid not null references public.canonical_items(id),
  raw               text not null,
  qty               numeric not null default 1,
  unit_price        numeric not null,
  line_total        numeric,
  confidence        real not null default 0.5,
  created_at        timestamptz not null default now()
);

create index receipt_items_receipt_id_idx on public.receipt_items (receipt_id);
create index receipt_items_canonical_item_id_idx on public.receipt_items (canonical_item_id);

alter table public.receipt_items enable row level security;

create policy "receipt_items_select_owner" on public.receipt_items
  for select to authenticated
  using (
    exists (
      select 1 from public.receipts r
      where r.id = receipt_items.receipt_id
        and r.user_id = (select auth.uid())
    )
  );

create policy "receipt_items_insert_owner" on public.receipt_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.receipts r
      where r.id = receipt_items.receipt_id
        and r.user_id = (select auth.uid())
    )
  );

create policy "receipt_items_delete_owner" on public.receipt_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.receipts r
      where r.id = receipt_items.receipt_id
        and r.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- PRICE POINTS (PUBLIC read, server-only write)
-- ============================================================
create table public.price_points (
  id                uuid primary key default uuid_generate_v4(),
  canonical_item_id uuid not null references public.canonical_items(id),
  merchant_id       uuid not null references public.merchants(id),
  area              text not null,
  observed_date     date not null,
  currency          text not null default 'MYR',
  unit_price        numeric not null,
  qty               numeric not null default 1,
  confidence        real not null default 0.5,
  created_at        timestamptz not null default now()
);

create index price_points_item_area_date_idx on public.price_points (canonical_item_id, area, observed_date desc);
create index price_points_merchant_area_idx on public.price_points (merchant_id, area);
create index price_points_observed_date_idx on public.price_points (observed_date desc);

alter table public.price_points enable row level security;

create policy "price_points_public_read" on public.price_points
  for select to anon, authenticated using (true);

-- No INSERT/UPDATE/DELETE policies — writes only via service_role

-- ============================================================
-- STORAGE: receipts bucket (private) + receipts-temp bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('receipts-temp', 'receipts-temp', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Storage RLS: owner can read their own receipts
create policy "receipts_storage_owner_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================
-- RPC: Price Stats
-- ============================================================
create or replace function public.get_price_stats(
  p_canonical_item_id uuid,
  p_area              text default null,
  p_days_back         int  default 90
)
returns table (
  min_price         numeric,
  max_price         numeric,
  median_price      numeric,
  p25_price         numeric,
  p75_price         numeric,
  avg_price         numeric,
  observation_count bigint,
  latest_price      numeric,
  latest_date       date
)
language sql
stable
security definer
as $$
  select
    min(pp.unit_price),
    max(pp.unit_price),
    percentile_cont(0.5)  within group (order by pp.unit_price),
    percentile_cont(0.25) within group (order by pp.unit_price),
    percentile_cont(0.75) within group (order by pp.unit_price),
    avg(pp.unit_price),
    count(*),
    (select pp2.unit_price from public.price_points pp2
     where pp2.canonical_item_id = p_canonical_item_id
       and (p_area is null or pp2.area = p_area)
     order by pp2.observed_date desc limit 1),
    (select pp2.observed_date from public.price_points pp2
     where pp2.canonical_item_id = p_canonical_item_id
       and (p_area is null or pp2.area = p_area)
     order by pp2.observed_date desc limit 1)
  from public.price_points pp
  where pp.canonical_item_id = p_canonical_item_id
    and (p_area is null or pp.area = p_area)
    and pp.observed_date >= current_date - p_days_back;
$$;

grant execute on function public.get_price_stats(uuid, text, int)
  to anon, authenticated;

-- ============================================================
-- RPC: Search Items (trigram)
-- ============================================================
create or replace function public.search_items(
  p_query  text,
  p_limit  int  default 20,
  p_offset int  default 0
)
returns table (
  id         uuid,
  name       text,
  category   text,
  similarity float4
)
language sql
stable
security definer
as $$
  select
    ci.id,
    ci.name,
    ci.category,
    similarity(ci.name, p_query) as sim
  from public.canonical_items ci
  where ci.name % p_query
     or ci.name ilike '%' || p_query || '%'
  order by similarity(ci.name, p_query) desc, ci.name
  limit p_limit
  offset p_offset;
$$;

grant execute on function public.search_items(text, int, int)
  to anon, authenticated;

-- ============================================================
-- RPC: Cheapest Merchants for Item
-- ============================================================
create or replace function public.get_cheapest_merchants(
  p_canonical_item_id uuid,
  p_area              text default null,
  p_days_back         int  default 90,
  p_limit             int  default 10
)
returns table (
  merchant_id   uuid,
  merchant_name text,
  merchant_type text,
  area          text,
  min_price     numeric,
  avg_price     numeric,
  sample_count  bigint
)
language sql
stable
security definer
as $$
  select
    m.id,
    m.name,
    m.type,
    m.area,
    min(pp.unit_price),
    avg(pp.unit_price),
    count(*)
  from public.price_points pp
  join public.merchants m on m.id = pp.merchant_id
  where pp.canonical_item_id = p_canonical_item_id
    and (p_area is null or pp.area = p_area)
    and pp.observed_date >= current_date - p_days_back
  group by m.id, m.name, m.type, m.area
  order by min(pp.unit_price) asc
  limit p_limit;
$$;

grant execute on function public.get_cheapest_merchants(uuid, text, int, int)
  to anon, authenticated;
