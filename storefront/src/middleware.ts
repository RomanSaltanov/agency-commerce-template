import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  // Inject x-medusa-locale so backend API calls carry the active locale
  const pathLocale = request.nextUrl.pathname.split("/")[1]
  const locale =
    routing.locales.includes(pathLocale as (typeof routing.locales)[number])
      ? pathLocale
      : routing.defaultLocale

  const res = response ?? NextResponse.next()
  res.headers.set("x-medusa-locale", locale)

  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
