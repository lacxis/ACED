import type { AttendanceSettings, LeaveRequest } from '@/types';
import { isWorkingDay } from './schedule';

/** Leave types and their default annual entitlements (configurable in settings). */
export interface LeaveType { id: string; name: string; days: number; }
export const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  { id: 'annual', name: 'Annual', days: 20 },
  { id: 'sick', name: 'Sick', days: 12 },
  { id: 'compassionate', name: 'Compassionate', days: 5 },
  { id: 'maternity', name: 'Maternity', days: 90 },
  { id: 'paternity', name: 'Paternity', days: 14 },
];

/**
 * Number of working days covered by a leave request, inclusive of both ends,
 * excluding weekends and public holidays. Pure and unit-tested — the leave
 * balance arithmetic depends on it, so it must not drift.
 */
export function workingDaysBetween(
  startDate: string, endDate: string, settings: AttendanceSettings, holidays: string[] = [],
): number {
  if (endDate < startDate) return 0;
  let count = 0;
  const cur = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    if (isWorkingDay(iso, settings, holidays)) count += 1;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/** Remaining balance for a type = entitlement minus days used by approved leave. */
export function remainingBalance(
  entitlement: number, requests: LeaveRequest[], typeId: string,
): number {
  const used = requests
    .filter((r) => r.type.toLowerCase() === typeId.toLowerCase() && r.status === 'approved')
    .reduce((sum, r) => sum + r.days, 0);
  return Math.max(0, entitlement - used);
}

/** Does a new request overlap any existing non-rejected leave for the same person? */
export function overlaps(a: LeaveRequest, others: LeaveRequest[]): boolean {
  return others.some(
    (b) => b.id !== a.id && b.uid === a.uid && b.status !== 'rejected' && b.status !== 'cancelled'
      && a.startDate <= b.endDate && b.startDate <= a.endDate,
  );
}
