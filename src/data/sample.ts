import type { Employee, AttendanceRecord, LeaveRequest } from '@/types';

/** Fictional sample data for demo mode (VITE_FIREBASE_ENABLED=false).
 *  Real staff data arrives from Firebase once configured. */
export const sampleStaff: Employee[] = [
  { uid: 's9', firstName: 'Bisi', lastName: 'Okonkwo', email: 'b.okonkwo@aced.com', department: 'Executive', position: 'Managing Director', roles: { executive: true, manager: true } },
  { uid: 's1', firstName: 'Amara', lastName: 'Nwosu', email: 'a.nwosu@aced.com', department: 'Project Delivery', position: 'Project Lead', roles: { employee: true, manager: true }, reportingManager: 's9' },
  { uid: 's2', firstName: 'Tunde', lastName: 'Bello', email: 't.bello@aced.com', department: 'Project Delivery', position: 'Senior Consultant', roles: { employee: true }, reportingManager: 's1' },
  { uid: 's3', firstName: 'Chidi', lastName: 'Okafor', email: 'c.okafor@aced.com', department: 'Project Delivery', position: 'Consultant', roles: { employee: true }, reportingManager: 's1' },
  { uid: 's4', firstName: 'Emeka', lastName: 'Udoh', email: 'e.udoh@aced.com', department: 'Project Delivery', position: 'Analyst', roles: { employee: true }, reportingManager: 's1' },
  { uid: 's5', firstName: 'David', lastName: 'Eze', email: 'd.eze@aced.com', department: 'Sales & Business Dev.', position: 'BD Manager', roles: { employee: true }, reportingManager: 's9' },
  { uid: 's6', firstName: 'Fatima', lastName: 'Yusuf', email: 'f.yusuf@aced.com', department: 'Marketing', position: 'Marketing Lead', roles: { employee: true }, reportingManager: 's7' },
  { uid: 's7', firstName: 'Grace', lastName: 'Adeyemi', email: 'g.adeyemi@aced.com', department: 'HR/Admin', position: 'HR Officer', roles: { employee: true, admin: true }, reportingManager: 's9' },
  { uid: 's8', firstName: 'Samuel', lastName: 'Obi', email: 's.obi@aced.com', department: 'Project Delivery', position: 'Consultant', roles: { employee: true }, reportingManager: 's1' },
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

/** A fortnight of history for the demo employee (Emeka, s4). */
export const sampleHistory: { date: string; rec: AttendanceRecord }[] = [
  { date: '2026-11-23', rec: { clockIn: '07:55', clockOut: '17:06', workLocation: 'office', source: 'self' } },
  { date: '2026-11-21', rec: { clockIn: '08:08', clockOut: '16:58', workLocation: 'home', source: 'self' } }, // Fri
  { date: '2026-11-20', rec: { clockIn: '08:22', clockOut: '17:14', workLocation: 'office', source: 'self' } }, // Thu, late
  { date: '2026-11-19', rec: { clockIn: '08:01', clockOut: '17:02', workLocation: 'home', source: 'self' } }, // Wed
  { date: '2026-11-18', rec: { clockIn: '07:59', clockOut: '17:00', workLocation: 'office', source: 'self' } }, // Tue
  { date: '2026-11-17', rec: { clockIn: '08:03', clockOut: '16:49', workLocation: 'office', source: 'self' } }, // Mon
];

export const sampleClients = ['Craneburg Construction', 'Dumez Nigeria', 'Geoplex OFS', 'NRS Nigeria'];
