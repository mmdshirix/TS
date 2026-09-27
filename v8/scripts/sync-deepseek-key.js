const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

function loadEnvFile(fileName) {
  const envPath = path.join(__dirname, '..', fileName);

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

loadEnvFile('.env.local');
loadEnvFile('.env');

const DATABASE_URL = process.env.DATABASE_URL;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

if (!DEEPSEEK_API_KEY) {
  console.error('DEEPSEEK_API_KEY is not set');
  process.exit(1);
}

function mask(key) {
  return key.length > 8 ? `${key.slice(0, 6)}...${key.slice(-4)}` : '***';
}

async function syncKey() {
  const sql = postgres(DATABASE_URL, { connect_timeout: 15 });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS global_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      INSERT INTO global_settings (setting_key, setting_value, updated_at)
      VALUES ('ai_provider', 'deepseek', NOW())
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'deepseek', updated_at = NOW()
    `;

    await sql`
      INSERT INTO global_settings (setting_key, setting_value, updated_at)
      VALUES ('ai_api_key', ${DEEPSEEK_API_KEY}, NOW())
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = ${DEEPSEEK_API_KEY}, updated_at = NOW()
    `;

    console.log(`global_settings: ai_provider=deepseek, ai_api_key=${mask(DEEPSEEK_API_KEY)}`);

    const updated = await sql`
      UPDATE chatbots
      SET deepseek_api_key = ${DEEPSEEK_API_KEY}
      RETURNING id, name
    `;

    console.log(`Updated deepseek_api_key on ${updated.length} chatbot(s):`);
    updated.forEach((row) => console.log(`  #${row.id} ${row.name}`));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

syncKey().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
