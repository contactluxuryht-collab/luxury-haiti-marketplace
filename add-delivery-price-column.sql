-- Add delivery_price column to products table
-- This script safely adds the delivery_price column if it doesn't exist

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

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name = 'delivery_price';
