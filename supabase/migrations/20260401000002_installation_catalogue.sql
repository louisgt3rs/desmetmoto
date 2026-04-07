SET search_path TO public;

CREATE TABLE public.installation_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installation_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.installation_brands FOR SELECT USING (true);
CREATE POLICY "Admin manage" ON public.installation_brands FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.installation_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.installation_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_modular BOOLEAN NOT NULL DEFAULT false,
  is_coming_soon BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installation_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.installation_models FOR SELECT USING (true);
CREATE POLICY "Admin manage" ON public.installation_models FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.installation_intercoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  is_coming_soon BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installation_intercoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.installation_intercoms FOR SELECT USING (true);
CREATE POLICY "Admin manage" ON public.installation_intercoms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed brands
INSERT INTO public.installation_brands (name, sort_order) VALUES
  ('Arai', 0),
  ('Shoei', 1),
  ('Alpinestars', 2);

-- Seed models
WITH b AS (SELECT id, name FROM public.installation_brands)
INSERT INTO public.installation_models (brand_id, name, is_modular, is_coming_soon, sort_order)
SELECT b.id, m.name, m.is_modular, m.is_coming_soon, m.sort_order
FROM b
JOIN (VALUES
  ('Arai',         'RX-7V Evo',     false, false, 0),
  ('Arai',         'Quantic',       false, false, 1),
  ('Arai',         'Concept-XE',    false, false, 2),
  ('Arai',         'Tour-X5',       false, false, 3),
  ('Arai',         'Profile-V',     false, false, 4),
  ('Arai',         'Astro GX',      true,  false, 5),
  ('Shoei',        'GT-Air 3',      false, false, 0),
  ('Shoei',        'NXR2',          false, false, 1),
  ('Shoei',        'X-SPR Pro',     false, false, 2),
  ('Shoei',        'Neotec 3',      true,  false, 3),
  ('Shoei',        'RF-1400',       false, false, 4),
  ('Alpinestars',  'Supertech R10', false, false, 0),
  ('Alpinestars',  'Supertech R7',  false, true,  1)
) AS m(brand_name, name, is_modular, is_coming_soon, sort_order)
ON b.name = m.brand_name;

-- Seed intercoms
INSERT INTO public.installation_intercoms (brand, name, is_coming_soon, sort_order) VALUES
  ('Sena',         'SF2',             false, 0),
  ('Sena',         'SF4',             false, 1),
  ('Sena',         '50S',             false, 2),
  ('Sena',         '50R',             false, 3),
  ('Sena',         '30K',             false, 4),
  ('Cardo',        'PackTalk Slim',   false, 0),
  ('Cardo',        'PackTalk Bold',   false, 1),
  ('Cardo',        'PackTalk Edge',   false, 2),
  ('Cardo',        'Freecom 4+',      false, 3),
  ('Alpinestars',  'Tech-Air Comm',   true,  0);
