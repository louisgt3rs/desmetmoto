SET search_path TO public;

-- event_slots_config: defines bookable time blocks for an event
-- event_id is a plain UUID (no FK to events) so this migration is self-contained
CREATE TABLE public.event_slots_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_slots_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slot configs are publicly readable" ON public.event_slots_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage slot configs" ON public.event_slots_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- event_slot_items: bookable resources (e.g. helmets, motorcycles, simulators)
CREATE TABLE public.event_slot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_slot_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slot items are publicly readable" ON public.event_slot_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage slot items" ON public.event_slot_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- event_slot_bookings: individual slot reservations
CREATE TABLE public.event_slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  slot_item_id UUID NOT NULL REFERENCES event_slot_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slot_time TIME NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  newsletter_consent BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_item_id, date, slot_time)
);
ALTER TABLE public.event_slot_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create bookings" ON public.event_slot_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings are publicly readable for availability" ON public.event_slot_bookings FOR SELECT USING (true);
CREATE POLICY "Admins can manage bookings" ON public.event_slot_bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
