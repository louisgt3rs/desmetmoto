ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS reference_code text,
ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS registered_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_reference_code ON public.products(reference_code);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_events_capacity ON public.events(capacity);
CREATE INDEX IF NOT EXISTS idx_events_registered_count ON public.events(registered_count);