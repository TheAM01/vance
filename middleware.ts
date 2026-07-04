import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')
    const { pathname } = request.nextUrl

    // If session exists and user is on login page, send them to the scheduler
    if (session && pathname === '/login') {
        const schedulerUrl = new URL('/schedule', request.url)
        return NextResponse.redirect(schedulerUrl)
    }

    // Allow static files, home, login, public assets, etc.
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/login') ||
        pathname.startsWith('/api/public/') ||
        pathname.startsWith('/public/') ||
        pathname === '/login' ||
        pathname === '/' ||
        pathname.startsWith('/landing') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    if (!session) {
        // For API requests, return 401 instead of redirecting to login
        if (pathname.startsWith('/api/')) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api/login|_next/static|_next/image|favicon.ico).*)'],
}
