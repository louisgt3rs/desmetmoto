
-- Helmet models table
CREATE TABLE public.helmet_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sizes TEXT[] DEFAULT '{}'::TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.helmet_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helmet models are publicly readable" ON public.helmet_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage helmet models" ON public.helmet_models FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_helmet_models_updated_at BEFORE UPDATE ON public.helmet_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helmet colorways table
CREATE TABLE public.helmet_colorways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.helmet_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  main_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}'::TEXT[],
  images_360 TEXT[] DEFAULT '{}'::TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(model_id, slug)
);

ALTER TABLE public.helmet_colorways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colorways are publicly readable" ON public.helmet_colorways FOR SELECT USING (true);
CREATE POLICY "Admins can manage colorways" ON public.helmet_colorways FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_helmet_colorways_updated_at BEFORE UPDATE ON public.helmet_colorways FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
