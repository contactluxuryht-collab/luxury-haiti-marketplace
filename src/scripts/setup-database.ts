import { supabase } from '@/integrations/supabase/client'

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

    // 3. Add missing columns to existing tables
    const alterQueries = [
      // Add missing columns to users table
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS selling_focus TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      
      // Add missing columns to products table
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[]`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2)`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      
      // Add missing columns to orders table
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      
      // Add missing columns to cart table
      `ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color TEXT`,
      `ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size TEXT`,
      `ALTER TABLE cart ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      
      // Add missing columns to reviews table
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE`,
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE`,
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
    ]

    // Execute alter queries using RPC
    for (const query of alterQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Error executing query:', query, error)
      }
    }

    console.log('Database setup completed successfully!')
    return { success: true }

  } catch (error) {
    console.error('Database setup failed:', error)
    return { success: false, error }
  }
}

// Function to create the exec_sql RPC function if it doesn't exist
export async function createExecSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', { 
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `
  })

  if (error && !error.message.includes('already exists')) {
    console.error('Error creating exec_sql function:', error)
  }
}

// Run setup if this file is executed directly
if (typeof window !== 'undefined') {
  setupDatabase()
}
