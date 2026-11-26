import { describe, it, expect } from 'vitest';
import { toEmployee, toLeaveList, cleanRoles } from './map';

describe('toEmployee', () => {
  it('merges a profile row and roles into an Employee', () => {
    const e = toEmployee('u1', { firstName: 'Ada', lastName: 'Obi', email: 'a@aced.com', department: 'Delivery', position: 'Consultant', reportingManager: 'm1' }, { employee: true, manager: true });
    expect(e.uid).toBe('u1');
    expect(e.roles).toEqual({ employee: true, manager: true });
    expect(e.reportingManager).toBe('m1');
  });
  it('tolerates missing fields and empty roles', () => {
    const e = toEmployee('u2', { firstName: 'Sam', lastName: 'Eze', email: 's@aced.com' }, {});
    expect(e.department).toBe('');
    expect(e.roles).toEqual({});
    expect(e.reportingManager).toBeUndefined();
  });
});

describe('toLeaveList', () => {
  it('flattens a leaves/{uid} node, injecting id and uid', () => {
    const list = toLeaveList('u1', {
      a1: { type: 'Annual', startDate: '2026-12-01', endDate: '2026-12-02', days: 2, status: 'pending', createdAt: '2026-11-20' },
      a2: { type: 'Sick', startDate: '2026-12-10', endDate: '2026-12-10', days: 1, status: 'approved', createdAt: '2026-11-21' },
    });
    expect(list).toHaveLength(2);
    const a1 = list.find((l) => l.id === 'a1')!;
    expect(a1.uid).toBe('u1');
    expect(a1.days).toBe(2);
  });
  it('returns [] for a null node', () => {
    expect(toLeaveList('u1', null)).toEqual([]);
  });
});

describe('cleanRoles', () => {
  it('keeps only true flags', () => {
    expect(cleanRoles({ employee: true, manager: false, admin: true })).toEqual({ employee: true, admin: true });
  });
  it('returns null for an empty set so RTDB deletes the node', () => {
    expect(cleanRoles({})).toBeNull();
    expect(cleanRoles({ manager: false })).toBeNull();
  });
});
