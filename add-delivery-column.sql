-- Add delivery_available column to products table
-- This script safely adds the delivery_available column if it doesn't exist

DO $$
BEGIN
    -- Check if delivery_available column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'delivery_available'
    ) THEN
        -- Add delivery_available column
        ALTER TABLE public.products ADD COLUMN delivery_available boolean NOT NULL DEFAULT true;
        RAISE NOTICE 'Added delivery_available column to products table';
    ELSE
        RAISE NOTICE 'delivery_available column already exists in products table';
    END IF;
END $$;

-- Create index for better query performance on delivery_available
CREATE INDEX IF NOT EXISTS products_delivery_available_idx ON public.products (delivery_available) WHERE delivery_available = true;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name = 'delivery_available';
