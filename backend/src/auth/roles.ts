export type Role = 'ADMIN' | 'USER' | 'VIEWER';

export const roles = ['ADMIN', 'USER', 'VIEWER'] as const;

export function toRole(value: unknown): Role {
  return value === 'ADMIN' || value === 'USER' || value === 'VIEWER' ? value : 'VIEWER';
}
