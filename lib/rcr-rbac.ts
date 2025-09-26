// Royal Credit Recoveries - Simplified RBAC System
// Focused on financial services security requirements

// Define user roles for Royal Credit Recoveries
export enum UserRole {
  ADMIN = 'admin',       // System administrators and security managers
  EMPLOYEE = 'employee'  // Call center and data handling staff
}

// Define permissions for financial services context
export enum Permission {
  // System Administration (Admin only)
  MANAGE_USERS = 'manage_users',
  MANAGE_SYSTEM = 'manage_system',
  VIEW_ALL_USERS = 'view_all_users',
  ASSIGN_ROLES = 'assign_roles',
  
  // Content Management (Admin only)
  MANAGE_POLICIES = 'manage_policies',
  MANAGE_TRAINING = 'manage_training',
  CREATE_QUIZ = 'create_quiz',
  EDIT_QUIZ = 'edit_quiz',
  DELETE_QUIZ = 'delete_quiz',
  
  // Compliance & Reporting (Admin only)
  VIEW_COMPLIANCE_REPORTS = 'view_compliance_reports',
  EXPORT_DATA = 'export_data',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_CERTIFICATIONS = 'manage_certifications',
  AUDIT_SYSTEM = 'audit_system',
  
  // Security Management (Admin only)
  MANAGE_SECURITY_POLICIES = 'manage_security_policies',
  VIEW_SECURITY_INCIDENTS = 'view_security_incidents',
  MANAGE_2FA_REQUIREMENTS = 'manage_2fa_requirements',
  
  // Employee Access (Both Admin and Employee)
  ACCESS_POLICIES = 'access_policies',
  ACCESS_TRAINING = 'access_training',
  TAKE_QUIZ = 'take_quiz',
  VIEW_OWN_RESULTS = 'view_own_results',
  VIEW_OWN_PROGRESS = 'view_own_progress',
  ACCESS_FAQ = 'access_faq',
  
  // PCI DSS & Financial Compliance (Both roles)
  ACCESS_PCI_TRAINING = 'access_pci_training',
  VIEW_DATA_HANDLING_POLICIES = 'view_data_handling_policies',
  ACCESS_CALL_SECURITY_TRAINING = 'access_call_security_training'
}

// Role-Permission mapping for Royal Credit Recoveries
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All system administration permissions
    Permission.MANAGE_USERS,
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_ALL_USERS,
    Permission.ASSIGN_ROLES,
    
    // Content management
    Permission.MANAGE_POLICIES,
    Permission.MANAGE_TRAINING,
    Permission.CREATE_QUIZ,
    Permission.EDIT_QUIZ,
    Permission.DELETE_QUIZ,
    
    // Compliance and reporting
    Permission.VIEW_COMPLIANCE_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_CERTIFICATIONS,
    Permission.AUDIT_SYSTEM,
    
    // Security management
    Permission.MANAGE_SECURITY_POLICIES,
    Permission.VIEW_SECURITY_INCIDENTS,
    Permission.MANAGE_2FA_REQUIREMENTS,
    
    // Employee permissions (Admins can do everything employees can)
    Permission.ACCESS_POLICIES,
    Permission.ACCESS_TRAINING,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_OWN_PROGRESS,
    Permission.ACCESS_FAQ,
    Permission.ACCESS_PCI_TRAINING,
    Permission.VIEW_DATA_HANDLING_POLICIES,
    Permission.ACCESS_CALL_SECURITY_TRAINING
  ],
  
  [UserRole.EMPLOYEE]: [
    // Basic access for call center and data handling staff
    Permission.ACCESS_POLICIES,
    Permission.ACCESS_TRAINING,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_OWN_PROGRESS,
    Permission.ACCESS_FAQ,
    
    // Financial services specific training
    Permission.ACCESS_PCI_TRAINING,
    Permission.VIEW_DATA_HANDLING_POLICIES,
    Permission.ACCESS_CALL_SECURITY_TRAINING
  ]
};

// Department mapping for Royal Credit Recoveries
export enum Department {
  CALL_CENTER = 'call_center',
  DATA_HANDLING = 'data_handling',
  ADMINISTRATION = 'administration',
  IT_SECURITY = 'it_security',
  MANAGEMENT = 'management'
}

// User interface for Royal Credit Recoveries
export interface RCRUser {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  department: Department;
  employeeId?: string;
  has2FA: boolean;
  lastTrainingDate?: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Training completion requirements for compliance
export interface ComplianceRequirements {
  requiredTraining: string[];
  requiredQuizzes: string[];
  minimumScore: number;
  refreshPeriod: number; // in days
  requires2FA: boolean;
}

// Compliance requirements by role
export const ROLE_COMPLIANCE: Record<UserRole, ComplianceRequirements> = {
  [UserRole.ADMIN]: {
    requiredTraining: [
      'cybersecurity_fundamentals',
      'data_protection_pci',
      'incident_response',
      'security_management',
      'compliance_overview'
    ],
    requiredQuizzes: [
      'admin_security_assessment',
      'pci_dss_quiz',
      'incident_response_quiz'
    ],
    minimumScore: 90,
    refreshPeriod: 90, // 3 months
    requires2FA: true
  },
  [UserRole.EMPLOYEE]: {
    requiredTraining: [
      'cybersecurity_fundamentals',
      'password_security',
      'phishing_awareness',
      'data_protection_basics',
      'call_recording_security'
    ],
    requiredQuizzes: [
      'security_basics_quiz',
      'phishing_quiz',
      'data_handling_quiz'
    ],
    minimumScore: 80,
    refreshPeriod: 180, // 6 months
    requires2FA: true
  }
};

// Route protection for Royal Credit Recoveries
export interface RCRRouteProtection {
  path: string;
  allowedRoles: UserRole[];
  requiresCompliance?: boolean;
  requires2FA?: boolean;
  redirectTo?: string;
}

export const RCR_PROTECTED_ROUTES: RCRRouteProtection[] = [
  {
    path: '/admin',
    allowedRoles: [UserRole.ADMIN],
    requiresCompliance: true,
    requires2FA: true,
    redirectTo: '/dashboard'
  },
  {
    path: '/admin/users',
    allowedRoles: [UserRole.ADMIN],
    requiresCompliance: true,
    requires2FA: true,
    redirectTo: '/dashboard'
  },
  {
    path: '/admin/policies',
    allowedRoles: [UserRole.ADMIN],
    requiresCompliance: true,
    requires2FA: true,
    redirectTo: '/dashboard'
  },
  {
    path: '/admin/training',
    allowedRoles: [UserRole.ADMIN],
    requiresCompliance: true,
    requires2FA: true,
    redirectTo: '/dashboard'
  },
  {
    path: '/admin/reports',
    allowedRoles: [UserRole.ADMIN],
    requiresCompliance: true,
    requires2FA: true,
    redirectTo: '/dashboard'
  },
  {
    path: '/training',
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requiresCompliance: false,
    requires2FA: false,
    redirectTo: '/sign-in'
  },
  {
    path: '/policies',
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requiresCompliance: false,
    requires2FA: false,
    redirectTo: '/sign-in'
  },
  {
    path: '/profile',
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requiresCompliance: false,
    requires2FA: false,
    redirectTo: '/sign-in'
  }
];

// Default settings for new employees
export const DEFAULT_USER_ROLE = UserRole.EMPLOYEE;
export const DEFAULT_DEPARTMENT = Department.CALL_CENTER;

// Helper functions
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.EMPLOYEE:
      return 'Employee';
    default:
      return 'Unknown';
  }
}

export function getDepartmentDisplayName(department: Department): string {
  switch (department) {
    case Department.CALL_CENTER:
      return 'Call Center';
    case Department.DATA_HANDLING:
      return 'Data Handling';
    case Department.ADMINISTRATION:
      return 'Administration';
    case Department.IT_SECURITY:
      return 'IT Security';
    case Department.MANAGEMENT:
      return 'Management';
    default:
      return 'Unknown';
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'red';
    case UserRole.EMPLOYEE:
      return 'blue';
    default:
      return 'gray';
  }
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function getComplianceRequirements(role: UserRole): ComplianceRequirements {
  return ROLE_COMPLIANCE[role];
}

// Security level requirements for different data types
export enum DataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'   // PCI DSS, customer financial data
}

export const DATA_ACCESS_REQUIREMENTS: Record<DataSensitivity, { roles: UserRole[], requires2FA: boolean }> = {
  [DataSensitivity.PUBLIC]: {
    roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requires2FA: false
  },
  [DataSensitivity.INTERNAL]: {
    roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requires2FA: false
  },
  [DataSensitivity.CONFIDENTIAL]: {
    roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requires2FA: true
  },
  [DataSensitivity.RESTRICTED]: {
    roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    requires2FA: true
  }
};