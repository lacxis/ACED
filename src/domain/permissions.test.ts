import { describe, it, expect } from 'vitest';
import { clocksIn, seesCompanyWide, isReadOnly, canApproveLeaveFor, myReports, roleLabel } from './permissions';
import type { RoleSet } from '@/types';

const emp: RoleSet = { employee: true };
const mgr: RoleSet = { employee: true, manager: true };
const admin: RoleSet = { employee: true, admin: true };
const exec: RoleSet = { executive: true };
const execMgr: RoleSet = { executive: true, manager: true };

describe('clocksIn', () => {
  it('employees, managers and admins clock in', () => {
    expect(clocksIn(emp)).toBe(true);
    expect(clocksIn(mgr)).toBe(true);
    expect(clocksIn(admin)).toBe(true);
  });
  it('executives do not clock in, even if also a manager', () => {
    expect(clocksIn(exec)).toBe(false);
    expect(clocksIn(execMgr)).toBe(false);
  });
});

describe('visibility', () => {
  it('admins and executives see company-wide', () => {
    expect(seesCompanyWide(admin)).toBe(true);
    expect(seesCompanyWide(exec)).toBe(true);
    expect(seesCompanyWide(mgr)).toBe(false);
  });
  it('an executive who is not an admin is read-only', () => {
    expect(isReadOnly(exec)).toBe(true);
    expect(isReadOnly({ executive: true, admin: true })).toBe(false);
  });
});

describe('canApproveLeaveFor', () => {
  it('an admin can approve anyone', () => {
    expect(canApproveLeaveFor({ uid: 'a', roles: admin }, 'someone-else')).toBe(true);
  });
  it('a line manager can approve their own report', () => {
    expect(canApproveLeaveFor({ uid: 'm1', roles: mgr }, 'm1')).toBe(true);
  });
  it('an executive can approve their own report (as line manager)', () => {
    expect(canApproveLeaveFor({ uid: 'e1', roles: exec }, 'e1')).toBe(true);
  });
  it('cannot approve someone who does not report to you', () => {
    expect(canApproveLeaveFor({ uid: 'm1', roles: mgr }, 'm2')).toBe(false);
  });
});

describe('myReports', () => {
  it('returns only direct reports', () => {
    const staff = [
      { uid: 'a', reportingManager: 'boss' },
      { uid: 'b', reportingManager: 'boss' },
      { uid: 'c', reportingManager: 'other' },
    ];
    expect(myReports('boss', staff).map((s) => s.uid)).toEqual(['a', 'b']);
  });
});

describe('roleLabel', () => {
  it('joins multiple roles in a stable order', () => {
    expect(roleLabel(execMgr)).toBe('Executive · Manager');
    expect(roleLabel({})).toBe('Employee');
  });
});
