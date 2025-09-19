import fs from 'fs'
import path from 'path'

// Usage: node scripts/apply-sql-direct.mjs <sql-file>
const [, , sqlFileArg] = process.argv
if (!sqlFileArg) {
  console.error('Usage: node scripts/apply-sql-direct.mjs <sql-file>')
  process.exit(1)
}

const sqlPath = path.resolve(process.cwd(), sqlFileArg)
if (!fs.existsSync(sqlPath)) {
  console.error(`SQL file not found: ${sqlPath}`)
  process.exit(1)
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ruwauvyhvcutmhdtvboe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
  process.exit(1)
}

async function applySqlDirect() {
  const sql = fs.readFileSync(sqlPath, 'utf-8')
  console.log(`Applying SQL from: ${sqlPath}`)

  // Use the Supabase REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify({ sql })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to apply SQL:', error)
    
    // If exec_sql doesn't exist, try to create it first
    console.log('Attempting to create exec_sql function...')
    const createFunctionSQL = `
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
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    })
    
    if (createResponse.ok) {
      console.log('✅ exec_sql function created successfully!')
      console.log('Please run the script again to apply the SQL.')
    } else {
      console.error('❌ Failed to create exec_sql function')
      console.log('Please run the SQL manually in your Supabase SQL Editor.')
    }
    
    process.exit(1)
  }

  const result = await response.json()
  console.log('✅ SQL applied successfully!')
  console.log('Result:', result)
}

applySqlDirect().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
