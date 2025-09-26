import { NextResponse } from "next/server";
import { UserRole, Permission, ROLE_PERMISSIONS } from "@/lib/rbac";
import { requirePermission } from "@/lib/rbac-utils";

// GET /api/admin/roles - Get all available roles and their permissions
export async function GET() {
  try {
    // Check authentication and permission
    const authResult = await requirePermission(Permission.VIEW_ALL_USERS);
    if (!authResult) {
      return NextResponse.json(
        { error: "Unauthorized or insufficient permissions" },
        { status: 401 }
      );
    }

    // Return role information
    const roles = Object.values(UserRole).map(role => ({
      role,
      permissions: ROLE_PERMISSIONS[role] || []
    }));

    const permissions = Object.values(Permission);

    return NextResponse.json({
      roles,
      permissions,
      rolePermissions: ROLE_PERMISSIONS
    });

  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}