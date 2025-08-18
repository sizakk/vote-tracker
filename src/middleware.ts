import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // 관리자 전용 경로 보호
        if (path.startsWith('/admin')) {
            if (!token?.role || token.role !== 'admin') {
                return NextResponse.redirect(new URL('/', req.url))
            }
        }

        // API 경로 보호 (관리자 전용)
        if (path.startsWith('/api/admin')) {
            if (!token?.role || token.role !== 'admin') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)'
    ]
}
