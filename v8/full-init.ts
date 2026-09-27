// full-init.ts
import { getSql, initializeDatabase } from './lib/db';
import fs from 'fs';
import path from 'path';

async function main() {
  const sql = getSql();
  
  try {
    // 1. Initialize all tables
    console.log('📦 Step 1: Initializing database schema...');
    const initResult = await initializeDatabase();
    if (!initResult.success) {
      throw new Error(initResult.message);
    }
    console.log('✅ Schema created successfully');

    // 2. Run successful SQL files
    const successfulFiles = [
      'scripts/add-tickets-table.sql',
      'scripts/create-admin-tables.sql',
      'scripts/insert-sample-data.sql',
      'scripts/setup-database.sql',
      'scripts/update-tickets-table.sql'
    ];

    for (const file of successfulFiles) {
      if (fs.existsSync(file)) {
        console.log(`📄 Running ${file}...`);
        const content = fs.readFileSync(file, 'utf8');
        await sql.unsafe(content);
        console.log(`✅ ${file} completed`);
      }
    }

    console.log('\n🎉 Database fully initialized and migrated!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();