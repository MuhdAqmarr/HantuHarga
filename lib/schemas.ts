import { z } from "zod/v4";

export const ExtractionItemSchema = z.object({
  raw: z.string().min(1),
  canonical_name: z.string().min(1),
  category: z.enum([
    "eggs",
    "rice",
    "oil",
    "chicken",
    "milk",
    "instant_noodles",
    "bread",
    "beverages",
    "snacks",
    "household",
    "vegetables",
    "fruits",
    "seafood",
    "condiments",
    "other",
  ]),
  qty: z.number().positive().default(1),
  unit_price: z.number().positive(),
  line_total: z.number().nullable().default(null),
  confidence: z.number().min(0).max(1),
});

export const ExtractionResultSchema = z.object({
  merchant: z.object({
    name: z.string().min(1),
    branch_hint: z.string().nullable().default(null),
    type: z
      .enum([
        "speedmart",
        "hypermarket",
        "kedai",
        "pasar",
        "supermarket",
        "convenience",
        "unknown",
      ])
      .default("unknown"),
  }),
  receipt_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  currency: z.literal("MYR").default("MYR"),
  items: z.array(ExtractionItemSchema).min(1),
  totals: z.object({
    grand_total: z.number().nullable().default(null),
  }),
  notes: z.array(z.string()).default([]),
});

export const SubmitPayloadSchema = z.object({
  temp_image_path: z.string().default(""),
  merchant_name: z.string().min(1).max(200),
  merchant_type: z
    .enum([
      "speedmart",
      "hypermarket",
      "kedai",
      "pasar",
      "supermarket",
      "convenience",
      "unknown",
    ])
    .default("unknown"),
  area: z.string().min(1).max(100),
  receipt_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  grand_total: z.number().nullable(),
  items: z.array(
    z.object({
      raw: z.string().min(1),
      canonical_name: z.string().min(1),
      category: z.string().min(1),
      qty: z.number().positive(),
      unit_price: z.number().positive(),
      line_total: z.number().nullable(),
      confidence: z.number().min(0).max(1),
      confirmed: z.boolean().default(true),
    })
  ),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  area: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ExtractionResultType = z.infer<typeof ExtractionResultSchema>;
export type SubmitPayloadType = z.infer<typeof SubmitPayloadSchema>;
