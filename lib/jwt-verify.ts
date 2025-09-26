import { verifyToken } from "@clerk/backend";

/**
 * Verify a Clerk JWT token and return the payload
 */
export async function verifyClerkJWT(token: string) {
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    return { success: true, payload };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Extract JWT token from Authorization header or cookies
 */
export function extractToken(request: Request): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookies (if you're storing JWT in cookies)
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(cookie => cookie.split("="))
    );
    return cookies["__session"] || null; // Clerk uses __session by default
  }

  return null;
}

/**
 * Decode JWT token without verification (useful for getting claims client-side)
 */
export function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const payload = JSON.parse(atob(parts[1]));
    return { success: true, payload };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to decode token" 
    };
  }
}