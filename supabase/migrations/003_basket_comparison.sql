-- Basket comparison: for each merchant that has price data for ANY of the given items,
-- return the merchant info and the total basket cost using median prices.
-- Uses fuzzy ILIKE matching so partial item names still resolve.

create or replace function public.get_basket_comparison(
  p_item_names text[],
  p_area       text default null,
  p_days_back  int  default 90
)
returns table (
  merchant_id    uuid,
  merchant_name  text,
  merchant_type  text,
  area           text,
  items_found    int,
  items_total    int,
  basket_total   numeric,
  item_prices    jsonb
)
language sql
stable
security definer
as $$
  with input_items as (
    -- Unnest the input array into rows
    select unnest(p_item_names) as input_name
  ),
  matched_items as (
    -- For each input name, find the best matching canonical item
    -- using exact match first, then ILIKE substring match (shortest name wins)
    select distinct on (ii.input_name)
      ii.input_name,
      ci.id as canonical_item_id,
      ci.name as item_name
    from input_items ii
    join public.canonical_items ci
      on ci.name = ii.input_name                         -- exact match
      or ci.name ilike '%' || ii.input_name || '%'       -- input is substring of canonical
      or ii.input_name ilike '%' || ci.name || '%'       -- canonical is substring of input
    order by
      ii.input_name,
      -- Prefer exact match, then shortest name (most specific)
      case when ci.name = ii.input_name then 0 else 1 end,
      length(ci.name) asc
  ),
  merchant_item_prices as (
    select
      pp.merchant_id,
      mi.canonical_item_id,
      mi.item_name,
      percentile_cont(0.5) within group (order by pp.unit_price) as median_price
    from public.price_points pp
    join matched_items mi on mi.canonical_item_id = pp.canonical_item_id
    where pp.observed_date >= current_date - p_days_back
      and (p_area is null or pp.area = p_area)
    group by pp.merchant_id, mi.canonical_item_id, mi.item_name
  )
  select
    m.id                          as merchant_id,
    m.name                        as merchant_name,
    m.type                        as merchant_type,
    m.area                        as area,
    count(distinct mip.canonical_item_id)::int as items_found,
    array_length(p_item_names, 1) as items_total,
    sum(mip.median_price)         as basket_total,
    jsonb_agg(
      jsonb_build_object(
        'name', mip.item_name,
        'price', round(mip.median_price::numeric, 2)
      )
    ) as item_prices
  from merchant_item_prices mip
  join public.merchants m on m.id = mip.merchant_id
  group by m.id, m.name, m.type, m.area
  order by count(distinct mip.canonical_item_id) desc, sum(mip.median_price) asc;
$$;

grant execute on function public.get_basket_comparison(text[], text, int)
  to anon, authenticated;
