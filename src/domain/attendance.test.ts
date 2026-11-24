import { describe, it, expect } from 'vitest';
import { deriveStatus } from './attendance';
import { DEFAULT_SETTINGS } from './schedule';
import type { AttendanceRecord } from '@/types';

const S = DEFAULT_SETTINGS;
const rec = (clockIn: string | null, clockOut: string | null = null): AttendanceRecord =>
  ({ clockIn, clockOut, workLocation: 'office', source: 'self' });

describe('deriveStatus', () => {
  it('Monday, on-time clock-in and out -> present', () => {
    expect(deriveStatus(rec('07:58', '17:02'), '2026-11-23', S, { dayEnded: true })).toBe('present');
  });
  it('after the 08:20 threshold -> late', () => {
    expect(deriveStatus(rec('08:31', '17:00'), '2026-11-23', S, { dayEnded: true })).toBe('late');
  });
  it('no record on a working day that has ended -> absent', () => {
    expect(deriveStatus(null, '2026-11-23', S, { dayEnded: true })).toBe('absent');
  });
  it('no record yet, day not ended -> not_started', () => {
    expect(deriveStatus(null, '2026-11-23', S, { dayEnded: false })).toBe('not_started');
  });
  it('late arrival still clocked in (day not ended) -> late', () => {
    expect(deriveStatus(rec('08:31'), '2026-11-23', S, { dayEnded: false })).toBe('late');
  });
  it('clocked in but not out, day ended -> incomplete', () => {
    expect(deriveStatus(rec('08:00'), '2026-11-23', S, { dayEnded: true })).toBe('incomplete');
  });
  it('Saturday -> non_working', () => {
    expect(deriveStatus(null, '2026-11-21', S, { dayEnded: true })).toBe('non_working');
  });
  it('approved leave -> on_leave', () => {
    expect(deriveStatus(null, '2026-11-23', S, { dayEnded: true, onApprovedLeave: true })).toBe('on_leave');
  });
});
