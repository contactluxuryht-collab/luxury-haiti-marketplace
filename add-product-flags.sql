-- Add featured and best-seller flags to products table
-- Run this SQL in your Supabase SQL Editor

-- Add is_featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
    RAISE NOTICE 'Added is_featured column to products table';
  ELSE
    RAISE NOTICE 'is_featured column already exists in products table';
  END IF;
END $$;

-- Add is_best_seller column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_best_seller'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_best_seller boolean NOT NULL DEFAULT false;
    RAISE NOTICE 'Added is_best_seller column to products table';
  ELSE
    RAISE NOTICE 'is_best_seller column already exists in products table';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON public.products (is_best_seller) WHERE is_best_seller = true;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name IN ('is_featured', 'is_best_seller');
