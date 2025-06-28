import { verifyAccessToken } from "@/helpers/verify-access-token"
import { NextRequest, NextResponse } from "next/server"

const noAuthRoutes = ["/login", "/forgot-password", "/reset-password"]

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
const FIFTEEN_MINUTES = 15 * 60 * 1000

export default async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (req.nextUrl.pathname === "/logout") {
    return NextResponse.next()
  }

  const verify = await verifyAccessToken(accessToken, refreshToken)

  const isUserTokens =
    verify &&
    typeof verify === "object" &&
    "accessToken" in verify &&
    "refreshToken" in verify

  if (isUserTokens) {
    const response = NextResponse.next()
    response.cookies.set("access_token", verify.accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + FIFTEEN_MINUTES),
      path: "/",
      secure: process.env.NODE_ENV === "production",
    })

    response.cookies.set("refresh_token", verify.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + SEVEN_DAYS),
      path: "/",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  }

  const shouldRedirectToHome =
    noAuthRoutes.includes(req.nextUrl.pathname) &&
    verify &&
    req.method === "GET"

  if (shouldRedirectToHome) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  const shouldRedirectToLogin =
    !noAuthRoutes.includes(req.nextUrl.pathname) &&
    !verify &&
    req.method === "GET"

  if (shouldRedirectToLogin) {
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (images folder in the public directory)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
