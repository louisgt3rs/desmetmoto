import type { Tables } from "@/integrations/supabase/types";

export type AdminBrand = Tables<"brands">;

export type AdminProduct = Tables<"products"> & {
  price?: number | null;
  brand?: string | null;
  in_stock?: boolean | null;
  stock_quantity?: number | null;
};

export type AdminEvent = Tables<"events"> & {
  event_date?: string | null;
  is_upcoming?: boolean | null;
  capacity?: number | null;
  registered_count?: number | null;
};
