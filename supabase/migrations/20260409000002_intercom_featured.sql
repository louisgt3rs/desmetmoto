ALTER TABLE public.installation_intercoms
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
