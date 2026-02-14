export const AREAS = [
  "Kuala Lumpur",
  "Petaling Jaya",
  "Shah Alam",
  "Subang Jaya",
  "Cheras",
  "Ampang",
  "Johor Bahru",
  "Penang",
  "Melaka",
  "Ipoh",
  "Kuching",
  "Kota Kinabalu",
] as const;

export type Area = (typeof AREAS)[number] | string;

export const ITEM_CATEGORIES = [
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
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const MERCHANT_TYPES = [
  "speedmart",
  "hypermarket",
  "kedai",
  "pasar",
  "supermarket",
  "convenience",
  "unknown",
] as const;

export type MerchantType = (typeof MERCHANT_TYPES)[number];

export interface PriceStats {
  min_price: number;
  max_price: number;
  median_price: number;
  p25_price: number;
  p75_price: number;
  avg_price: number;
  observation_count: number;
  latest_price: number;
  latest_date: string;
}

export interface ExtractionItem {
  raw: string;
  canonical_name: string;
  category: ItemCategory;
  qty: number;
  unit_price: number;
  line_total: number | null;
  confidence: number;
}

export interface ExtractionResult {
  merchant: {
    name: string;
    branch_hint: string | null;
    type: MerchantType;
  };
  receipt_date: string | null;
  currency: "MYR";
  items: ExtractionItem[];
  totals: {
    grand_total: number | null;
  };
  notes: string[];
}

export interface ReviewItem extends ExtractionItem {
  id: string;
  canonical_item_id?: string;
  confirmed: boolean;
}

export interface BasketTemplate {
  id: string;
  name: string;
  description: string;
  items: { canonical_name: string; qty: number }[];
}
