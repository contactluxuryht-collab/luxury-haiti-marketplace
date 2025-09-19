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

async function applyDatabaseSetup() {
  console.log('🚀 Starting database setup...')

  try {
    // 1. Create storage bucket for product images
    console.log('📦 Creating storage bucket...')
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Error creating storage bucket:', bucketError)
    } else {
      console.log('✅ Storage bucket created or already exists')
    }

    // 2. Insert sample categories
    console.log('📂 Inserting categories...')
    const categories = [
      { name: 'Jewelry & Accessories', description: 'Handcrafted jewelry and fashion accessories' },
      { name: 'Fashion', description: 'Clothing and fashion items' },
      { name: 'Beauty', description: 'Beauty and personal care products' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
      { name: '18+ (Adults)', description: 'Adult products including vaping and age-restricted items' },
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Home & Living', description: 'Home decor and living essentials' },
      { name: 'Art & Crafts', description: 'Artwork and handmade crafts' }
    ]

    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'name' })
      
      if (error) {
        console.error('❌ Error inserting category:', error)
      }
    }
    console.log('✅ Categories inserted')

    // 3. Test if we can query the database
    console.log('🔍 Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection test failed:', testError)
    } else {
      console.log('✅ Database connection successful')
    }

    console.log('🎉 Database setup completed!')
    console.log('')
    console.log('⚠️  Note: Some SQL operations (ALTER TABLE, CREATE INDEX, etc.) need to be run manually.')
    console.log('Please copy and paste the following SQL into your Supabase SQL Editor:')
    console.log('')
    console.log('-- Add missing columns to existing tables')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT;')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS selling_focus TEXT;')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
    console.log('')
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;')
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[];')
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;')
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2);')
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;')
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
    console.log('')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT \'pending\';')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
    console.log('')
    console.log('ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color TEXT;')
    console.log('ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size TEXT;')
    console.log('ALTER TABLE cart ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
    console.log('')
    console.log('ALTER TABLE reviews ADD COLUMN IF NOT EXISTS seller_id UUID;')
    console.log('ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID;')
    console.log('ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

applyDatabaseSetup().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
