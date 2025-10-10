-- Complete Admin Setup SQL Script
-- Run this in your Supabase SQL Editor

-- Step 1: Create admin user in auth.users (if not exists)
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

-- Step 2: Create admin user in public.users table
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

-- Step 3: Verify the admin user was created
SELECT 
  'Admin Setup Complete!' as status,
  u.email,
  u.name,
  u.role,
  u.seller_approved,
  au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.email = 'contactluxuryht@gmail.com';

-- Step 4: Check if RLS policies allow admin access
SELECT 
  'RLS Policies Check' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname LIKE '%admin%';
