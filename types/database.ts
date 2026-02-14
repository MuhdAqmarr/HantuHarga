export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          name: string;
          type: string;
          area: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          area: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          area?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      canonical_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      receipts: {
        Row: {
          id: string;
          user_id: string;
          merchant_id: string;
          receipt_date: string | null;
          area: string;
          currency: string;
          grand_total: number | null;
          image_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_id: string;
          receipt_date?: string | null;
          area: string;
          currency?: string;
          grand_total?: number | null;
          image_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merchant_id?: string;
          receipt_date?: string | null;
          area?: string;
          currency?: string;
          grand_total?: number | null;
          image_path?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
        ];
      };
      receipt_items: {
        Row: {
          id: string;
          receipt_id: string;
          canonical_item_id: string;
          raw: string;
          qty: number;
          unit_price: number;
          line_total: number | null;
          confidence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          canonical_item_id: string;
          raw: string;
          qty?: number;
          unit_price: number;
          line_total?: number | null;
          confidence?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          receipt_id?: string;
          canonical_item_id?: string;
          raw?: string;
          qty?: number;
          unit_price?: number;
          line_total?: number | null;
          confidence?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipt_items_receipt_id_fkey";
            columns: ["receipt_id"];
            isOneToOne: false;
            referencedRelation: "receipts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "receipt_items_canonical_item_id_fkey";
            columns: ["canonical_item_id"];
            isOneToOne: false;
            referencedRelation: "canonical_items";
            referencedColumns: ["id"];
          },
        ];
      };
      price_points: {
        Row: {
          id: string;
          canonical_item_id: string;
          merchant_id: string;
          area: string;
          observed_date: string;
          currency: string;
          unit_price: number;
          qty: number;
          confidence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          canonical_item_id: string;
          merchant_id: string;
          area: string;
          observed_date: string;
          currency?: string;
          unit_price: number;
          qty?: number;
          confidence?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          canonical_item_id?: string;
          merchant_id?: string;
          area?: string;
          observed_date?: string;
          currency?: string;
          unit_price?: number;
          qty?: number;
          confidence?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_points_canonical_item_id_fkey";
            columns: ["canonical_item_id"];
            isOneToOne: false;
            referencedRelation: "canonical_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_points_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_price_stats: {
        Args: {
          p_canonical_item_id: string;
          p_area?: string | null;
          p_days_back?: number;
        };
        Returns: {
          min_price: number;
          max_price: number;
          median_price: number;
          p25_price: number;
          p75_price: number;
          avg_price: number;
          observation_count: number;
          latest_price: number;
          latest_date: string;
        }[];
      };
      search_items: {
        Args: {
          p_query: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          name: string;
          category: string;
          similarity: number;
        }[];
      };
      get_bulk_price_summary: {
        Args: {
          p_item_ids: string[];
          p_days_back?: number;
        };
        Returns: {
          canonical_item_id: string;
          median_price: number;
          latest_price: number;
          observation_count: number;
        }[];
      };
      get_cheapest_merchants: {
        Args: {
          p_canonical_item_id: string;
          p_area?: string | null;
          p_days_back?: number;
          p_limit?: number;
        };
        Returns: {
          merchant_id: string;
          merchant_name: string;
          merchant_type: string;
          area: string;
          min_price: number;
          avg_price: number;
          sample_count: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
