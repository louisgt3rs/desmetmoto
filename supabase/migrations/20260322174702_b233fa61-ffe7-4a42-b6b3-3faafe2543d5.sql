DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;

CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
TO public
WITH CHECK (
  btrim(name) <> ''
  AND btrim(product_name) <> ''
  AND (email IS NULL OR btrim(email) <> '')
  AND (phone IS NULL OR btrim(phone) <> '')
);