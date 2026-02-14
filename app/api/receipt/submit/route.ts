import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { SubmitPayloadSchema } from "@/lib/schemas";
import {
  findOrCreateCanonicalItem,
  findOrCreateMerchant,
} from "@/lib/ai/canonicalize";

export async function POST(request: Request) {
  try {
    // Check auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to submit intel." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = SubmitPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      temp_image_path,
      merchant_name,
      merchant_type,
      area,
      receipt_date,
      grand_total,
      items,
    } = parsed.data;

    // Move image from temp to permanent storage
    let permanentPath = "";
    if (temp_image_path) {
      const { data: fileData } = await adminClient().storage
        .from("receipts-temp")
        .download(temp_image_path);

      if (fileData) {
        permanentPath = `${user.id}/${crypto.randomUUID()}.jpg`;
        await adminClient().storage
          .from("receipts")
          .upload(permanentPath, fileData, {
            contentType: "image/jpeg",
            upsert: false,
          });

        // Clean up temp
        await adminClient().storage
          .from("receipts-temp")
          .remove([temp_image_path]);
      }
    }

    // Upsert merchant
    const merchantId = await findOrCreateMerchant(
      merchant_name,
      area,
      merchant_type
    );

    // Insert receipt
    const { data: receipt, error: receiptError } = await adminClient()
      .from("receipts")
      .insert({
        user_id: user.id,
        merchant_id: merchantId,
        receipt_date,
        area,
        currency: "MYR",
        grand_total,
        image_path: permanentPath,
      })
      .select("id")
      .single();

    if (receiptError || !receipt) {
      console.error("Receipt insert error:", receiptError);
      return NextResponse.json(
        { error: "Failed to save receipt" },
        { status: 500 }
      );
    }

    // Process confirmed items
    const confirmedItems = items.filter((i) => i.confirmed !== false);
    let pricePointsCreated = 0;

    for (const item of confirmedItems) {
      // Find or create canonical item
      const canonicalItemId = await findOrCreateCanonicalItem(
        item.canonical_name,
        item.category
      );

      // Insert receipt item
      const { error: riError } = await adminClient()
        .from("receipt_items")
        .insert({
          receipt_id: receipt.id,
          canonical_item_id: canonicalItemId,
          raw: item.raw,
          qty: item.qty,
          unit_price: item.unit_price,
          line_total: item.line_total,
          confidence: item.confidence,
        });

      if (riError) {
        console.error("Receipt item insert error:", riError, item.canonical_name);
        continue;
      }

      // Insert price point (public, anonymized)
      const { error: ppError } = await adminClient()
        .from("price_points")
        .insert({
          canonical_item_id: canonicalItemId,
          merchant_id: merchantId,
          area,
          observed_date: receipt_date || new Date().toISOString().split("T")[0],
          currency: "MYR",
          unit_price: item.unit_price,
          qty: item.qty,
          confidence: item.confidence,
        });

      if (ppError) {
        console.error("Price point insert error:", ppError, item.canonical_name);
        continue;
      }

      pricePointsCreated++;
    }

    return NextResponse.json({
      receipt_id: receipt.id,
      items_saved: confirmedItems.length,
      price_points_created: pricePointsCreated,
    });
  } catch (err) {
    console.error("Submit route error:", err);
    const message =
      err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
