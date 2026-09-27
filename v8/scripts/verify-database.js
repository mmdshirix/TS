const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

function loadLocalEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    let value = trimmed.slice(separatorIndex + 1);

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function verifyDatabase() {
  loadLocalEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 10 });

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`table_count=${tables.length}`);
    console.log(tables.map((table) => table.table_name).join(','));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

verifyDatabase().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
