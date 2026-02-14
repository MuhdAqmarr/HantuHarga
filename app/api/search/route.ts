import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("search_items", {
    p_query: q.trim(),
    p_limit: Math.min(limit, 50),
    p_offset: Math.max(offset, 0),
  });

  if (error) {
    // Fallback to simple ILIKE if trigram extension not available
    const { data: fallback } = await supabase
      .from("canonical_items")
      .select("id, name, category")
      .ilike("name", `%${q.trim()}%`)
      .limit(limit);

    return NextResponse.json({
      items: (fallback || []).map((i: { id: string; name: string; category: string }) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        similarity: 0,
      })),
      total: fallback?.length || 0,
    });
  }

  return NextResponse.json({
    items: data || [],
    total: data?.length || 0,
  });
}
