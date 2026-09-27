import { cookies } from "next/headers"

const CART_COOKIE = "cart_session"

export async function getCartSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_COOKIE)?.value || null
}

export async function ensureCartSessionToken(): Promise<string> {
  const existing = await getCartSessionToken()
  if (existing) return existing

  const token = crypto.randomUUID()
  const store = await cookies()
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return token
}
