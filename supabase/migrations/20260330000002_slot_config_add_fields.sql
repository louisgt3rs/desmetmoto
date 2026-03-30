SET search_path TO public;

ALTER TABLE public.event_slots_config
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS capacity INT,
  ADD COLUMN IF NOT EXISTS note TEXT;
