
-- Create product_colorways table
CREATE TABLE public.product_colorways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  stock_by_size jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_colorways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product colorways" ON public.product_colorways FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Product colorways are publicly readable" ON public.product_colorways FOR SELECT TO public USING (true);

-- Remove reference_code and single colorway columns
ALTER TABLE public.products DROP COLUMN IF EXISTS reference_code;
ALTER TABLE public.products DROP COLUMN IF EXISTS colorway;
