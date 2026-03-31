import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth middleware — only activates when Clerk keys are configured.
// Without keys the site runs in open/demo mode.
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export async function middleware(req: NextRequest) {
  if (!CLERK_KEY) {
    // No auth keys set — pass all requests through
    return NextResponse.next()
  }

  // When Clerk keys are present, dynamically load and run Clerk middleware.
  // This avoids crashing in environments where keys haven't been added yet.
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server')

  const isProtectedRoute = createRouteMatcher([
    '/apply(.*)',
    '/dashboard(.*)',
    '/results(.*)',
    '/pre-approval(.*)',
    '/loan-estimate(.*)',
    '/status(.*)',
    '/settings(.*)',
    '/onboard(.*)',
  ])

  return clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) auth().protect()
  })(req, {} as never)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
