import { adminClient } from "@/lib/supabase/admin";

export async function findOrCreateCanonicalItem(
  rawName: string,
  category: string = "other"
): Promise<string> {
  const normalizedName = rawName
    .trim()
    .replace(/\s+/g, " ")
    .substring(0, 200);

  // Try trigram search for existing match
  const { data: matches } = await adminClient().rpc("search_items", {
    p_query: normalizedName,
    p_limit: 1,
    p_offset: 0,
  });

  if (matches && matches.length > 0 && matches[0].similarity > 0.4) {
    return matches[0].id;
  }

  // No close match — upsert new canonical item
  const { data: newItem } = await adminClient()
    .from("canonical_items")
    .upsert(
      { name: normalizedName, category },
      { onConflict: "name", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (!newItem) {
    throw new Error(`Failed to create canonical item: ${normalizedName}`);
  }

  return newItem.id;
}

export async function findOrCreateMerchant(
  name: string,
  area: string,
  type: string = "unknown"
): Promise<string> {
  const { data: merchant } = await adminClient()
    .from("merchants")
    .upsert(
      { name: name.trim(), area, type },
      { onConflict: "name,area", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (!merchant) {
    throw new Error(`Failed to create merchant: ${name}`);
  }

  return merchant.id;
}
