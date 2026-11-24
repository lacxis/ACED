import type { Employee, AttendanceRecord, LeaveRequest } from '@/types';

/** Fictional sample data for demo mode (VITE_FIREBASE_ENABLED=false).
 *  Real staff data arrives from Firebase once configured. */
export const sampleStaff: Employee[] = [
  { uid: 's1', firstName: 'Amara', lastName: 'Nwosu', email: 'a.nwosu@aced.com', department: 'Project Delivery', position: 'Project Lead', role: 'manager' },
  { uid: 's2', firstName: 'Tunde', lastName: 'Bello', email: 't.bello@aced.com', department: 'Project Delivery', position: 'Senior Consultant', role: 'employee' },
  { uid: 's3', firstName: 'Chidi', lastName: 'Okafor', email: 'c.okafor@aced.com', department: 'Project Delivery', position: 'Consultant', role: 'employee' },
  { uid: 's4', firstName: 'Emeka', lastName: 'Udoh', email: 'e.udoh@aced.com', department: 'Project Delivery', position: 'Analyst', role: 'employee' },
  { uid: 's5', firstName: 'David', lastName: 'Eze', email: 'd.eze@aced.com', department: 'Sales & Business Dev.', position: 'BD Manager', role: 'employee' },
  { uid: 's6', firstName: 'Fatima', lastName: 'Yusuf', email: 'f.yusuf@aced.com', department: 'Marketing', position: 'Marketing Lead', role: 'employee' },
  { uid: 's7', firstName: 'Grace', lastName: 'Adeyemi', email: 'g.adeyemi@aced.com', department: 'HR/Admin', position: 'HR Officer', role: 'admin' },
  { uid: 's8', firstName: 'Samuel', lastName: 'Obi', email: 's.obi@aced.com', department: 'Project Delivery', position: 'Consultant', role: 'employee' },
];

export const sampleToday: Record<string, AttendanceRecord> = {
  s1: { clockIn: '08:04', clockOut: null, workLocation: 'office', source: 'self' },
  s2: { clockIn: '08:31', clockOut: null, workLocation: 'office', source: 'self' },
  s3: { clockIn: '08:00', clockOut: null, workLocation: 'client_site', clientRef: { clientId: 'Craneburg', siteLabel: 'Lagos' }, source: 'self' },
  s4: { clockIn: '07:58', clockOut: null, workLocation: 'office', source: 'self' },
  s5: { clockIn: '08:10', clockOut: null, workLocation: 'home', source: 'self' },
};

export const sampleLeave: LeaveRequest[] = [
  { id: 'l1', uid: 's2', type: 'Annual', startDate: '2026-12-04', endDate: '2026-12-05', days: 2, status: 'pending', createdAt: '2026-11-20' },
  { id: 'l2', uid: 's3', type: 'Annual', startDate: '2026-12-15', endDate: '2026-12-19', days: 5, status: 'pending', createdAt: '2026-11-22' },
];

export const sampleBalances: Record<string, Record<string, number>> = {
  s4: { Annual: 15, Sick: 12, Compassionate: 5 },
};
