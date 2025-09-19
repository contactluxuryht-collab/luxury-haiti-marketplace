-- Create Admin User for Luxury Haiti Marketplace
-- Run this SQL in your Supabase SQL Editor

-- 1. First, let's check if the admin user already exists
SELECT email, role FROM public.users WHERE email = 'contactluxuryht@gmail.com';

-- 2. If the admin user doesn't exist, create it
INSERT INTO public.users (auth_id, email, name, role, seller_approved)
SELECT 
  auth_users.id,
  'contactluxuryht@gmail.com',
  'Luxury Haiti Admin',
  'admin',
  true
FROM auth.users 
WHERE auth_users.email = 'contactluxuryht@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  seller_approved = true;

-- 3. If the auth user doesn't exist, we need to create it first
-- This will create the auth user (you'll need to set the password manually)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'contactluxuryht@gmail.com',
  crypt('LuxuryHaiti2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin", "name": "Luxury Haiti Admin"}',
  false
) ON CONFLICT (email) DO UPDATE SET
  raw_user_meta_data = '{"role": "admin", "name": "Luxury Haiti Admin"}';

-- 4. Now create/update the public.users record
INSERT INTO public.users (auth_id, email, name, role, seller_approved)
SELECT 
  auth_users.id,
  'contactluxuryht@gmail.com',
  'Luxury Haiti Admin',
  'admin',
  true
FROM auth.users 
WHERE auth_users.email = 'contactluxuryht@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  seller_approved = true;

-- 5. Check the result
SELECT 'Admin user setup complete!' as message;
SELECT email, role, seller_approved FROM public.users WHERE email = 'contactluxuryht@gmail.com';
