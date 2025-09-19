import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ruwauvyhvcutmhdtvboe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function createAdmin() {
  const adminEmail = 'contactluxuryht@gmail.com'
  const adminPassword = 'LuxuryHaiti2024!'
  
  console.log('🔐 Creating admin account...')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Luxury Haiti Admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Admin account already exists!')
        
        // Update existing user to admin role
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const adminUser = existingUser.users.find(u => u.email === adminEmail)
        
        if (adminUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
            user_metadata: {
              role: 'admin',
              name: 'Luxury Haiti Admin'
            }
          })
          
          if (updateError) {
            console.error('❌ Error updating user role:', updateError.message)
          } else {
            console.log('✅ Updated existing user to admin role')
          }
        }
      } else {
        throw authError
      }
    } else {
      console.log('✅ Admin account created successfully!')
    }

    // Ensure user exists in public.users table
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const adminUser = existingUsers.users.find(u => u.email === adminEmail)
    
    if (adminUser) {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          auth_id: adminUser.id,
          email: adminEmail,
          name: 'Luxury Haiti Admin',
          role: 'admin'
        }, { onConflict: 'auth_id' })

      if (upsertError) {
        console.error('❌ Error creating user record:', upsertError.message)
      } else {
        console.log('✅ User record created in public.users table')
      }
    }

    console.log('')
    console.log('🎉 Admin account setup complete!')
    console.log('')
    console.log('📧 Login credentials:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('')
    console.log('🔗 Access admin portal at: /admin/login')

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message)
    process.exit(1)
  }
}

createAdmin().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
