import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../auth/AuthContext';

type Role = 'ADMIN' | 'USER' | 'VIEWER';

const rank: Record<Role, number> = { VIEWER: 1, USER: 2, ADMIN: 3 };

export function canAccess(userRole: string | undefined, required: Role) {
  return !!userRole && rank[userRole as Role] >= rank[required];
}

export function RequireRole({ role, children }: { role: Role; children: ReactElement }) {
  const { user, token, loading } = useAuth();
  if (loading) return <section>Loading...</section>;
  if (!token) return <Navigate to="/login" replace />;
  if (!canAccess(user?.role, role)) return <Navigate to="/dashboard" replace />;
  return children;
}
