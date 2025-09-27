import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="rcr-heading-primary text-5xl md:text-6xl mb-6 rcr-animate-fade-in">
              SecureAware
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-2xl md:text-3xl font-light text-gray-700 mb-4 rcr-animate-fade-in">
              Security Awareness Platform
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto rcr-animate-fade-in">
              Empowering our team with comprehensive security training, policy management,
              and compliance tools designed specifically for financial services professionals.
            </p>
          </div>

          <SignedOut>
            <div className="rcr-card p-8 mb-12 rcr-animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h2 className="rcr-heading-primary text-2xl mb-4 text-center">
                Secure Access Portal
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Access your personalized security training dashboard with enterprise-grade authentication
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Two-Factor Authentication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Interactive Security Simulations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Compliance Tracking & Reporting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Financial Industry Training</span>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="rcr-alert-success p-8 rounded-xl mb-12 rcr-animate-fade-in">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  Welcome Back to Royal Credit Recoveries Security Platform
                </h2>
                <p className="text-green-700 mb-6 max-w-2xl mx-auto">
                  Continue your security awareness journey. Stay compliant, stay secure, and protect our customers&apos; valuable information.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="rcr-button-primary px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href="/training"
                    className="rcr-button-secondary px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                  >
                    Continue Training
                  </Link>
                  <Link
                    href="/simulations"
                    className="border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Security Simulations
                  </Link>
                </div>
              </div>
            </div>
          </SignedIn>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 rcr-animate-slide-in">
            <div className="rcr-card p-8 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="rcr-heading-secondary text-xl mb-4">Security Policies</h3>
              <p className="text-gray-600">
                Comprehensive policy management tailored for financial services compliance including PCI DSS and data protection requirements.
              </p>
            </div>

            <div className="rcr-card p-8 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="rcr-heading-secondary text-xl mb-4">Interactive Training</h3>
              <p className="text-gray-600">
                Specialized training modules for call center operations, customer data handling, and financial industry security best practices.
              </p>
            </div>

            <div className="rcr-card p-8 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="rcr-heading-secondary text-xl mb-4">Compliance Tracking</h3>
              <p className="text-gray-600">
                Real-time progress monitoring and comprehensive compliance reporting designed for Royal Credit Recoveries&apos; regulatory requirements.
              </p>
            </div>
          </div>

          {/* Platform Overview */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Royal Credit Recoveries Security Platform</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    For Call Center & Data Teams
                  </h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Interactive phishing email simulations
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Social engineering call scenario training
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Customer data protection protocols
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Call recording security procedures
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      PCI DSS compliance training modules
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    For Security Administrators
                  </h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Comprehensive compliance reporting dashboard
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Policy versioning and approval workflows
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Employee certification management
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Training progress analytics and insights
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Automated reminder and notification system
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Section */}
          <div className="mt-20 text-center">
            <h2 className="rcr-heading-primary text-3xl mb-8">Industry-Leading Security Standards</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="rcr-badge-compliance px-6 py-4 rounded-lg text-center">
                <div className="text-2xl font-bold">PCI DSS</div>
                <div className="text-sm">Level 1</div>
              </div>
              <div className="rcr-badge-compliance px-6 py-4 rounded-lg text-center">
                <div className="text-2xl font-bold">ISO</div>
                <div className="text-sm">27001</div>
              </div>
              <div className="rcr-badge-compliance px-6 py-4 rounded-lg text-center">
                <div className="text-2xl font-bold">GDPR</div>
                <div className="text-sm">Compliant</div>
              </div>
              <div className="rcr-badge-compliance px-6 py-4 rounded-lg text-center">
                <div className="text-2xl font-bold">SOC</div>
                <div className="text-sm">Type II</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}