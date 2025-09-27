"use client";

import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import Link from "next/link";

// Safe Convex client initialization
const getConvexClient = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://wry-goldfinch-589.convex.cloud";
  return new ConvexReactClient(url);
};

const convex = getConvexClient();
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserSync } from "@/components/UserSync";
import "./globals.css";
import "./royal-credit-recoveries.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <header className="rcr-header shadow-lg">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <Link href="/" className="rcr-logo text-2xl">
                    SecureAware
                  </Link>
                  <div className="rcr-tagline hidden sm:block">
                    Security Awareness Platform
                  </div>

                  <SignedIn>
                    <nav className="hidden md:flex items-center space-x-4">
                      <Link
                        href="/dashboard"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/dashboard" ? "active" : ""
                        )}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/policies"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/policies" ? "active" : ""
                        )}
                      >
                        Policies
                      </Link>
                      <Link
                        href="/training"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/training" ? "active" : ""
                        )}
                      >
                        Training
                      </Link>
                      <Link
                        href="/quizzes"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/quizzes" ? "active" : ""
                        )}
                      >
                        Quizzes
                      </Link>
                      {isAdminRoute ? (
                        <Link
                          href="/admin/users"
                          className={cn(
                            "rcr-nav-link",
                            pathname === "/admin/users" ? "active" : ""
                          )}
                        >
                          User Management
                        </Link>
                      ) : (
                        <Link
                          href="/progress-test"
                          className={cn(
                            "rcr-nav-link",
                            pathname === "/progress-test" ? "active" : ""
                          )}
                        >
                          Progress Test
                        </Link>
                      )}
                      <Link
                        href="/certifications"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/certifications" ? "active" : ""
                        )}
                      >
                        Certificates
                      </Link>
                      <Link
                        href="/simulations"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/simulations" ? "active" : ""
                        )}
                      >
                        Simulations
                      </Link>
                      <Link
                        href="/faq"
                        className={cn(
                          "rcr-nav-link",
                          pathname === "/faq" ? "active" : ""
                        )}
                      >
                        FAQ
                      </Link>
                      <Link
                        href="/profile"
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-blue-600",
                          pathname === "/profile" ? "text-blue-600" : "text-gray-600"
                        )}
                      >
                        Profile
                      </Link>
                      {isAdminRoute && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/dashboard" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/policies"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/policies" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Manage Policies
                          </Link>
                          <Link
                            href="/admin/training"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/training" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Manage Training
                          </Link>
                          <Link
                            href="/admin/quizzes"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/quizzes" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Manage Quizzes
                          </Link>
                          <Link
                            href="/admin/simulations"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/simulations" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Manage Simulations
                          </Link>
                          <Link
                            href="/admin/users"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/users" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Manage Users
                          </Link>
                          <Link
                            href="/admin/sample-data"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/sample-data" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Sample Data
                          </Link>
                          <Link
                            href="/admin/reports"
                            className={cn(
                              "text-sm font-medium transition-colors hover:text-blue-600",
                              pathname === "/admin/reports" ? "text-blue-600" : "text-gray-600"
                            )}
                          >
                            Reports
                          </Link>
                        </>
                      )}
                    </nav>
                  </SignedIn>
                </div>

                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/"
                      userProfileProps={{
                        additionalOAuthScopes: {
                          google: ['https://www.googleapis.com/auth/userinfo.email'],
                        },
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </header>
            <UserSync />
            <main className="min-h-screen">{children}</main>

            {/* Royal Credit Recoveries Footer */}
            <footer className="rcr-footer mt-auto">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4">Royal Credit Recoveries (PVT) Ltd</h3>
                    <p className="text-sm mb-4">
                      Professional debt recovery services with a commitment to security, compliance, and
                      excellence in customer data protection.
                    </p>
                    <div className="text-xs text-gray-400">
                      <p>Security Awareness Platform</p>
                      <p>© 2025 Royal Credit Recoveries (PVT) Ltd. All rights reserved.</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                      <li><Link href="/policies" className="hover:text-white transition-colors">Security Policies</Link></li>
                      <li><Link href="/training" className="hover:text-white transition-colors">Training Modules</Link></li>
                      <li><Link href="/quizzes" className="hover:text-white transition-colors">Quizzes</Link></li>
                      <li><Link href="/certifications" className="hover:text-white transition-colors">Certifications</Link></li>
                      <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Support</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="text-gray-400">IT Support:</span>
                        <br />
                        <span>Internal: 2401</span>
                      </li>
                      <li>
                        <span className="text-gray-400">Security Team:</span>
                        <br />
                        <span>Internal: 2402</span>
                      </li>
                      <li>
                        <span className="text-gray-400">Email:</span>
                        <br />
                        <span>security@royalcreditrecoveries.com</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
                  <div className="mb-4 md:mb-0">
                    <span className="text-gray-400">Compliance:</span>
                    <span className="ml-2 text-white">PCI DSS Level 1 | Data Protection Act | ISO 27001</span>
                  </div>
                  <div className="text-gray-400">
                    Last Updated: September 2025
                  </div>
                </div>
              </div>
            </footer>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
