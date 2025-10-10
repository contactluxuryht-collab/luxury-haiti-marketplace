// Quick Admin Role Test
// Open browser console and run this to check your admin status

console.log('🔍 Admin Role Debug Test');
console.log('========================');

// Check current user
const checkAdminStatus = async () => {
  try {
    // Get current user from Supabase
    const { data: { user }, error } = await window.supabase?.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting user:', error);
      return;
    }
    
    if (!user) {
      console.log('❌ No user logged in');
      console.log('👉 Please log in first at /admin/login');
      return;
    }
    
    console.log('✅ User logged in:', user.email);
    console.log('📧 Email:', user.email);
    console.log('🆔 User ID:', user.id);
    console.log('📋 Metadata:', user.user_metadata);
    console.log('🎭 Role:', user.user_metadata?.role || 'none');
    
    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('👑 Is Admin:', isAdmin ? '✅ YES' : '❌ NO');
    
    if (isAdmin) {
      console.log('');
      console.log('🎉 SUCCESS! You are logged in as admin');
      console.log('🔗 You should now see:');
      console.log('   - "Admin" button in the header');
      console.log('   - "Tableau de bord Admin" in the sidebar');
      console.log('   - Access to /admin dashboard');
      console.log('');
      console.log('👉 Try navigating to: http://localhost:8081/admin');
    } else {
      console.log('');
      console.log('❌ PROBLEM: You are not recognized as admin');
      console.log('🔧 Solutions:');
      console.log('   1. Check your user metadata has role: "admin"');
      console.log('   2. Re-run the admin setup SQL');
      console.log('   3. Log out and log back in');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the check
checkAdminStatus();

// Also provide a manual check function
window.checkAdminStatus = checkAdminStatus;
console.log('');
console.log('💡 You can run checkAdminStatus() anytime to re-check');
