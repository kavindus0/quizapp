import { NextRequest, NextResponse } from "next/server";
import { verifyClerkJWT, extractToken, decodeJWT } from "@/lib/jwt-verify";

/**
 * POST /api/auth/verify-token
 * Verify a JWT token and return its payload
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" }, 
        { status: 400 }
      );
    }

    // Verify the token using our utility function
    const result = await verifyClerkJWT(token);
    
    if (result.success) {
      return NextResponse.json({ 
        valid: true, 
        userId: result.payload?.sub,
        email: result.payload?.email,
        claims: result.payload,
        issuedAt: new Date((result.payload?.iat || 0) * 1000).toISOString(),
        expiresAt: new Date((result.payload?.exp || 0) * 1000).toISOString(),
      });
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: result.error 
      }, { status: 401 });
    }

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-token
 * Extract and verify token from request headers or cookies
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "No token found in request" }, 
        { status: 401 }
      );
    }

    // First, decode without verification to get basic info
    const decoded = decodeJWT(token);
    
    if (!decoded.success) {
      return NextResponse.json(
        { error: "Invalid token format", details: decoded.error }, 
        { status: 400 }
      );
    }

    // Now verify the token
    const verified = await verifyClerkJWT(token);
    
    if (verified.success) {
      return NextResponse.json({
        valid: true,
        source: "request_headers",
        userId: verified.payload?.sub,
        email: verified.payload?.email,
        tokenInfo: {
          algorithm: decoded.payload?.alg || "unknown",
          type: decoded.payload?.typ || "JWT",
          issuedAt: new Date((decoded.payload?.iat || 0) * 1000).toISOString(),
          expiresAt: new Date((decoded.payload?.exp || 0) * 1000).toISOString(),
        },
        claims: verified.payload,
      });
    } else {
      return NextResponse.json({
        valid: false,
        error: verified.error,
        tokenDecoded: true, // Token structure is valid but verification failed
      }, { status: 401 });
    }

  } catch (error) {
    console.error("Token extraction/verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}