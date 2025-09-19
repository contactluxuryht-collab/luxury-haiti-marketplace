-- Fix Seller Approval System
-- Run this SQL in your Supabase SQL Editor

-- 1. Add seller_approved column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS seller_approved BOOLEAN DEFAULT FALSE;

-- 2. Update existing sellers to have null approval status (pending)
UPDATE public.users 
SET seller_approved = NULL 
WHERE role = 'seller' AND seller_approved IS NULL;

-- 3. Drop the existing product insertion policy
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;

-- 4. Create new policy that requires seller approval
CREATE POLICY "Sellers can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = products.seller_id 
      AND users.auth_id = auth.uid()
      AND users.role = 'seller'
      AND COALESCE(users.seller_approved, false) = true
  )
);

-- 5. Also update the product update and delete policies to require approval
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = products.seller_id 
      AND users.auth_id = auth.uid()
      AND users.role = 'seller'
      AND COALESCE(users.seller_approved, false) = true
  )
);

DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;
CREATE POLICY "Sellers can delete their own products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = products.seller_id 
      AND users.auth_id = auth.uid()
      AND users.role = 'seller'
      AND COALESCE(users.seller_approved, false) = true
  )
);

-- 6. Create a function to check seller approval status
CREATE OR REPLACE FUNCTION public.is_seller_approved(seller_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = seller_auth_id 
      AND role = 'seller'
      AND COALESCE(seller_approved, false) = true
  );
END;
$$;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_seller_approved(UUID) TO authenticated;

-- 8. Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_users_seller_approved ON public.users(seller_approved) WHERE role = 'seller';

-- Success message
SELECT 'Seller approval system has been successfully configured!' as message;
