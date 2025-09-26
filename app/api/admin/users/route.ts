import { NextRequest, NextResponse } from "next/server";
import { UserRole, Permission } from "@/lib/rbac";
import { requirePermission, getAllUsersWithRoles } from "@/lib/rbac-utils";

// GET /api/admin/users - List all users with their roles
export async function GET() {
  try {
    // Check authentication and permission
    const authResult = await requirePermission(Permission.MANAGE_USERS);
    if (!authResult) {
      return NextResponse.json(
        { error: "Unauthorized or insufficient permissions" },
        { status: 401 }
      );
    }

    // Get all users with their roles
    const result = await getAllUsersWithRoles(authResult.userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: result.users,
      total: result.users?.length || 0
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user (if needed)
export async function POST(req: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requirePermission(Permission.MANAGE_USERS);
    if (!authResult) {
      return NextResponse.json(
        { error: "Unauthorized or insufficient permissions" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, firstName, lastName, role = UserRole.STUDENT } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, lastName" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Note: Creating users programmatically requires Clerk's Backend API
    // For now, return a message indicating this feature needs to be implemented
    return NextResponse.json(
      { 
        error: "User creation via API not implemented yet. Users should sign up directly.",
        message: "To create users, direct them to the sign-up page and then assign roles via the role management API."
      },
      { status: 501 }
    );

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}