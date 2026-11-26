import type { Employee, RoleSet, LeaveRequest } from '@/types';

/** Shape stored at usersPublic/{uid}. */
export interface PublicRow {
  firstName: string; lastName: string; email: string;
  phone?: string; department?: string; position?: string;
  reportingManager?: string; status?: string;
}

/** Merge a public profile row + roles map into the app's Employee. Pure. */
export function toEmployee(uid: string, pub: PublicRow, roles: RoleSet): Employee {
  return {
    uid,
    firstName: pub.firstName ?? '',
    lastName: pub.lastName ?? '',
    email: pub.email ?? '',
    phone: pub.phone,
    department: pub.department ?? '',
    position: pub.position ?? '',
    roles: roles ?? {},
    reportingManager: pub.reportingManager,
  };
}

/** Flatten a leaves/{uid} node into LeaveRequest[]. Pure. */
export function toLeaveList(
  uid: string, val: Record<string, Omit<LeaveRequest, 'id' | 'uid'>> | null,
): LeaveRequest[] {
  if (!val) return [];
  return Object.entries(val).map(([id, r]) => ({ ...r, id, uid }));
}

/** Keep only the true role flags; an empty set becomes null (RTDB deletes it). */
export function cleanRoles(roles: RoleSet): RoleSet | null {
  const clean: RoleSet = {};
  (['employee', 'manager', 'admin', 'executive'] as const).forEach((r) => { if (roles[r]) clean[r] = true; });
  return Object.keys(clean).length ? clean : null;
}
