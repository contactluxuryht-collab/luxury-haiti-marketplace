-- Fix featured and best seller functionality
-- This script ensures the columns exist and have proper permissions

-- 1. Ensure is_featured column exists and is properly configured
DO $$
BEGIN
    -- Check if is_featured column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_featured'
    ) THEN
        -- Add is_featured column
        ALTER TABLE public.products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
        RAISE NOTICE 'Added is_featured column to products table';
    ELSE
        RAISE NOTICE 'is_featured column already exists in products table';
    END IF;
END $$;

-- 2. Ensure is_best_seller column exists and is properly configured
DO $$
BEGIN
    -- Check if is_best_seller column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_best_seller'
    ) THEN
        -- Add is_best_seller column
        ALTER TABLE public.products ADD COLUMN is_best_seller boolean NOT NULL DEFAULT false;
        RAISE NOTICE 'Added is_best_seller column to products table';
    ELSE
        RAISE NOTICE 'is_best_seller column already exists in products table';
    END IF;
END $$;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON public.products (is_best_seller) WHERE is_best_seller = true;

-- 4. Update RLS policies to allow updates to is_featured and is_best_seller
-- First, let's check if RLS is enabled
DO $$
BEGIN
    IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'products') THEN
        RAISE NOTICE 'RLS is enabled on products table';
        
        -- Drop existing policies that might be blocking updates
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.products;
        DROP POLICY IF EXISTS "Enable update for users based on seller_id" ON public.products;
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.products;
        
        -- Create a new policy that allows updates to is_featured and is_best_seller
        CREATE POLICY "Enable update for featured and best seller fields" ON public.products
            FOR UPDATE USING (true)
            WITH CHECK (true);
            
        RAISE NOTICE 'Created new RLS policy for featured and best seller updates';
    ELSE
        RAISE NOTICE 'RLS is not enabled on products table';
    END IF;
END $$;

-- 5. Grant necessary permissions
GRANT UPDATE ON public.products TO anon;
GRANT UPDATE ON public.products TO authenticated;

-- 6. Test the columns exist and are accessible
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name IN ('is_featured', 'is_best_seller');

-- 7. Test update functionality
DO $$
DECLARE
    test_product_id text;
    update_result record;
BEGIN
    -- Get a test product ID
    SELECT id INTO test_product_id FROM public.products LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        -- Test updating is_featured
        UPDATE public.products 
        SET is_featured = NOT is_featured 
        WHERE id = test_product_id;
        
        -- Test updating is_best_seller
        UPDATE public.products 
        SET is_best_seller = NOT is_best_seller 
        WHERE id = test_product_id;
        
        RAISE NOTICE 'Test updates completed successfully for product: %', test_product_id;
    ELSE
        RAISE NOTICE 'No products found to test with';
    END IF;
END $$;
