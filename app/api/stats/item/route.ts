import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const area = searchParams.get("area") || null;
  const days = parseInt(searchParams.get("days") || "90", 10);

  if (!itemId) {
    return NextResponse.json(
      { error: "itemId is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_price_stats", {
    p_canonical_item_id: itemId,
    p_area: area,
    p_days_back: days,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const stats = data?.[0] || null;
  if (!stats || stats.observation_count === 0) {
    return NextResponse.json(
      { error: "No price data found" },
      { status: 404 }
    );
  }

  return NextResponse.json(stats);
}
