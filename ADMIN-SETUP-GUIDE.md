# 🔐 Admin Login Troubleshooting Guide

## **Admin Credentials**
- **Email**: `contactluxuryht@gmail.com`
- **Password**: `LuxuryHaiti2024!`
- **Login URL**: `/admin/login`

## **Step-by-Step Setup**

### **Method 1: Using Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Open your Supabase project dashboard
   - Navigate to `Authentication` > `Users`

2. **Create Admin User**
   - Click `Add User`
   - Email: `contactluxuryht@gmail.com`
   - Password: `LuxuryHaiti2024!`
   - ✅ Check "Email Confirmed"
   - User Metadata: `{"role": "admin", "name": "Luxury Haiti Admin"}`

3. **Create Public User Record**
   - Go to `SQL Editor`
   - Run the SQL from `setup-admin.sql`

### **Method 2: Using SQL Script**

1. **Open Supabase SQL Editor**
2. **Run the complete SQL script** from `setup-admin.sql`
3. **Verify the setup** by checking the results

## **Common Issues & Solutions**

### **❌ "Access denied - Admin role required"**
**Cause**: User exists but doesn't have admin role
**Solution**: 
```sql
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin", "name": "Luxury Haiti Admin"}'
WHERE email = 'contactluxuryht@gmail.com';
```

### **❌ "Invalid login credentials"**
**Cause**: User doesn't exist or wrong password
**Solution**: Create the user using Method 1 above

### **❌ "User not found in public.users"**
**Cause**: Auth user exists but no public record
**Solution**: Run this SQL:
```sql
INSERT INTO public.users (auth_id, email, name, role, seller_approved)
SELECT 
  auth_users.id,
  'contactluxuryht@gmail.com',
  'Luxury Haiti Admin',
  'admin',
  true
FROM auth.users 
WHERE auth_users.email = 'contactluxuryht@gmail.com';
```

### **❌ "RLS Policy Error"**
**Cause**: Row Level Security blocking access
**Solution**: Run this SQL:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Or create proper admin policy
CREATE POLICY "Admins can access all users" 
ON public.users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
```

## **Verification Steps**

1. **Check Auth User**:
   ```sql
   SELECT email, raw_user_meta_data, email_confirmed_at 
   FROM auth.users 
   WHERE email = 'contactluxuryht@gmail.com';
   ```

2. **Check Public User**:
   ```sql
   SELECT email, name, role, seller_approved 
   FROM public.users 
   WHERE email = 'contactluxuryht@gmail.com';
   ```

3. **Test Login**:
   - Go to `/admin/login`
   - Use credentials above
   - Should redirect to `/admin` dashboard

## **Alternative Admin Account**

If you want to use a different email:

1. **Update the email** in all scripts
2. **Run the setup** with your preferred email
3. **Update the admin login** if needed

## **Need Help?**

If you're still having issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Check network tab for failed requests
4. Ensure your Supabase project is active
