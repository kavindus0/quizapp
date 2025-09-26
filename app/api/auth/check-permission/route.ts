import { NextRequest, NextResponse } from "next/server";
import { Permission } from "@/lib/rbac";
import { requireAuth, hasPermission } from "@/lib/rbac-utils";

// POST /api/auth/check-permission - Check if user has specific permission
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) {
      return NextResponse.json(
        { 
          hasPermission: false, 
          role: null, 
          error: "Not authenticated" 
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { permission } = body;

    if (!permission || !Object.values(Permission).includes(permission)) {
      return NextResponse.json(
        { 
          hasPermission: false, 
          role: authResult.role, 
          error: "Invalid permission" 
        },
        { status: 400 }
      );
    }

    const userHasPermission = await hasPermission(permission, authResult.userId);

    return NextResponse.json({
      hasPermission: userHasPermission,
      role: authResult.role,
      userId: authResult.userId
    });

  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json(
      { 
        hasPermission: false, 
        role: null, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}