-- Add missing columns to fix build errors
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS seller_approved BOOLEAN DEFAULT false;