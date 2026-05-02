import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { UserRole, ROLE_PERMISSIONS, hasPermission } from './rbac-shared';

export type { UserRole };

export interface RBACConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Middleware-like function to check user roles in Server Components.
 */
export async function checkRole(allowedRoles: UserRole[], redirectTo: string = '/dashboard') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = (profile?.role as string).toUpperCase() as UserRole || 'USER';

  if (!allowedRoles.includes(userRole)) {
    redirect(redirectTo);
  }

  return { user, userRole, profile };
}

/**
 * Checks if the current user has a specific permission (Server Side).
 */
export async function hasPermissionServer(action: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = (profile?.role as UserRole) || 'viewer';
  return hasPermission(userRole, action);
}
