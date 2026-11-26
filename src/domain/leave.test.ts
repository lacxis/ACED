import { describe, it, expect } from 'vitest';
import { workingDaysBetween, remainingBalance, overlaps } from './leave';
import { DEFAULT_SETTINGS } from './schedule';
import type { LeaveRequest } from '@/types';

const S = DEFAULT_SETTINGS;
const req = (p: Partial<LeaveRequest>): LeaveRequest => ({
  id: 'x', uid: 'u1', type: 'Annual', startDate: '2026-12-01', endDate: '2026-12-01',
  days: 1, status: 'pending', createdAt: '2026-11-26', ...p,
});

describe('workingDaysBetween', () => {
  it('a single working day counts as 1', () => {
    expect(workingDaysBetween('2026-12-01', '2026-12-01', S)).toBe(1); // Tue
  });
  it('Mon–Fri is 5 working days', () => {
    expect(workingDaysBetween('2026-11-23', '2026-11-27', S)).toBe(5);
  });
  it('a span over a weekend excludes Sat and Sun', () => {
    expect(workingDaysBetween('2026-11-27', '2026-11-30', S)).toBe(2); // Fri + Mon
  });
  it('excludes a public holiday inside the span', () => {
    expect(workingDaysBetween('2026-12-23', '2026-12-28', S, ['2026-12-25'])).toBe(3); // Wed,Thu,(Fri hol),Mon — 23,24,28
  });
  it('end before start is 0', () => {
    expect(workingDaysBetween('2026-12-05', '2026-12-01', S)).toBe(0);
  });
});

describe('remainingBalance', () => {
  it('subtracts only approved leave of the matching type', () => {
    const rs = [req({ type: 'Annual', days: 3, status: 'approved' }), req({ type: 'Annual', days: 2, status: 'pending' }), req({ type: 'Sick', days: 4, status: 'approved' })];
    expect(remainingBalance(20, rs, 'annual')).toBe(17);
  });
  it('never goes below zero', () => {
    const rs = [req({ type: 'Annual', days: 30, status: 'approved' })];
    expect(remainingBalance(20, rs, 'annual')).toBe(0);
  });
});

describe('overlaps', () => {
  it('flags an overlapping active request', () => {
    const a = req({ id: 'a', startDate: '2026-12-02', endDate: '2026-12-04' });
    const b = req({ id: 'b', startDate: '2026-12-03', endDate: '2026-12-06', status: 'approved' });
    expect(overlaps(a, [b])).toBe(true);
  });
  it('ignores rejected leave', () => {
    const a = req({ id: 'a', startDate: '2026-12-02', endDate: '2026-12-04' });
    const b = req({ id: 'b', startDate: '2026-12-03', endDate: '2026-12-06', status: 'rejected' });
    expect(overlaps(a, [b])).toBe(false);
  });
});
