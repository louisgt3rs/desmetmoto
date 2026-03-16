
-- Add stock_by_size jsonb column to helmet_colorways
-- Format: {"XS": 1, "S": 2, "M": 0, "L": 1, "XL": 0}
ALTER TABLE public.helmet_colorways ADD COLUMN stock_by_size jsonb DEFAULT '{}'::jsonb;
