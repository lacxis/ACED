import type { AttendanceSettings, WorkLocation } from '@/types';
import { weekday } from './time';

export const DEFAULT_SETTINGS: AttendanceSettings = {
  workStart: '08:00', workEnd: '17:00', lateThreshold: '08:20',
  onsiteDays: [1, 2, 4], wfhDays: [3, 5], workingDays: [1, 2, 3, 4, 5],
  timezone: 'Africa/Lagos',
};

export function isWorkingDay(dateStr: string, s: AttendanceSettings, holidays: string[] = []): boolean {
  if (holidays.includes(dateStr)) return false;
  return s.workingDays.includes(weekday(dateStr));
}
export function isOnsiteDay(dateStr: string, s: AttendanceSettings): boolean {
  return s.onsiteDays.includes(weekday(dateStr));
}
export function isWfhDay(dateStr: string, s: AttendanceSettings): boolean {
  return s.wfhDays.includes(weekday(dateStr));
}
/** The location the schedule proposes for a day — the employee may override to client_site. */
export function scheduledLocation(dateStr: string, s: AttendanceSettings): WorkLocation {
  return isWfhDay(dateStr, s) ? 'home' : 'office';
}
