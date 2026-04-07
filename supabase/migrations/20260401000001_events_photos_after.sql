SET search_path TO public;

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photos_after TEXT[];
