import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (no localStorage)
const supabase = createClient(
  "https://ruwauvyhvcutmhdtvboe.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d2F1dnlodmN1dG1oZHR2Ym9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODQ5NjMsImV4cCI6MjA3MzM2MDk2M30.PyfwGM6GljhxgCa4bjlbuTP8wPasZZDi2mvTJ9OOTwM"
)

// Database setup script
export async function setupDatabase() {
  try {
    console.log('Setting up database...')

    // 1. Create storage bucket for product images
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating storage bucket:', bucketError)
    } else {
      console.log('Storage bucket created or already exists')
    }

    // 2. Insert sample categories if they don't exist
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
        console.error('Error inserting category:', error)
      }
    }
    console.log('Categories inserted')

    // 3. Check if we can add columns directly
    console.log('Attempting to add missing columns...')
    
    // Try to add columns one by one
    const columnUpdates = [
      // Users table updates
      { table: 'users', column: 'business_name', type: 'TEXT' },
      { table: 'users', column: 'phone_number', type: 'TEXT' },
      { table: 'users', column: 'selling_focus', type: 'TEXT' },
      { table: 'users', column: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      
      // Products table updates
      { table: 'products', column: 'quantity', type: 'INTEGER DEFAULT 0' },
      { table: 'products', column: 'colors', type: 'TEXT[]' },
      { table: 'products', column: 'size', type: 'TEXT' },
      { table: 'products', column: 'weight', type: 'DECIMAL(8,2)' },
      { table: 'products', column: 'is_active', type: 'BOOLEAN DEFAULT true' },
      { table: 'products', column: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      
      // Orders table updates
      { table: 'orders', column: 'seller_id', type: 'UUID' },
      { table: 'orders', column: 'quantity', type: 'INTEGER NOT NULL DEFAULT 1' },
      { table: 'orders', column: 'price_per_unit', type: 'DECIMAL(10,2) NOT NULL DEFAULT 0' },
      { table: 'orders', column: 'total_amount', type: 'DECIMAL(10,2) NOT NULL DEFAULT 0' },
      { table: 'orders', column: 'shipping_address', type: 'JSONB' },
      { table: 'orders', column: 'payment_method', type: 'TEXT' },
      { table: 'orders', column: 'payment_status', type: 'TEXT DEFAULT \'pending\'' },
      { table: 'orders', column: 'notes', type: 'TEXT' },
      { table: 'orders', column: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      
      // Cart table updates
      { table: 'cart', column: 'selected_color', type: 'TEXT' },
      { table: 'cart', column: 'selected_size', type: 'TEXT' },
      { table: 'cart', column: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      
      // Reviews table updates
      { table: 'reviews', column: 'seller_id', type: 'UUID' },
      { table: 'reviews', column: 'order_id', type: 'UUID' },
      { table: 'reviews', column: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
    ]

    // Note: We can't directly alter tables via the client API
    // The user will need to run the SQL manually in Supabase dashboard
    console.log('⚠️  Note: Some columns need to be added manually via SQL Editor')
    console.log('Please run the following SQL in your Supabase SQL Editor:')
    console.log('')
    
    for (const update of columnUpdates) {
      console.log(`ALTER TABLE ${update.table} ADD COLUMN IF NOT EXISTS ${update.column} ${update.type};`)
    }

    console.log('')
    console.log('Database setup completed!')
    console.log('✅ Storage bucket created')
    console.log('✅ Categories inserted')
    console.log('⚠️  Please run the ALTER TABLE statements above in Supabase SQL Editor')
    
    return { success: true }

  } catch (error) {
    console.error('Database setup failed:', error)
    return { success: false, error }
  }
}

// Run setup
setupDatabase().then(result => {
  if (result.success) {
    console.log('✅ Setup completed successfully!')
  } else {
    console.error('❌ Setup failed:', result.error)
  }
}).catch(console.error)
