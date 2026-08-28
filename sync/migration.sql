-- Run this once in the Supabase SQL Editor before the first sync.
-- Adds the supplier_ref column used to match feed products with DB rows.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_ref TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS products_supplier_ref_idx
  ON products (supplier_ref)
  WHERE supplier_ref IS NOT NULL;

-- Optional: track which products came from Parts Europe
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
