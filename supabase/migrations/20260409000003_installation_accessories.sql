CREATE TABLE IF NOT EXISTS public.installation_accessories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  brand         text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT '',
  image_url     text,
  gallery_images jsonb NOT NULL DEFAULT '[]',
  prix          numeric(10,2),
  stock         integer NOT NULL DEFAULT 0,
  description   text,
  is_coming_soon boolean NOT NULL DEFAULT false,
  featured      boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.installation_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read accessories"
  ON public.installation_accessories FOR SELECT USING (true);

CREATE POLICY "Anon insert accessories"
  ON public.installation_accessories FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon update accessories"
  ON public.installation_accessories FOR UPDATE USING (true);

CREATE POLICY "Anon delete accessories"
  ON public.installation_accessories FOR DELETE USING (true);
