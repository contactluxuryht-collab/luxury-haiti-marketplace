// Ensure the Supabase storage bucket "product-images" exists (and is public)
// Requires environment variables:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (service_role key, NOT the anon key)
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ensure-storage-bucket.mjs

import { createClient } from '@supabase/supabase-js'

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = requiredEnv.filter((k) => !process.env[k])

if (missing.length > 0) {
  console.log(
    `Missing environment variables: ${missing.join(', ')}\n` +
    `Please set them and re-run. Example (PowerShell):\n` +
    `$env:SUPABASE_URL="https://YOUR_REF.supabase.co"; \n` +
    `$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"; \n` +
    `npm run storage:ensure\n`
  )
  process.exit(0)
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const BUCKET = 'product-images'

async function ensureBucket() {
  try {
    // List buckets to check existence
    const { data: buckets, error: listErr } = await supabaseAdmin.storage.listBuckets()
    if (listErr) throw listErr

    const exists = (buckets || []).some((b) => b.name === BUCKET)

    if (exists) {
      console.log(`Bucket "${BUCKET}" already exists.`)
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: '10MB',
      })
      if (createErr) throw createErr
      console.log(`Created bucket "${BUCKET}" (public=${created?.public ?? true}).`)
    }

    // Ensure bucket is public (idempotent)
    const { error: updErr } = await supabaseAdmin.storage.updateBucket(BUCKET, { public: true })
    if (updErr) throw updErr
    console.log(`Bucket "${BUCKET}" set to public access.`)

    console.log('Done.')
  } catch (e) {
    console.error('Failed to ensure bucket:', e?.message || e)
    process.exit(1)
  }
}

ensureBucket()


