import type { AttendanceRecord, AttendanceSettings, AttendanceStatus } from '@/types';
import { isWorkingDay } from './schedule';

/**
 * Attendance status is DERIVED, never stored — a pure function of the record,
 * the settings and whether the day has ended. This is why it is unit-tested.
 */
export function deriveStatus(
  rec: AttendanceRecord | null,
  dateStr: string,
  settings: AttendanceSettings,
  opts: { dayEnded: boolean; onApprovedLeave?: boolean; holidays?: string[] } = { dayEnded: false },
): AttendanceStatus {
  const holidays = opts.holidays ?? [];
  if (holidays.includes(dateStr)) return 'holiday';
  if (!isWorkingDay(dateStr, settings, holidays)) return 'non_working';
  if (opts.onApprovedLeave) return 'on_leave';
  if (!rec || !rec.clockIn) return opts.dayEnded ? 'absent' : 'not_started';
  if (!rec.clockOut) {
    // clocked in, no clock-out yet
    return opts.dayEnded ? 'incomplete' : 'clocked_in';
  }
  // completed day — on time or late?
  return rec.clockIn <= settings.lateThreshold ? 'present' : 'late';
}

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  not_started: 'Not started', clocked_in: 'Clocked in', present: 'Present',
  late: 'Late', incomplete: 'Incomplete', absent: 'Absent',
  on_leave: 'On leave', holiday: 'Holiday', non_working: 'Non-working day',
};
