import { NextRequest, NextResponse } from "next/server";
import { UserRole, Permission } from "@/lib/rbac";
import { requirePermission, assignUserRole, getUserRole } from "@/lib/rbac-utils";

// GET /api/admin/roles/[userId] - Get user's current role
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Check authentication and permission
    const authResult = await requirePermission(Permission.VIEW_ALL_USERS);
    if (!authResult) {
      return NextResponse.json(
        { error: "Unauthorized or insufficient permissions" },
        { status: 401 }
      );
    }

    // Get the target user's role
    const userRole = await getUserRole(userId);

    return NextResponse.json({
      userId,
      role: userRole
    });

  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/roles/[userId] - Update user's role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    
    // Check authentication and permission
    const authResult = await requirePermission(Permission.ASSIGN_ROLES);
    if (!authResult) {
      return NextResponse.json(
        { error: "Unauthorized or insufficient permissions" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { role } = body;

    // Validate role
    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid or missing role" },
        { status: 400 }
      );
    }

    // Can't change your own role
    if (authResult.userId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Get current role for comparison
    const currentRole = await getUserRole(targetUserId);

    // Assign the new role
    const result = await assignUserRole(targetUserId, role, authResult.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to assign role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      previousRole: currentRole,
      newRole: role,
      assignedBy: authResult.userId
    });

  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}