export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'AUDITOR' | 'PROVEEDOR';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  MANAGER: ['view_audit', 'view_compliance', 'view_documents', 'edit_documents', 'sign_documents', 'view_personnel', 'edit_personnel', 'view_vehicles', 'edit_vehicles', 'view_budgets', 'edit_budgets', 'use_ai'],
  AUDITOR: ['view_audit', 'view_compliance', 'view_documents', 'sign_documents', 'view_personnel', 'view_vehicles', 'use_ai'],
  USER: ['view_documents', 'view_personnel', 'view_vehicles'],
  PROVEEDOR: ['view_own_documents', 'upload_documents', 'view_assignments', 'view_documents']
};

/**
 * Checks if a user has a specific permission.
 */
export function hasPermission(role: UserRole, action: string): boolean {
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes('*') || allowedActions.includes(action);
}
