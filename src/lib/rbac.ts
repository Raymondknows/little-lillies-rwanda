/**
 * Role-Based Access Control (RBAC) for Results Management System
 * 
 * Roles:
 * - ADMIN: Full access to all results operations
 * - TEACHER: Can enter scores and view results
 * - PARENT: Read-only access to their child's report card
 * - STUDENT: Read-only access to their report card
 * - VIEWER: Read-only access to all results
 */

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student',
  VIEWER = 'viewer',
}

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canEnterScores: boolean;
  canCalculateGrades: boolean;
  canCalculatePositions: boolean;
  canLockResults: boolean;
  canViewAudit: boolean;
  canExport: boolean;
  canViewAllResults: boolean;
  canViewOwnResults: boolean;
  canConfigureComponents: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canCreate: true,
    canEdit: true,
    canDelete: false, // Never delete, only archive
    canPublish: true,
    canEnterScores: true,
    canCalculateGrades: true,
    canCalculatePositions: true,
    canLockResults: true,
    canViewAudit: true,
    canExport: true,
    canViewAllResults: true,
    canViewOwnResults: true,
    canConfigureComponents: true,
  },
  [UserRole.TEACHER]: {
    canCreate: false,
    canEdit: true, // Can edit scores only
    canDelete: false,
    canPublish: false,
    canEnterScores: true,
    canCalculateGrades: false,
    canCalculatePositions: false,
    canLockResults: false,
    canViewAudit: false,
    canExport: true, // Can download report cards
    canViewAllResults: true,
    canViewOwnResults: true,
    canConfigureComponents: false,
  },
  [UserRole.PARENT]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canPublish: false,
    canEnterScores: false,
    canCalculateGrades: false,
    canCalculatePositions: false,
    canLockResults: false,
    canViewAudit: false,
    canExport: true, // Download child's report card
    canViewAllResults: false,
    canViewOwnResults: true, // Only their child's
    canConfigureComponents: false,
  },
  [UserRole.STUDENT]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canPublish: false,
    canEnterScores: false,
    canCalculateGrades: false,
    canCalculatePositions: false,
    canLockResults: false,
    canViewAudit: false,
    canExport: false,
    canViewAllResults: false,
    canViewOwnResults: true, // Only their own
    canConfigureComponents: false,
  },
  [UserRole.VIEWER]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canPublish: false,
    canEnterScores: false,
    canCalculateGrades: false,
    canCalculatePositions: false,
    canLockResults: false,
    canViewAudit: false,
    canExport: false,
    canViewAllResults: true, // Read-only
    canViewOwnResults: true,
    canConfigureComponents: false,
  },
};

/**
 * Get permissions for a role
 */
export function getPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role] || rolePermissions[UserRole.VIEWER];
}

/**
 * Check if role has permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  const perms = getPermissions(role);
  return perms[permission] === true;
}

/**
 * Check multiple permissions (all must be true)
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: (keyof RolePermissions)[]
): boolean {
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Check multiple permissions (any can be true)
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: (keyof RolePermissions)[]
): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if action is allowed with optional message
 */
export function checkPermission(
  role: UserRole,
  permission: keyof RolePermissions,
  throwError = true
): { allowed: boolean; message: string } {
  const allowed = hasPermission(role, permission);
  const message = allowed
    ? `✓ Allowed: ${permission}`
    : `✗ Denied: You don't have permission to ${permission}`;

  if (!allowed && throwError) {
    throw new Error(message);
  }

  return { allowed, message };
}

/**
 * Frontend utility to get role from local storage
 */
export function getCurrentUserRole(): UserRole {
  if (typeof window === 'undefined') return UserRole.VIEWER;

  const role = localStorage.getItem('userRole');
  return (role as UserRole) || UserRole.VIEWER;
}

/**
 * Frontend utility to check if current user can perform action
 */
export function canPerformAction(permission: keyof RolePermissions): boolean {
  const role = getCurrentUserRole();
  return hasPermission(role, permission);
}

/**
 * Get user-friendly action messages
 */
export const actionMessages: Record<keyof RolePermissions, string> = {
  canCreate: 'Create new assessments',
  canEdit: 'Edit existing data',
  canDelete: 'Delete data',
  canPublish: 'Publish results',
  canEnterScores: 'Enter student scores',
  canCalculateGrades: 'Calculate grades',
  canCalculatePositions: 'Calculate rankings',
  canLockResults: 'Lock results',
  canViewAudit: 'View audit trail',
  canExport: 'Download/export reports',
  canViewAllResults: 'View all results',
  canViewOwnResults: 'View own results',
  canConfigureComponents: 'Configure assessment components',
};

/**
 * Get user-friendly error message for permission denied
 */
export function getPermissionDeniedMessage(
  permission: keyof RolePermissions
): string {
  return `You don't have permission to: ${actionMessages[permission]}`;
}
