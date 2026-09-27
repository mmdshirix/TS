import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CORS headers to all responses
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // For widget-related paths, completely remove frame restrictions
  if (
    request.nextUrl.pathname.startsWith("/widget/") ||
    request.nextUrl.pathname.includes("widget-loader.js") ||
    request.nextUrl.pathname.startsWith("/api/chatbots/")
  ) {
    response.headers.delete("X-Frame-Options")
    response.headers.set("Content-Security-Policy", "frame-ancestors *")
  }

  // Full subscription check happens in the pages themselves
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/api/:path*", "/widget/:path*", "/widget-loader.js", "/dashboard/:path*"],
}
