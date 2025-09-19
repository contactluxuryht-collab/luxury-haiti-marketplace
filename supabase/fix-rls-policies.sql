-- Fix RLS Policy Recursion Error
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- 2. Create simple, non-recursive policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = auth_id);

-- 3. Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role' = 'admin' OR email = 'contactluxuryht@gmail.com')
  );
END;
$$;

-- 4. Create admin policies using the function
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update all users" 
ON public.users FOR UPDATE 
USING (public.is_admin());

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 6. Also fix product policies to avoid recursion
DROP POLICY IF EXISTS "Approved sellers can insert products" ON public.products;
DROP POLICY IF EXISTS "Approved sellers can update their products" ON public.products;
DROP POLICY IF EXISTS "Approved sellers can delete their products" ON public.products;

-- Create function to check seller approval
CREATE OR REPLACE FUNCTION public.is_seller_approved()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
      AND role = 'seller'
      AND COALESCE(seller_approved, false) = true
  );
END;
$$;

-- Create product policies using the function
CREATE POLICY "Approved sellers can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.is_seller_approved());

CREATE POLICY "Approved sellers can update their products"
ON public.products
FOR UPDATE
USING (public.is_seller_approved());

CREATE POLICY "Approved sellers can delete their products"
ON public.products
FOR DELETE
USING (public.is_seller_approved());

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_seller_approved() TO authenticated;

-- Success message
SELECT 'RLS policies have been fixed - no more recursion errors!' as message;
