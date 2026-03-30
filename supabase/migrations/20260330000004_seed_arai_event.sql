-- Update the "test arai" event with real metadata
UPDATE public.events
SET
  title            = 'Journée Arai — Essais & Fitting',
  description      = 'Venez essayer et faire ajuster votre casque Arai par nos experts. Réservez votre créneau de 30 minutes pour un fitting personnalisé : mesure, conseil et ajustement sur mesure avec un spécialiste Desmet Équipement.',
  event_date       = '2026-04-21',
  date             = '2026-04-21',
  time             = '10:00 – 18:00',
  location         = 'Desmet Équipement — Rue de la Châtaigneraie 20, 1410 Waterloo',
  capacity         = 0,
  registered_count = 0,
  is_published     = true,
  is_upcoming      = true
WHERE id = '2325a10e-8a67-4157-8d59-9610b7e058c1';

-- Add a default slot item so booking is enabled
INSERT INTO public.event_slot_items (id, event_id, name, description, is_active)
VALUES (
  gen_random_uuid(),
  '2325a10e-8a67-4157-8d59-9610b7e058c1',
  'Fitting Arai',
  'Séance de fitting casque avec un expert Arai',
  true
)
ON CONFLICT DO NOTHING;
