import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log("Middleware executado para:", request.nextUrl.pathname)

  // Verificar se é uma rota protegida (dashboard)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Verificar se tem token de autenticação nos cookies ou headers
    const authTokenFromCookie = request.cookies.get("authToken")?.value
    const authTokenFromHeader = request.headers.get("authorization")?.replace("Bearer ", "")

    console.log("Verificando autenticação:", {
      path: request.nextUrl.pathname,
      hasCookieToken: !!authTokenFromCookie,
      hasHeaderToken: !!authTokenFromHeader,
    })

    // Se não tiver token em nenhum lugar, redirecionar para login
    if (!authTokenFromCookie && !authTokenFromHeader) {
      console.log("Nenhum token encontrado, redirecionando para login")
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    console.log("Token encontrado, permitindo acesso")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
