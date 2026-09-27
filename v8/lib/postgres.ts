import postgres from "postgres"

type SqlClient = ReturnType<typeof postgres>

declare global {
  // eslint-disable-next-line no-var
  var talksellSqlClient: SqlClient | undefined
  // eslint-disable-next-line no-var
  var talksellSqlUrl: string | undefined
}

export function getSharedSql(): SqlClient {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  if (!globalThis.talksellSqlClient || globalThis.talksellSqlUrl !== databaseUrl) {
    globalThis.talksellSqlClient = postgres(databaseUrl, {
      max: Number(process.env.POSTGRES_MAX_CONNECTIONS || 3),
      idle_timeout: 20,
      connect_timeout: 10,
    })
    globalThis.talksellSqlUrl = databaseUrl
  }

  return globalThis.talksellSqlClient
}
