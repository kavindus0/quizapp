import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/lib/rcr-rbac";
import { requireAuth } from "@/lib/rcr-rbac-utils";

// POST /api/auth/check-role - Check if user has required role
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) {
      return NextResponse.json(
        { 
          hasAccess: false, 
          role: null, 
          error: "Not authenticated" 
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { allowedRoles } = body;

    if (!allowedRoles || !Array.isArray(allowedRoles)) {
      return NextResponse.json(
        { 
          hasAccess: false, 
          role: authResult.role, 
          error: "Invalid allowed roles array" 
        },
        { status: 400 }
      );
    }

    // Validate all roles are valid
    const validRoles = allowedRoles.every(role => 
      Object.values(UserRole).includes(role)
    );

    if (!validRoles) {
      return NextResponse.json(
        { 
          hasAccess: false, 
          role: authResult.role, 
          error: "Invalid roles provided" 
        },
        { status: 400 }
      );
    }

    const hasAccess = allowedRoles.includes(authResult.role);

    return NextResponse.json({
      hasAccess,
      role: authResult.role,
      userId: authResult.userId,
      allowedRoles
    });

  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json(
      { 
        hasAccess: false, 
        role: null, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}