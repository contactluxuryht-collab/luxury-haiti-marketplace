-- Quick Fix for Seller Approval System
-- Run this SQL in your Supabase SQL Editor

-- 1. Add seller_approved column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS seller_approved BOOLEAN DEFAULT NULL;

-- 2. Update existing sellers to pending status
UPDATE public.users 
SET seller_approved = NULL 
WHERE role = 'seller' AND seller_approved IS NULL;

-- 3. Drop existing product policies
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;

-- 4. Create new policies that require seller approval
CREATE POLICY "Approved sellers can insert products"
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

CREATE POLICY "Approved sellers can update their products"
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

CREATE POLICY "Approved sellers can delete their products"
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

-- 5. Add admin policies for user management
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" 
ON public.users FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 6. Create function to check seller approval
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

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_seller_approved(UUID) TO authenticated;

-- 8. Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_seller_approved ON public.users(seller_approved) WHERE role = 'seller';

-- Success message
SELECT 'Seller approval system has been successfully configured!' as message;
