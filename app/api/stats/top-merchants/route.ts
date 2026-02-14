import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const area = searchParams.get("area") || null;
  const days = parseInt(searchParams.get("days") || "90", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  if (!itemId) {
    return NextResponse.json(
      { error: "itemId is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_cheapest_merchants", {
    p_canonical_item_id: itemId,
    p_area: area,
    p_days_back: days,
    p_limit: Math.min(limit, 20),
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ merchants: data || [] });
}
