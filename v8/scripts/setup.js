#!/usr/bin/env node
/**
 * One-shot database bootstrap for Taxel / TalkSell.
 *
 *   DATABASE_URL=postgresql://... node scripts/setup.js
 *
 * 1. Applies every SQL migration in scripts/*.sql (idempotent).
 * 2. Seeds platform defaults (Arvan as the default AI provider).
 * 3. Creates / updates the platform admin account.
 *
 * Optional env: ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL,
 *               ARVAN_API_URL, ARVAN_API_KEY, DEEPSEEK_API_KEY (copied into global_settings when set)
 */
const path = require("path")
const { spawnSync } = require("child_process")
const postgres = require("postgres")
const bcrypt = require("bcryptjs")

function loadEnvFile(file) {
  const fs = require("fs")
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    const k = t.slice(0, i)
    let v = t.slice(i + 1)
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnvFile(path.join(__dirname, "..", ".env.local"))
loadEnvFile(path.join(__dirname, "..", ".env"))
loadEnvFile(path.join(__dirname, "..", "..", "deploy", "platform.env"))

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

async function main() {
  console.log("▶ Step 1/3 — applying SQL migrations")
  const mig = spawnSync(process.execPath, [path.join(__dirname, "run-migrations.js")], { stdio: "inherit", env: process.env })
  if (mig.status !== 0) {
    console.error("Some migrations failed — continuing with seeding, review the log above.")
  }

  const sql = postgres(DATABASE_URL, { connect_timeout: 20, max: 2 })
  try {
    console.log("\n▶ Step 2/3 — seeding platform defaults")
    const seeds = {
      ai_provider: process.env.AI_PROVIDER || "arvan",
      ai_fallback_enabled: "true",
      arvan_api_url: process.env.ARVAN_API_URL,
      arvan_api_key: process.env.ARVAN_API_KEY,
      arvan_model: process.env.ARVAN_MODEL || "Xerxes-1",
      deepseek_api_key: process.env.DEEPSEEK_API_KEY,
      platform_name: "Taxel",
    }
    for (const [key, value] of Object.entries(seeds)) {
      if (!value) continue
      await sql`
        INSERT INTO global_settings (setting_key, setting_value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
      `
      console.log(`  ✓ ${key}`)
    }

    // Default intake API key for the WordPress plugin (printed once below)
    const existingKey = await sql`SELECT api_key FROM intake_api_keys WHERE name = 'default' LIMIT 1`
    let intakeKey = existingKey[0]?.api_key
    if (!intakeKey) {
      intakeKey = "txl_" + require("crypto").randomBytes(24).toString("hex")
      await sql`INSERT INTO intake_api_keys (name, api_key, site_url) VALUES ('default', ${intakeKey}, ${process.env.WORDPRESS_SITE_URL || null})`
    }

    console.log("\n▶ Step 3/3 — creating admin account")
    // The login form stores phones as 98xxxxxxxxxx (see app/login/page.tsx), so normalise
    // whatever was supplied (09..., +98..., 98...) to that shape.
    const rawPhone = (process.env.ADMIN_PHONE || "09120000000").replace(/\s|-|\+/g, "")
    const phone = rawPhone.startsWith("09") ? `98${rawPhone.slice(1)}` : rawPhone.startsWith("9") && rawPhone.length === 10 ? `98${rawPhone}` : rawPhone
    const password = process.env.ADMIN_PASSWORD || "Taxel@Admin2026"
    const firstName = process.env.ADMIN_FIRST_NAME || "مدیر"
    const lastName = process.env.ADMIN_LAST_NAME || "تاکسل"
    const email = process.env.ADMIN_EMAIL || null
    const hash = await bcrypt.hash(password, 10)

    const existing = await sql`SELECT id FROM users WHERE phone = ${phone}`
    let userId
    if (existing.length) {
      userId = existing[0].id
      await sql`
        UPDATE users SET password_hash = ${hash}, is_admin = TRUE, role = 'admin', email = COALESCE(${email}, email),
          subscription_status = 'active', is_trial_active = TRUE,
          trial_end_date = CURRENT_TIMESTAMP + INTERVAL '3650 days', tokens = 10000000
        WHERE id = ${userId}
      `
      console.log(`  ✓ admin updated (user #${userId})`)
    } else {
      const inserted = await sql`
        INSERT INTO users (phone, first_name, last_name, password_hash, email, is_admin, role, subscription_status,
          is_trial_active, trial_start_date, trial_end_date, tokens)
        VALUES (${phone}, ${firstName}, ${lastName}, ${hash}, ${email}, TRUE, 'admin', 'active', TRUE,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3650 days', 10000000)
        RETURNING id
      `
      userId = inserted[0].id
      console.log(`  ✓ admin created (user #${userId})`)
    }

    // Give the admin the top plan if the plans table is populated
    try {
      const plan = await sql`SELECT id FROM subscription_plans ORDER BY price DESC NULLS LAST LIMIT 1`
      if (plan.length) {
        const has = await sql`SELECT id FROM user_subscriptions WHERE user_id = ${userId} AND is_active = TRUE`
        if (!has.length) {
          await sql`
            INSERT INTO user_subscriptions (user_id, plan_id, is_active, expires_at)
            VALUES (${userId}, ${plan[0].id}, TRUE, CURRENT_TIMESTAMP + INTERVAL '3650 days')
          `
          console.log("  ✓ top subscription plan assigned")
        }
      }
    } catch (e) {
      console.log("  (subscription plan assignment skipped:", e.message, ")")
    }

    await sql`INSERT INTO user_onboarding (user_id, tour_completed, dismissed_checklist) VALUES (${userId}, TRUE, TRUE) ON CONFLICT (user_id) DO NOTHING`

    console.log("\n══════════════════════════════════════════════════════")
    console.log(" Setup complete")
    console.log("  Admin login (platform /login):")
    console.log(`    phone    : ${rawPhone}  (stored as ${phone})`)
    console.log(`    password : ${password}`)
    console.log("  Super-admin panel (/super-admin/login) uses SUPER_ADMIN_PASSWORD from env")
    console.log(`  WordPress plugin API key: ${intakeKey}`)
    console.log("══════════════════════════════════════════════════════\n")
  } finally {
    await sql.end({ timeout: 5 })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
