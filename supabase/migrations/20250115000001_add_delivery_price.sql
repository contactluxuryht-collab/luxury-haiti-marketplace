-- Add delivery_price column to products table
-- Migration: 20250115000001_add_delivery_price

DO $$
BEGIN
    -- Check if delivery_price column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'delivery_price'
    ) THEN
        -- Add delivery_price column
        ALTER TABLE public.products ADD COLUMN delivery_price decimal(10,2) NULL DEFAULT NULL;
        RAISE NOTICE 'Added delivery_price column to products table';
    ELSE
        RAISE NOTICE 'delivery_price column already exists in products table';
    END IF;
END $$;

-- Create index for better query performance on delivery_price
CREATE INDEX IF NOT EXISTS products_delivery_price_idx ON public.products (delivery_price) WHERE delivery_price IS NOT NULL;
