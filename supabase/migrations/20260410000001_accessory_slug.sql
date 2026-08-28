ALTER TABLE public.installation_accessories
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS installation_accessories_slug_key ON public.installation_accessories (slug) WHERE slug IS NOT NULL;
