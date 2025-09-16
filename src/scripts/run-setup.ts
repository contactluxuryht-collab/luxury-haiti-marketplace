// Run this script to set up the database
import { setupDatabase, createExecSqlFunction } from './setup-database'

async function main() {
  console.log('Starting database setup...')
  
  // First create the exec_sql function
  await createExecSqlFunction()
  
  // Then run the setup
  const result = await setupDatabase()
  
  if (result.success) {
    console.log('✅ Database setup completed successfully!')
  } else {
    console.error('❌ Database setup failed:', result.error)
  }
}

main().catch(console.error)
