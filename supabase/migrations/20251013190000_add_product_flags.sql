-- Add featured and best-seller flags to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_best_seller'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_best_seller boolean NOT NULL DEFAULT false;
  END IF;

  -- Helpful indexes for home queries
  CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products (is_featured) WHERE is_featured = true;
  CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON public.products (is_best_seller) WHERE is_best_seller = true;
END $$;


