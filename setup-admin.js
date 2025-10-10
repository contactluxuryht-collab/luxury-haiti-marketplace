// Simple Admin Setup Script
// Run this in your browser console on your Supabase dashboard

console.log('🔐 Admin Setup Instructions:');
console.log('');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to Authentication > Users');
console.log('3. Click "Add User"');
console.log('4. Use these credentials:');
console.log('   Email: contactluxuryht@gmail.com');
console.log('   Password: LuxuryHaiti2024!');
console.log('   Email Confirmed: ✅ Yes');
console.log('   User Metadata: {"role": "admin", "name": "Luxury Haiti Admin"}');
console.log('');
console.log('5. After creating the user, go to SQL Editor');
console.log('6. Run this SQL query:');
console.log('');
console.log(`
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
`);
console.log('');
console.log('7. Then try logging in at: /admin/login');
console.log('   Email: contactluxuryht@gmail.com');
console.log('   Password: LuxuryHaiti2024!');
