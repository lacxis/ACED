import type { Role, RoleSet } from '@/types';

/**
 * Capabilities derive from a SET of roles (a person can hold several) plus the
 * line-manager relationship. These mirror — but never replace — the Firebase
 * Security Rules, which are the real enforcement point.
 *
 * Model:
 *  - Everyone clocks in EXCEPT executives.
 *  - Leave approval = you are the requester's line manager, OR you are an admin.
 *  - Executives get company-wide READ-ONLY visibility; admins get read-write.
 */

export const hasRole = (roles: RoleSet, r: Role) => roles[r] === true;

/** Everyone clocks in unless they are an executive. */
export const clocksIn = (roles: RoleSet) => !roles.executive;

export const isAdmin = (roles: RoleSet) => !!roles.admin;

/** Company-wide visibility: admins (read-write) and executives (read-only). */
export const seesCompanyWide = (roles: RoleSet) => !!roles.admin || !!roles.executive;

/** Read-only means they can see broadly but change nothing at the admin level. */
export const isReadOnly = (roles: RoleSet) => !!roles.executive && !roles.admin;

/** Admin-level configuration: people, settings, roles, holidays. */
export const canConfigure = (roles: RoleSet) => !!roles.admin;

/** Approve a specific leave request: admin can approve anyone; otherwise only
 *  the requester's line manager. */
export function canApproveLeaveFor(
  me: { uid: string; roles: RoleSet },
  requesterReportingManager: string | undefined,
): boolean {
  if (me.roles.admin) return true;
  return !!requesterReportingManager && requesterReportingManager === me.uid;
}

/** Does this person oversee anyone — a line manager, or company-wide? Decides
 *  whether team/register views appear at all. */
export function managesPeople(
  me: { uid: string; roles: RoleSet },
  allReportingManagers: (string | undefined)[],
): boolean {
  if (me.roles.admin || me.roles.executive || me.roles.manager) return true;
  return allReportingManagers.some((m) => m === me.uid);
}

/** The uids that report to me (I am their line manager). */
export function myReports<T extends { uid: string; reportingManager?: string }>(
  meUid: string, staff: T[],
): T[] {
  return staff.filter((s) => s.reportingManager === meUid);
}

/** A readable label for a role set, e.g. "Manager · Executive". */
export function roleLabel(roles: RoleSet): string {
  const order: Role[] = ['admin', 'executive', 'manager', 'employee'];
  const names: Record<Role, string> = { admin: 'Admin', executive: 'Executive', manager: 'Manager', employee: 'Employee' };
  const held = order.filter((r) => roles[r]);
  return held.length ? held.map((r) => names[r]).join(' · ') : 'Employee';
}
