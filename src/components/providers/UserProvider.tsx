"use client";

import React, { createContext, useContext } from 'react';
import { UserRole, hasPermission } from '@/lib/middleware/rbac';

interface UserContextType {
  role: UserRole;
  orgId?: string;
  userId?: string;
  hasPermission: (action: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ 
  children, 
  role, 
  orgId,
  userId
}: { 
  children: React.ReactNode; 
  role: UserRole; 
  orgId?: string;
  userId?: string;
}) {
  const value: UserContextType = {
    role,
    orgId,
    userId,
    hasPermission: (action: string) => hasPermission(role, action)
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

/**
 * Component to wrap UI elements that require specific permissions.
 */
export function Can({ I, children, fallback = null }: { I: string, children: React.ReactNode, fallback?: React.ReactNode }) {
  const { hasPermission } = useUser();
  
  if (!hasPermission(I)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
