-- Temporarily disable RLS for testing
-- Run this SQL in your Supabase SQL Editor

-- 1. Disable RLS on users table temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on products table temporarily  
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on other tables temporarily
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS temporarily disabled for testing. Remember to re-enable it later!' as message;
