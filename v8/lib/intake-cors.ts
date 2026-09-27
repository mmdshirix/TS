import { NextResponse } from "next/server"

// The WordPress plugin calls these endpoints cross-origin from the customer's site.
export const INTAKE_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Taxel-Key",
  "Access-Control-Max-Age": "86400",
}

export function corsJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: INTAKE_CORS_HEADERS })
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: INTAKE_CORS_HEADERS })
}
