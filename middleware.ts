import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "./lib/rcr-rbac";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

// Define protected routes for Royal Credit Recoveries
const roleBasedRoutes = {
  '/admin(.*)': {
    allowedRoles: [UserRole.ADMIN],
    requires2FA: true
  },
  '/admin/users(.*)': {
    allowedRoles: [UserRole.ADMIN],
    requires2FA: true
  },
  '/admin/policies(.*)': {
    allowedRoles: [UserRole.ADMIN],
    requires2FA: true
  },
  '/admin/training(.*)': {
    allowedRoles: [UserRole.ADMIN],
    requires2FA: true
  },
  '/admin/reports(.*)': {
    allowedRoles: [UserRole.ADMIN],
    requires2FA: true
  }
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    // Redirect to sign-in if not authenticated
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for protected routes
  for (const [routePattern, access] of Object.entries(roleBasedRoutes)) {
    const routeRegex = new RegExp(routePattern);
    
    if (routeRegex.test(pathname)) {
      // Get user role from Clerk session claims or metadata
      const userRole = (sessionClaims?.metadata as any)?.role as UserRole || UserRole.EMPLOYEE;
      
      // Check if user has required role
      if (!access.allowedRoles.includes(userRole)) {
        // Redirect to dashboard with error message
        const dashboardUrl = new URL('/dashboard', req.url);
        dashboardUrl.searchParams.set('error', 'insufficient_permissions');
        dashboardUrl.searchParams.set('required_role', access.allowedRoles.join('_or_'));
        return NextResponse.redirect(dashboardUrl);
      }
      
      // Add role information to headers for API routes
      const response = NextResponse.next();
      response.headers.set('x-user-role', userRole);
      response.headers.set('x-user-id', userId);
      return response;
    }
  }

  // For all other authenticated routes, just add user info to headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', userId);
  
  // Get user role from session claims
  const userRole = (sessionClaims?.metadata as any)?.role as UserRole || UserRole.EMPLOYEE;
  response.headers.set('x-user-role', userRole);
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};