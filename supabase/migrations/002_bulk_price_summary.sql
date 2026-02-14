-- Bulk price summary: returns median, latest price, and count for multiple items at once
-- Used by the search/browse page to show price info on ItemCards

create or replace function public.get_bulk_price_summary(
  p_item_ids uuid[],
  p_days_back int default 90
)
returns table (
  canonical_item_id uuid,
  median_price      numeric,
  latest_price      numeric,
  observation_count bigint
)
language sql
stable
security definer
as $$
  select
    pp.canonical_item_id,
    percentile_cont(0.5) within group (order by pp.unit_price)  as median_price,
    (
      select pp2.unit_price
      from public.price_points pp2
      where pp2.canonical_item_id = pp.canonical_item_id
      order by pp2.observed_date desc
      limit 1
    ) as latest_price,
    count(*) as observation_count
  from public.price_points pp
  where pp.canonical_item_id = any(p_item_ids)
    and pp.observed_date >= current_date - p_days_back
  group by pp.canonical_item_id;
$$;

grant execute on function public.get_bulk_price_summary(uuid[], int)
  to anon, authenticated;
