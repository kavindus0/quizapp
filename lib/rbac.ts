// Define user roles in the system
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  HR = 'hr',
  SECURITY_OFFICER = 'security_officer',
  TEACHER = 'teacher', 
  EMPLOYEE = 'employee',
  STUDENT = 'student'
}


export enum Permission {
  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_ALL_USERS = 'view_all_users',
  ASSIGN_ROLES = 'assign_roles',
  VIEW_TEAM_USERS = 'view_team_users',
  
  // Content Management
  CREATE_QUIZ = 'create_quiz',
  EDIT_ANY_QUIZ = 'edit_any_quiz',
  DELETE_ANY_QUIZ = 'delete_any_quiz',
  VIEW_ALL_QUIZZES = 'view_all_quizzes',
  MANAGE_TRAINING = 'manage_training',
  MANAGE_POLICIES = 'manage_policies',
  
  // Learning & Assessment
  TAKE_QUIZ = 'take_quiz',
  VIEW_OWN_RESULTS = 'view_own_results',
  
  // Analytics & Reporting
  VIEW_ALL_RESULTS = 'view_all_results',
  VIEW_TEAM_RESULTS = 'view_team_results',
  VIEW_CLASS_RESULTS = 'view_class_results',
  EXPORT_DATA = 'export_data',
  VIEW_ANALYTICS = 'view_analytics',
  
  // HR & Compliance
  MANAGE_COMPLIANCE = 'manage_compliance',
  VIEW_HR_REPORTS = 'view_hr_reports',
  MANAGE_CERTIFICATIONS = 'manage_certifications',
  
  // Security
  MANAGE_SECURITY_POLICIES = 'manage_security_policies',
  VIEW_SECURITY_INCIDENTS = 'view_security_incidents',
  AUDIT_SYSTEM = 'audit_system',
  
  // System Administration
  MANAGE_SYSTEM = 'manage_system',
  MANAGE_SETTINGS = 'manage_settings'
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full system access
    Permission.MANAGE_USERS,
    Permission.VIEW_ALL_USERS,
    Permission.ASSIGN_ROLES,
    Permission.CREATE_QUIZ,
    Permission.EDIT_ANY_QUIZ,
    Permission.DELETE_ANY_QUIZ,
    Permission.VIEW_ALL_QUIZZES,
    Permission.MANAGE_TRAINING,
    Permission.MANAGE_POLICIES,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_ALL_RESULTS,
    Permission.VIEW_TEAM_RESULTS,
    Permission.VIEW_CLASS_RESULTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_HR_REPORTS,
    Permission.MANAGE_CERTIFICATIONS,
    Permission.MANAGE_SECURITY_POLICIES,
    Permission.VIEW_SECURITY_INCIDENTS,
    Permission.AUDIT_SYSTEM,
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SETTINGS
  ],
  [UserRole.MANAGER]: [
    // Team and content management
    Permission.VIEW_TEAM_USERS,
    Permission.CREATE_QUIZ,
    Permission.EDIT_ANY_QUIZ,
    Permission.VIEW_ALL_QUIZZES,
    Permission.MANAGE_TRAINING,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_TEAM_RESULTS,
    Permission.VIEW_CLASS_RESULTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.HR]: [
    // HR and compliance focus
    Permission.VIEW_ALL_USERS,
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_HR_REPORTS,
    Permission.MANAGE_CERTIFICATIONS,
    Permission.MANAGE_TRAINING,
    Permission.VIEW_ALL_QUIZZES,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_ALL_RESULTS,
    Permission.EXPORT_DATA
  ],
  [UserRole.SECURITY_OFFICER]: [
    // Security and compliance
    Permission.MANAGE_SECURITY_POLICIES,
    Permission.VIEW_SECURITY_INCIDENTS,
    Permission.AUDIT_SYSTEM,
    Permission.MANAGE_POLICIES,
    Permission.VIEW_ALL_QUIZZES,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_ALL_RESULTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.EMPLOYEE]: [
    // Basic employee access
    Permission.VIEW_ALL_QUIZZES,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS
  ],
  [UserRole.TEACHER]: [
    // Quiz creation and class management
    Permission.CREATE_QUIZ,
    Permission.EDIT_ANY_QUIZ,
    Permission.DELETE_ANY_QUIZ,
    Permission.VIEW_ALL_QUIZZES,
    Permission.MANAGE_TRAINING,
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_CLASS_RESULTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.STUDENT]: [
    // Basic quiz taking
    Permission.TAKE_QUIZ,
    Permission.VIEW_OWN_RESULTS
  ]
};

// User interface with role information
export interface UserWithRole {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  assignedAt?: Date;
  assignedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Role assignment request
export interface RoleAssignment {
  userId: string;
  role: UserRole;
  assignedBy: string;
  reason?: string;
}

// Permission check result
export interface PermissionResult {
  hasPermission: boolean;
  role: UserRole;
  requiredPermissions: Permission[];
  userPermissions: Permission[];
  missingPermissions: Permission[];
}

// Route protection configuration
export interface RouteProtection {
  path: string;
  requiredPermissions: Permission[];
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

// Common route protections
export const PROTECTED_ROUTES: RouteProtection[] = [
  {
    path: '/admin',
    requiredPermissions: [Permission.MANAGE_SYSTEM],
    allowedRoles: [UserRole.ADMIN],
    redirectTo: '/dashboard'
  },
  {
    path: '/admin/users',
    requiredPermissions: [Permission.MANAGE_USERS],
    allowedRoles: [UserRole.ADMIN],
    redirectTo: '/dashboard'
  },
  {
    path: '/manager',
    requiredPermissions: [Permission.VIEW_TEAM_USERS],
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
    redirectTo: '/dashboard'
  },
  {
    path: '/hr',
    requiredPermissions: [Permission.VIEW_HR_REPORTS],
    allowedRoles: [UserRole.ADMIN, UserRole.HR],
    redirectTo: '/dashboard'
  },
  {
    path: '/security',
    requiredPermissions: [Permission.MANAGE_SECURITY_POLICIES],
    allowedRoles: [UserRole.ADMIN, UserRole.SECURITY_OFFICER],
    redirectTo: '/dashboard'
  },
  {
    path: '/teacher',
    requiredPermissions: [Permission.CREATE_QUIZ],
    allowedRoles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.MANAGER],
    redirectTo: '/dashboard'
  },
  {
    path: '/quiz/create',
    requiredPermissions: [Permission.CREATE_QUIZ],
    allowedRoles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.MANAGER],
    redirectTo: '/dashboard'
  },
  {
    path: '/analytics',
    requiredPermissions: [Permission.VIEW_ANALYTICS],
    allowedRoles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.MANAGER, UserRole.SECURITY_OFFICER],
    redirectTo: '/dashboard'
  },
  {
    path: '/compliance',
    requiredPermissions: [Permission.MANAGE_COMPLIANCE],
    allowedRoles: [UserRole.ADMIN, UserRole.HR],
    redirectTo: '/dashboard'
  }
];

// Default role for new users
export const DEFAULT_USER_ROLE = UserRole.STUDENT;

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.MANAGER:
      return 'Manager';
    case UserRole.HR:
      return 'HR Specialist';
    case UserRole.SECURITY_OFFICER:
      return 'Security Officer';
    case UserRole.EMPLOYEE:
      return 'Employee';
    case UserRole.TEACHER:
      return 'Teacher';
    case UserRole.STUDENT:
      return 'Student';
    default:
      return 'Unknown';
  }
}

// Helper function to get role color (for UI)
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'red';
    case UserRole.MANAGER:
      return 'purple';
    case UserRole.HR:
      return 'orange';
    case UserRole.SECURITY_OFFICER:
      return 'yellow';
    case UserRole.EMPLOYEE:
      return 'cyan';
    case UserRole.TEACHER:
      return 'blue';
    case UserRole.STUDENT:
      return 'green';
    default:
      return 'gray';
  }
}

// Helper function to check if role is higher than another
export function isHigherRole(role: UserRole, compareRole: UserRole): boolean {
  const hierarchy = {
    [UserRole.ADMIN]: 7,
    [UserRole.MANAGER]: 6,
    [UserRole.HR]: 5,
    [UserRole.SECURITY_OFFICER]: 4,
    [UserRole.TEACHER]: 3,
    [UserRole.EMPLOYEE]: 2,
    [UserRole.STUDENT]: 1
  };
  
  return hierarchy[role] > hierarchy[compareRole];
}