import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchBar } from "@/components/features/SearchBar";
import { CategoryFilter } from "@/components/features/CategoryFilter";
import { ItemCard } from "@/components/features/ItemCard";
import { ItemCardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 10;

export const metadata: Metadata = {
  title: "Search Prices",
  description:
    "Search real grocery prices across Malaysia. Community-verified price data.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, page } = await searchParams;

  return (
    <>
      <TopBar title="PRICE SEARCH" />
      <PageContainer>
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense>
          <CategoryFilter />
        </Suspense>
        <Suspense
          key={`${q || "__browse"}_${category || "__all"}_${page || "1"}`}
          fallback={
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <SearchResults query={q} category={category} page={page} />
        </Suspense>
      </PageContainer>
    </>
  );
}

function buildSearchHref(
  params: { q?: string; category?: string },
  page: number
): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}

async function SearchResults({
  query,
  category,
  page,
}: {
  query?: string;
  category?: string;
  page?: string;
}) {
  const supabase = await createClient();
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  let items: {
    id: string;
    name: string;
    category: string;
    similarity: number;
  }[] = [];
  let totalCount = 0;

  if (query && query.trim().length > 0) {
    // Search via trigram RPC — fetch more results then paginate client-side
    // (since the RPC doesn't return a count)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("search_items", {
      p_query: query.trim(),
      p_limit: 200,
      p_offset: 0,
    });

    type ItemRow = { id: string; name: string; category: string; similarity: number };

    let allItems: ItemRow[] = (data as ItemRow[] | null) || [];

    // Fallback to ILIKE if trigram not available
    if (error || allItems.length === 0) {
      const { data: fallback } = await supabase
        .from("canonical_items")
        .select("id, name, category")
        .ilike("name", `%${query.trim()}%`)
        .limit(200);
      allItems = (fallback || []).map((i) => ({ ...i, similarity: 0 }));
    }

    // Apply category filter
    if (category) {
      allItems = allItems.filter((i) => i.category === category);
    }

    totalCount = allItems.length;
    items = allItems.slice(offset, offset + PAGE_SIZE);

    if (totalCount === 0) {
      return (
        <div className="py-12 text-center">
          <div className="font-mono text-sm text-text-muted">
            [ NO RESULTS{category ? ` IN ${category.toUpperCase()}` : ""} FOR
            &quot;{query}&quot; ]
          </div>
          <p className="text-text-secondary text-sm mt-2">
            Try a different search term or category.
          </p>
        </div>
      );
    }
  } else {
    // No query — browse with server-side pagination
    let countQuery = supabase
      .from("canonical_items")
      .select("*", { count: "exact", head: true });

    if (category) {
      countQuery = countQuery.eq("category", category);
    }

    const { count } = await countQuery;
    totalCount = count || 0;

    let browseQuery = supabase
      .from("canonical_items")
      .select("id, name, category")
      .order("name")
      .range(offset, offset + PAGE_SIZE - 1);

    if (category) {
      browseQuery = browseQuery.eq("category", category);
    }

    const { data } = await browseQuery;
    items = (data || []).map((i) => ({ ...i, similarity: 0 }));

    if (totalCount === 0) {
      return (
        <div className="py-12 text-center">
          <div className="font-mono text-sm text-text-muted">
            {category
              ? `[ NO ITEMS IN ${category.toUpperCase().replace(/_/g, " ")} ]`
              : "[ NO ITEMS IN DATABASE ]"}
          </div>
          <p className="text-text-secondary text-sm mt-2">
            {category
              ? "Try a different category or scan a receipt to add items."
              : "Be the first to scan a receipt and contribute!"}
          </p>
        </div>
      );
    }
  }

  // Fetch price summaries for all items in a single query
  const itemIds = items.map((i) => i.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: priceSummaries } = await (supabase as any).rpc(
    "get_bulk_price_summary",
    { p_item_ids: itemIds, p_days_back: 90 }
  );

  const priceMap = new Map<
    string,
    { median_price: number; latest_price: number; observation_count: number }
  >();
  if (priceSummaries) {
    for (const ps of priceSummaries) {
      priceMap.set(ps.canonical_item_id, ps);
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const label = query
    ? `Results for "${query}"${category ? ` in ${category.replace(/_/g, " ")}` : ""} (${totalCount})`
    : `${category ? category.replace(/_/g, " ") : "Browse Items"} (${totalCount})`;

  return (
    <div className="space-y-2 pt-2">
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider px-1">
        {label}
      </div>
      {items.map((item) => {
        const ps = priceMap.get(item.id);
        return (
          <ItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            category={item.category}
            medianPrice={ps?.median_price}
            latestPrice={ps?.latest_price}
            observationCount={ps?.observation_count}
          />
        );
      })}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(p) => buildSearchHref({ q: query, category }, p)}
      />
    </div>
  );
}
