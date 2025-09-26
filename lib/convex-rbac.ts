import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Get user's role from Convex database (not Clerk metadata)
 */
export async function getUserRoleFromConvex(clerkId: string): Promise<"admin" | "employee"> {
  try {
    const result = await convex.query(api.userRoles.getUserRoleByClerkId, { clerkId });
    return result.role as "admin" | "employee";
  } catch (error) {
    console.error("Error getting user role from Convex:", error);
    return "employee"; // Default to employee on error
  }
}

/**
 * Check if user has admin role in Convex database
 */
export async function isAdminInConvex(clerkId: string): Promise<boolean> {
  try {
    const role = await getUserRoleFromConvex(clerkId);
    return role === "admin";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

/**
 * Server-side role check using Convex database
 */
export async function requireAdminRole(clerkId: string): Promise<boolean> {
  return await isAdminInConvex(clerkId);
}