-- Seed data for HargaHantu demo
-- Run after 001_init.sql

-- ============================================================
-- CANONICAL ITEMS (Malaysian grocery staples)
-- ============================================================
insert into public.canonical_items (name, category) values
  -- Eggs
  ('Telur Ayam Gred A (10 biji)', 'eggs'),
  ('Telur Ayam Gred B (10 biji)', 'eggs'),
  ('Telur Ayam Kampung (6 biji)', 'eggs'),
  -- Rice
  ('Beras Super Tempatan 5kg', 'rice'),
  ('Beras Super Tempatan 10kg', 'rice'),
  ('Beras Wangi Jasmine 5kg', 'rice'),
  ('Beras Basmathi 1kg', 'rice'),
  -- Oil
  ('Minyak Masak RBD 1kg', 'oil'),
  ('Minyak Masak RBD 2kg', 'oil'),
  ('Minyak Zaitun Extra Virgin 500ml', 'oil'),
  -- Chicken
  ('Ayam Standard (1kg)', 'chicken'),
  ('Dada Ayam (500g)', 'chicken'),
  ('Ayam Kampung (1 ekor)', 'chicken'),
  ('Kepak Ayam (500g)', 'chicken'),
  -- Milk
  ('Susu Dutch Lady Full Cream 1L', 'milk'),
  ('Susu Segar Farm Fresh 1L', 'milk'),
  ('Susu Tepung Fernleaf 900g', 'milk'),
  -- Instant Noodles
  ('Maggi Kari (5 pek)', 'instant_noodles'),
  ('Maggi Asam Laksa (5 pek)', 'instant_noodles'),
  ('Cintan Sup Ayam (5 pek)', 'instant_noodles'),
  ('Indomie Goreng (5 pek)', 'instant_noodles'),
  -- Bread
  ('Roti Gardenia Original', 'bread'),
  ('Roti Gardenia Butterscotch', 'bread'),
  ('Roti Massimo Wholemeal', 'bread'),
  -- Beverages
  ('Milo Activ-Go 1kg', 'beverages'),
  ('Milo Activ-Go 500g', 'beverages'),
  ('Nescafe Classic 200g', 'beverages'),
  ('Teh Boh (100 beg)', 'beverages'),
  ('Air Mineral Spritzer 1.5L', 'beverages'),
  -- Vegetables
  ('Kangkung (250g)', 'vegetables'),
  ('Sawi (250g)', 'vegetables'),
  ('Bayam Merah (250g)', 'vegetables'),
  ('Bawang Merah (500g)', 'vegetables'),
  ('Bawang Putih (250g)', 'vegetables'),
  ('Kentang (1kg)', 'vegetables'),
  -- Household
  ('Gula Putih 1kg', 'household'),
  ('Garam Halus 500g', 'household'),
  ('Tepung Gandum 1kg', 'household'),
  ('Kicap Lemak Manis 750ml', 'household'),
  ('Sos Cili 500g', 'household'),
  -- Condiments
  ('Santan Kara 200ml', 'condiments'),
  ('Serbuk Kunyit 50g', 'condiments'),
  ('Serbuk Lada Hitam 50g', 'condiments'),
  ('Belacan 250g', 'condiments'),
  -- Snacks
  ('Twisties Cheese (60g)', 'snacks'),
  ('Mamee Monster (8 pek)', 'snacks'),
  ('Julie Crackers 300g', 'snacks')
on conflict (name) do nothing;

-- ============================================================
-- MERCHANTS
-- ============================================================
insert into public.merchants (name, type, area) values
  ('99 Speedmart', 'speedmart', 'Kuala Lumpur'),
  ('99 Speedmart', 'speedmart', 'Petaling Jaya'),
  ('99 Speedmart', 'speedmart', 'Shah Alam'),
  ('Mydin', 'hypermarket', 'Kuala Lumpur'),
  ('Mydin', 'hypermarket', 'Shah Alam'),
  ('Aeon Big', 'hypermarket', 'Kuala Lumpur'),
  ('Aeon Big', 'hypermarket', 'Petaling Jaya'),
  ('Giant', 'hypermarket', 'Kuala Lumpur'),
  ('Giant', 'hypermarket', 'Shah Alam'),
  ('Lotus''s', 'hypermarket', 'Kuala Lumpur'),
  ('Lotus''s', 'hypermarket', 'Petaling Jaya'),
  ('Econsave', 'supermarket', 'Shah Alam'),
  ('Econsave', 'supermarket', 'Kuala Lumpur'),
  ('Jaya Grocer', 'supermarket', 'Kuala Lumpur'),
  ('Jaya Grocer', 'supermarket', 'Petaling Jaya'),
  ('Village Grocer', 'supermarket', 'Kuala Lumpur'),
  ('KK Super Mart', 'convenience', 'Kuala Lumpur'),
  ('KK Super Mart', 'convenience', 'Petaling Jaya'),
  ('NSK Trade City', 'hypermarket', 'Kuala Lumpur'),
  ('Pasar Besar Chow Kit', 'pasar', 'Kuala Lumpur')
on conflict (name, area) do nothing;

-- ============================================================
-- SAMPLE PRICE POINTS (realistic RM prices for demo)
-- ============================================================
-- Generate sample data using a DO block
do $$
declare
  v_item_id uuid;
  v_merchant_id uuid;
  v_items text[] := array[
    'Telur Ayam Gred A (10 biji)',
    'Beras Super Tempatan 5kg',
    'Minyak Masak RBD 1kg',
    'Ayam Standard (1kg)',
    'Susu Dutch Lady Full Cream 1L',
    'Maggi Kari (5 pek)',
    'Roti Gardenia Original',
    'Milo Activ-Go 1kg',
    'Gula Putih 1kg',
    'Kangkung (250g)'
  ];
  v_base_prices numeric[] := array[
    4.80,    -- Telur
    14.50,   -- Beras 5kg
    5.90,    -- Minyak
    9.50,    -- Ayam
    6.20,    -- Susu
    5.30,    -- Maggi
    3.20,    -- Roti
    16.50,   -- Milo
    2.85,    -- Gula
    1.50     -- Kangkung
  ];
  v_item_name text;
  v_base_price numeric;
  v_merchant_rec record;
  v_day_offset int;
  v_price_variation numeric;
  v_idx int;
begin
  for v_idx in 1..array_length(v_items, 1) loop
    v_item_name := v_items[v_idx];
    v_base_price := v_base_prices[v_idx];

    select id into v_item_id from public.canonical_items where name = v_item_name;
    if v_item_id is null then continue; end if;

    for v_merchant_rec in
      select id, area from public.merchants
      where area in ('Kuala Lumpur', 'Petaling Jaya', 'Shah Alam')
      limit 10
    loop
      for v_day_offset in 0..89 loop
        -- ~30% chance of a price point on any given day per merchant
        if random() < 0.3 then
          -- Price varies by +-15% around base
          v_price_variation := v_base_price * (0.85 + random() * 0.30);
          v_price_variation := round(v_price_variation, 2);

          insert into public.price_points (
            canonical_item_id, merchant_id, area, observed_date,
            currency, unit_price, qty, confidence
          ) values (
            v_item_id,
            v_merchant_rec.id,
            v_merchant_rec.area,
            current_date - v_day_offset,
            'MYR',
            v_price_variation,
            1,
            0.7 + random() * 0.3
          );
        end if;
      end loop;
    end loop;
  end loop;
end $$;
