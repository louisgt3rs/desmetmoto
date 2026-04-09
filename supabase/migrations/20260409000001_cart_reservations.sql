-- Multi-product cart reservation tables
CREATE TABLE public.cart_reservations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  notes       TEXT,
  status      public.reservation_status NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.cart_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create cart reservations" ON public.cart_reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage cart reservations" ON public.cart_reservations
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX cart_reservations_created_at_idx ON public.cart_reservations(created_at DESC);
CREATE INDEX cart_reservations_status_idx ON public.cart_reservations(status);

CREATE TABLE public.cart_reservation_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id        UUID NOT NULL REFERENCES public.cart_reservations(id) ON DELETE CASCADE,
  product_ref           TEXT NOT NULL,
  product_name          TEXT NOT NULL,
  quantity              INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  price_at_reservation  NUMERIC
);

ALTER TABLE public.cart_reservation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert cart reservation items" ON public.cart_reservation_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage cart reservation items" ON public.cart_reservation_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
