-- Community basket templates: users can create and share basket templates

create table public.basket_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  description text not null default '',
  items       jsonb not null default '[]'::jsonb,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Index for common queries
create index idx_basket_templates_default on public.basket_templates (is_default desc, created_at desc);

-- RLS
alter table public.basket_templates enable row level security;

-- Everyone can read all templates
create policy "basket_templates_select"
  on public.basket_templates for select
  to anon, authenticated
  using (true);

-- Authenticated users can create templates
create policy "basket_templates_insert"
  on public.basket_templates for insert
  to authenticated
  with check (auth.uid() = user_id and is_default = false);

-- Users can delete only their own non-default templates
create policy "basket_templates_delete"
  on public.basket_templates for delete
  to authenticated
  using (auth.uid() = user_id and is_default = false);

-- Seed the 3 default templates (no user_id since they're system templates)
insert into public.basket_templates (name, description, items, is_default) values
(
  'Student Survival Kit',
  'Basic essentials for a week',
  '[
    {"canonical_name": "Beras Super Tempatan 5kg", "qty": 1},
    {"canonical_name": "Telur Ayam Gred A (10 biji)", "qty": 1},
    {"canonical_name": "Maggi Kari (5 pek)", "qty": 1},
    {"canonical_name": "Roti Gardenia Original", "qty": 1},
    {"canonical_name": "Milo Activ-Go 500g", "qty": 1}
  ]'::jsonb,
  true
),
(
  'Family Weekly Staples',
  'Feed a family of 4 for a week',
  '[
    {"canonical_name": "Beras Super Tempatan 5kg", "qty": 1},
    {"canonical_name": "Ayam Standard (1kg)", "qty": 2},
    {"canonical_name": "Telur Ayam Gred A (10 biji)", "qty": 2},
    {"canonical_name": "Minyak Masak RBD 1kg", "qty": 1},
    {"canonical_name": "Susu Dutch Lady Full Cream 1L", "qty": 2},
    {"canonical_name": "Kangkung (250g)", "qty": 3},
    {"canonical_name": "Gula Putih 1kg", "qty": 1},
    {"canonical_name": "Roti Gardenia Original", "qty": 2}
  ]'::jsonb,
  true
),
(
  'Mamak Survival Kit',
  'Cook like your favourite mamak',
  '[
    {"canonical_name": "Telur Ayam Gred A (10 biji)", "qty": 2},
    {"canonical_name": "Maggi Kari (5 pek)", "qty": 2},
    {"canonical_name": "Minyak Masak RBD 1kg", "qty": 1},
    {"canonical_name": "Bawang Merah (500g)", "qty": 1},
    {"canonical_name": "Bawang Putih (250g)", "qty": 1},
    {"canonical_name": "Teh Boh (100 beg)", "qty": 1}
  ]'::jsonb,
  true
);
