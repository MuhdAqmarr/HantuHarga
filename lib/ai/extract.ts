import type { ExtractionResult } from "@/types";

const EXTRACTION_PROMPT = `You are a Malaysian receipt parser. Extract structured data from this receipt image.

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "merchant": { "name": "Store Name", "branch_hint": "Branch or null", "address": "Full address from receipt header or null", "type": "speedmart|hypermarket|kedai|pasar|supermarket|convenience|unknown" },
  "receipt_date": "YYYY-MM-DD or null",
  "currency": "MYR",
  "items": [
    {
      "raw": "exact text from receipt",
      "canonical_name": "clean item name in title case",
      "category": "eggs|rice|oil|chicken|milk|instant_noodles|bread|beverages|snacks|household|vegetables|fruits|seafood|condiments|other",
      "qty": 1,
      "unit_price": 5.90,
      "line_total": 5.90,
      "confidence": 0.85
    }
  ],
  "totals": { "grand_total": 45.50 },
  "notes": ["any parsing notes"]
}

Rules:
- Parse Malaysian receipts with rojak abbreviations (e.g. "AYM" = ayam, "TLR" = telur)
- unit_price must be per-unit price in RM, not total
- If qty is missing, default to 1
- confidence: 0.0 to 1.0
- Do NOT include payment info (card numbers etc.)
- Extract the merchant address from the receipt header if present, otherwise set to null
- Keep output concise`;

export async function extractReceipt(
  imageBuffer: ArrayBuffer,
  area: string
): Promise<ExtractionResult> {
  const provider = process.env.RECEIPT_AI_PROVIDER || "openai";

  if (provider === "anthropic") {
    return extractWithAnthropic(imageBuffer, area);
  }
  return extractWithOpenAI(imageBuffer, area);
}

async function extractWithOpenAI(
  imageBuffer: ArrayBuffer,
  area: string
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not configured. Set it in your environment variables."
    );
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const base64 = Buffer.from(imageBuffer).toString("base64");
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${EXTRACTION_PROMPT}\n\nArea context: ${area}`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as ExtractionResult;
}

async function extractWithAnthropic(
  imageBuffer: ArrayBuffer,
  area: string
): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: Buffer.from(imageBuffer).toString("base64"),
              },
            },
            {
              type: "text",
              text: `${EXTRACTION_PROMPT}\n\nArea context: ${area}`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text =
    data.content?.[0]?.type === "text" ? data.content[0].text : "{}";
  // Strip markdown fences if present
  const clean = text
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "");
  return JSON.parse(clean) as ExtractionResult;
}
