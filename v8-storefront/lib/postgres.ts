import postgres from "postgres"

type SqlClient = ReturnType<typeof postgres>

declare global {
  // eslint-disable-next-line no-var
  var storefrontSqlClient: SqlClient | undefined
  // eslint-disable-next-line no-var
  var storefrontSqlUrl: string | undefined
}

export function getSharedSql(): SqlClient {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  if (!globalThis.storefrontSqlClient || globalThis.storefrontSqlUrl !== databaseUrl) {
    globalThis.storefrontSqlClient = postgres(databaseUrl, {
      max: Number(process.env.POSTGRES_MAX_CONNECTIONS || 3),
      idle_timeout: 20,
      connect_timeout: 10,
    })
    globalThis.storefrontSqlUrl = databaseUrl
  }

  return globalThis.storefrontSqlClient
}
