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

loadLocalEnv();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

function splitSqlStatements(sqlContent) {
  const statements = [];
  let current = '';
  let singleQuote = false;
  let doubleQuote = false;
  let lineComment = false;
  let blockComment = false;
  let dollarQuoteTag = null;

  for (let i = 0; i < sqlContent.length; i += 1) {
    const char = sqlContent[i];
    const next = sqlContent[i + 1];

    if (lineComment) {
      current += char;

      if (char === '\n') {
        lineComment = false;
      }

      continue;
    }

    if (blockComment) {
      current += char;

      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        blockComment = false;
      }

      continue;
    }

    if (dollarQuoteTag) {
      const maybeTag = sqlContent.slice(i, i + dollarQuoteTag.length);

      if (maybeTag === dollarQuoteTag) {
        current += maybeTag;
        i += dollarQuoteTag.length - 1;
        dollarQuoteTag = null;
      } else {
        current += char;
      }

      continue;
    }

    if (!singleQuote && !doubleQuote) {
      if (char === '-' && next === '-') {
        current += char + next;
        i += 1;
        lineComment = true;
        continue;
      }

      if (char === '/' && next === '*') {
        current += char + next;
        i += 1;
        blockComment = true;
        continue;
      }

      if (char === '$') {
        const match = sqlContent.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);

        if (match) {
          dollarQuoteTag = match[0];
          current += dollarQuoteTag;
          i += dollarQuoteTag.length - 1;
          continue;
        }
      }
    }

    if (!doubleQuote && char === "'" && singleQuote && next === "'") {
      current += char + next;
      i += 1;
      continue;
    }

    if (!doubleQuote && char === "'") {
      singleQuote = !singleQuote;
      current += char;
      continue;
    }

    if (!singleQuote && char === '"') {
      doubleQuote = !doubleQuote;
      current += char;
      continue;
    }

    if (!singleQuote && !doubleQuote && char === ';') {
      const statement = current.trim();

      if (statement) {
        statements.push(statement);
      }

      current = '';
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();

  if (finalStatement) {
    statements.push(finalStatement);
  }

  return statements;
}

async function runMigrations() {
  const sql = postgres(DATABASE_URL, { connect_timeout: 15 });
  const errors = [];

  try {
    const allSqlFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Some later migrations reference tables (e.g. `stores`) created in
    // create-ecommerce-core.sql, which sorts after them alphabetically
    // ("create-bale-bot" < "create-ecommerce-core"). Run known foundational
    // schema files first so FK references always resolve regardless of
    // filename ordering.
    const priority = ['setup-database.sql', 'create_auth_system.sql', 'create-ecommerce-core.sql']
      .filter(file => allSqlFiles.includes(file));
    const sqlFiles = [...priority, ...allSqlFiles.filter(file => !priority.includes(file))];

    console.log(`Found ${sqlFiles.length} SQL files`);

    for (const file of sqlFiles) {
      console.log(`\nRunning ${file}...`);
      const sqlContent = fs.readFileSync(path.join(__dirname, file), 'utf8');

      try {
        const statements = splitSqlStatements(sqlContent);

        for (const statement of statements) {
          if (!statement.toLowerCase().startsWith('select')) {
            await sql.unsafe(statement);
          }
        }

        console.log(`${file} completed`);
      } catch (error) {
        errors.push({ file, message: error.message });
        console.error(`Error in ${file}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error(`\n${errors.length} migration file(s) failed.`);
      process.exitCode = 1;
      return;
    }

    console.log('\nAll migrations completed successfully.');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

runMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
