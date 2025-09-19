import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

// Usage: node scripts/apply-sql.mjs <sql-file>
const [, , sqlFileArg] = process.argv
if (!sqlFileArg) {
  console.error('Usage: node scripts/apply-sql.mjs <sql-file>')
  process.exit(1)
}

const sqlPath = path.resolve(process.cwd(), sqlFileArg)
if (!fs.existsSync(sqlPath)) {
  console.error(`SQL file not found: ${sqlPath}`)
  process.exit(1)
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ruwauvyhvcutmhdtvboe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL // e.g. postgres://postgres:password@host:6543/postgres

async function applySql() {
  const sql = fs.readFileSync(sqlPath, 'utf-8')
  console.log(`Applying SQL from: ${sqlPath}`)

  // Prefer direct DB connection if available (best for DDL and security)
  if (SUPABASE_DB_URL) {
    const client = new pg.Client({ 
      connectionString: SUPABASE_DB_URL, 
      ssl: { 
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      } 
    })
    await client.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('COMMIT')
      console.log('SQL applied via direct DB connection.')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('Failed applying SQL via direct DB connection:', e)
      process.exit(1)
    } finally {
      await client.end()
    }
    return
  }

  // Fallback: use exec_sql RPC if present; requires service role key
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Set SUPABASE_DB_URL (preferred) or SUPABASE_SERVICE_ROLE_KEY to apply SQL.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const statements = sql.split(/;\s*(?=\n|$)/g).map(s => s.trim()).filter(Boolean)
  let success = 0
  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })
      if (error) {
        console.error('Error executing statement:', error.message)
        console.error(stmt)
      } else {
        success++
      }
    } catch (e) {
      console.error('Execution failed:', e)
      console.error(stmt)
    }
  }
  console.log(`Applied ${success}/${statements.length} statements via exec_sql RPC.`)
}

applySql().catch((e) => {
  console.error(e)
  process.exit(1)
})


