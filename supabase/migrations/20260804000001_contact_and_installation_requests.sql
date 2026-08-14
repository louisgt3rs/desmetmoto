CREATE TABLE public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  message    TEXT NOT NULL,
  status     public.reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages" ON public.contact_messages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX contact_messages_created_at_idx ON public.contact_messages(created_at DESC);
CREATE INDEX contact_messages_status_idx ON public.contact_messages(status);

CREATE TABLE public.installation_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  helmet         TEXT,
  accessory_type TEXT NOT NULL,
  message        TEXT,
  status         public.reservation_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.installation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create installation requests" ON public.installation_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage installation requests" ON public.installation_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX installation_requests_created_at_idx ON public.installation_requests(created_at DESC);
CREATE INDEX installation_requests_status_idx ON public.installation_requests(status);
