import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/user - Get current user information and JWT token
 * This demonstrates how to access JWT tokens from Clerk on the server-side
 */
export async function GET() {
  try {
    const { getToken, userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user details
    const user = await currentUser();

    // Get the raw JWT token (default session token)
    const token = await getToken();
    
    // Get a custom JWT token with specific template (if you have custom templates)
    // You can create custom JWT templates in your Clerk Dashboard under "JWT Templates"
    let customToken = null;
    try {
      customToken = await getToken({
        template: "convex" // Example: using a template named "convex"
      });
    } catch {
      console.log("Custom template 'convex' not found, using default token");
    }

    // Get token with default options
    const tokenWithClaims = await getToken();

    return NextResponse.json({ 
      success: true,
      user: {
        id: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
        imageUrl: user?.imageUrl,
        createdAt: user?.createdAt,
      },
      tokens: {
        default: token, // This is the main JWT token
        custom: customToken, // Custom template token (if available)
        withClaims: tokenWithClaims, // Token with specific claims
      },
      tokenInfo: {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      }
    });

  } catch (error) {
    console.error("Error in /api/user:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/user - Example of using JWT token in API calls
 */
export async function POST(request: Request) {
  try {
    const { getToken, userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Get JWT token for external API calls or other purposes
    const jwtToken = await getToken();

    if (!jwtToken) {
      return NextResponse.json(
        { error: "Failed to generate JWT token" }, 
        { status: 500 }
      );
    }

    // Example: You could use this JWT token to authenticate with external APIs
    // const externalApiResponse = await fetch('https://external-api.com/data', {
    //   headers: {
    //     'Authorization': `Bearer ${jwtToken}`,
    //     'Content-Type': 'application/json',
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: `Action '${action}' performed successfully`,
      userId,
      tokenAvailable: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}