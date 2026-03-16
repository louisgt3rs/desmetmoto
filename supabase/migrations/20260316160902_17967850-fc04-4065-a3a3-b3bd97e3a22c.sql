
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  logo_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands are publicly readable" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category TEXT,
  sizes TEXT[] DEFAULT '{}',
  image_url TEXT,
  price_range TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TEXT,
  location TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published events are publicly readable" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  product_name TEXT NOT NULL,
  size TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage reservations" ON public.reservations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create reservations" ON public.reservations FOR INSERT WITH CHECK (true);

-- Gallery photos
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery photos are publicly readable" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_photos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Store settings (key-value)
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are publicly readable" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
CREATE POLICY "Images are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

-- Seed default store settings
INSERT INTO public.store_settings (key, value) VALUES
  ('address', 'Chaussée de Louvain 491, 1300 Wavre, Belgium'),
  ('phone', '010 84 21 39'),
  ('hours_weekday', 'Lun-Ven: 9h00 - 18h00'),
  ('hours_saturday', 'Sam: 9h00 - 17h00'),
  ('hours_sunday', 'Dim: Fermé'),
  ('hero_title', 'Desmet Équipement – Spécialiste Moto à Wavre'),
  ('hero_subtitle', 'Casques • Vestes • Gants • Équipement Moto'),
  ('about_text', 'Desmet Équipement est votre spécialiste en équipement moto à Wavre. Notre équipe passionnée vous guide dans le choix de votre équipement pour rouler en toute sécurité et avec style.');

-- Seed brands
INSERT INTO public.brands (name, description, category, sort_order) VALUES
  ('Arai', 'Casques haut de gamme fabriqués à la main au Japon.', 'Casques', 1),
  ('Shoei', 'Casques premium réputés pour leur confort et sécurité.', 'Casques', 2),
  ('Shark', 'Casques innovants avec un excellent rapport qualité-prix.', 'Casques', 3),
  ('Alpinestars', 'Équipement technique pour motards exigeants.', 'Textile & Cuir', 4),
  ('Dainese', 'Protection et style à l''italienne depuis 1972.', 'Textile & Cuir', 5),
  ('Rev''It', 'Vêtements moto innovants et stylés.', 'Textile & Cuir', 6),
  ('Held', 'Gants et équipements allemands de qualité supérieure.', 'Gants', 7),
  ('Bering', 'Gants et blousons moto de qualité française.', 'Gants', 8),
  ('Sidi', 'Bottes de course et touring fabriquées en Italie.', 'Bottes', 9),
  ('TCX', 'Chaussures et bottes moto au design moderne.', 'Bottes', 10),
  ('Oxford', 'Accessoires et bagagerie pour motards.', 'Accessoires', 11),
  ('Cardo', 'Intercoms Bluetooth pour communication en moto.', 'Accessoires', 12);

-- Seed Arai products
INSERT INTO public.products (name, description, brand_id, category, sizes, is_featured, sort_order) VALUES
  ('RX-7V EVO', 'Le casque de course ultime d''Arai. Technologie de pointe pour une protection maximale sur piste et route.', (SELECT id FROM public.brands WHERE name = 'Arai'), 'Casques', ARRAY['XS','S','M','L','XL'], true, 1),
  ('Quantic', 'Le touring premium par Arai. Confort exceptionnel pour les longs trajets avec ventilation optimale.', (SELECT id FROM public.brands WHERE name = 'Arai'), 'Casques', ARRAY['S','M','L','XL','XXL'], true, 2),
  ('Concept-XE', 'Le modulable haut de gamme. Polyvalence et protection avec la qualité Arai.', (SELECT id FROM public.brands WHERE name = 'Arai'), 'Casques', ARRAY['XS','S','M','L','XL'], true, 3),
  ('Tour-X', 'L''aventurier par excellence. Conçu pour l''aventure et le tout-terrain avec visière longue.', (SELECT id FROM public.brands WHERE name = 'Arai'), 'Casques', ARRAY['S','M','L','XL'], true, 4);

-- Seed first event
INSERT INTO public.events (title, description, date, time, location) VALUES
  ('Bikes & Coffee – Édition 1', 'Un rassemblement moto convivial devant le magasin où les motards se retrouvent autour d''un café pour partager leur passion.', '2025-03-28', '10:00', 'Desmet Équipement – Wavre');
