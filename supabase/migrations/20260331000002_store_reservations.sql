CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE public.store_reservations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  coloris      TEXT,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  message      TEXT,
  status       public.reservation_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a reservation
CREATE POLICY "Anyone can create store reservations" ON public.store_reservations
  FOR INSERT WITH CHECK (true);

-- Admins can read and manage all
CREATE POLICY "Admins can manage store reservations" ON public.store_reservations
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX store_reservations_created_at_idx ON public.store_reservations(created_at DESC);
CREATE INDEX store_reservations_status_idx ON public.store_reservations(status);
