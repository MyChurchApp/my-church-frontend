import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar se é uma rota protegida (dashboard)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Verificar se tem token de autenticação
    const authToken =
      request.cookies.get("authToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    // Se não tiver token, redirecionar para login
    if (!authToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
