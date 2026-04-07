-- Add gallery_images array to installation_intercoms
ALTER TABLE installation_intercoms
  ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';
