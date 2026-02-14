import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { extractReceipt } from "@/lib/ai/extract";
import { ExtractionResultSchema } from "@/lib/schemas";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("file") as File | null;
    const area = (formData.get("area") as string) || "Kuala Lumpur";

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large. Max 5MB." },
        { status: 400 }
      );
    }

    const imageBuffer = await imageFile.arrayBuffer();

    // Temp-store image in Supabase Storage
    const tempId = crypto.randomUUID();
    const tempPath = `temp/${tempId}.jpg`;

    const { error: uploadError } = await adminClient.storage
      .from("receipts-temp")
      .upload(tempPath, imageBuffer, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Temp upload failed:", uploadError);
      // Non-fatal — continue with extraction even if temp storage fails
    }

    // Run AI extraction
    const rawExtraction = await extractReceipt(imageBuffer, area);

    // Validate with Zod
    const parseResult = ExtractionResultSchema.safeParse(rawExtraction);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "AI extraction returned invalid data. Please try again.",
          details: parseResult.error.issues,
          raw: rawExtraction,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      temp_image_path: tempPath,
      ...parseResult.data,
    });
  } catch (err) {
    console.error("Extract route error:", err);
    const message =
      err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
