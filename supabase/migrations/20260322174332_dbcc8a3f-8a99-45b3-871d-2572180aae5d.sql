ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS price numeric(10,2),
  ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true;

UPDATE public.products AS p
SET brand = b.name
FROM public.brands AS b
WHERE p.brand IS NULL
  AND p.brand_id = b.id;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS is_upcoming boolean NOT NULL DEFAULT true;

UPDATE public.events
SET event_date = COALESCE(event_date, date);

UPDATE public.events
SET is_upcoming = CASE
  WHEN event_date IS NULL THEN COALESCE(is_published, true)
  ELSE event_date >= CURRENT_DATE
END;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS website_url text;

UPDATE public.brands
SET categories = CASE
  WHEN category IS NULL OR btrim(category) = '' THEN '{}'
  ELSE ARRAY[category]
END
WHERE categories = '{}';

UPDATE public.brands
SET website_url = COALESCE(website_url, '')
WHERE website_url IS NULL;

CREATE OR REPLACE FUNCTION public.sync_products_brand_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.brand_id IS NOT NULL THEN
    SELECT name INTO NEW.brand
    FROM public.brands
    WHERE id = NEW.brand_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_event_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.event_date := COALESCE(NEW.event_date, NEW.date);
  NEW.date := COALESCE(NEW.date, NEW.event_date);
  NEW.is_upcoming := CASE
    WHEN NEW.event_date IS NULL THEN COALESCE(NEW.is_published, true)
    ELSE NEW.event_date >= CURRENT_DATE
  END;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'sync_products_brand_name_trigger'
  ) THEN
    CREATE TRIGGER sync_products_brand_name_trigger
    BEFORE INSERT OR UPDATE OF brand_id ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_products_brand_name();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'sync_event_fields_trigger'
  ) THEN
    CREATE TRIGGER sync_event_fields_trigger
    BEFORE INSERT OR UPDATE OF date, event_date, is_published ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_event_fields();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at'
  ) THEN
    CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_brands_updated_at'
  ) THEN
    CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;