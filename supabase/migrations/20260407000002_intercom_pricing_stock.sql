-- Add pricing, stock and duo pack fields to installation_intercoms
ALTER TABLE installation_intercoms
  ADD COLUMN IF NOT EXISTS prix       numeric,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS stock      integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pack_duo   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS prix_duo   numeric;
