import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemsParam = searchParams.get("items");
  const area = searchParams.get("area") || undefined;

  if (!itemsParam) {
    return NextResponse.json(
      { error: "Missing items parameter" },
      { status: 400 }
    );
  }

  const itemNames = itemsParam.split(",").map((s) => s.trim());

  if (itemNames.length === 0) {
    return NextResponse.json(
      { error: "No items provided" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc(
    "get_basket_comparison",
    {
      p_item_names: itemNames,
      p_area: area || null,
      p_days_back: 90,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const merchants = data || [];

  // Determine which items have price data across ALL merchants
  const foundItemNames = new Set<string>();
  for (const merchant of merchants) {
    if (merchant.item_prices && Array.isArray(merchant.item_prices)) {
      for (const ip of merchant.item_prices) {
        foundItemNames.add(ip.name);
      }
    }
  }

  // Find unmatched items — items from the request that no merchant has data for
  // Use case-insensitive substring matching to detect which inputs were matched
  const unmatchedItems = itemNames.filter((inputName) => {
    const lower = inputName.toLowerCase();
    for (const found of foundItemNames) {
      const foundLower = found.toLowerCase();
      if (
        foundLower === lower ||
        foundLower.includes(lower) ||
        lower.includes(foundLower)
      ) {
        return false; // matched
      }
    }
    return true; // no match found
  });

  return NextResponse.json({
    merchants,
    unmatched_items: unmatchedItems,
  });
}
