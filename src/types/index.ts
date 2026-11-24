export type Role = 'admin' | 'manager' | 'employee';
export type WorkLocation = 'office' | 'home' | 'client_site';
export type AttendanceStatus =
  | 'not_started' | 'clocked_in' | 'present' | 'late'
  | 'incomplete' | 'absent' | 'on_leave' | 'holiday' | 'non_working';

export interface UserPublic {
  firstName: string; lastName: string; email: string;
  phone?: string; department: string; position: string;
}
export interface UserPrivate {
  joinDate: string; gender?: string; status: string; reportingManager?: string;
}
export interface Employee extends UserPublic {
  uid: string; role: Role;
}

export interface ClientRef { clientId: string; projectRef?: string; siteLabel?: string; }
export interface AttendanceRecord {
  clockIn: string | null;
  clockOut: string | null;
  workLocation: WorkLocation;
  clientRef?: ClientRef;
  note?: string;
  source: 'self' | 'correction' | 'import';
  locationInferred?: boolean;
  createdAt?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export interface LeaveRequest {
  id: string; uid: string; type: string;
  startDate: string; endDate: string; days: number;
  reason?: string; status: LeaveStatus; approvedBy?: string; createdAt: string;
}

export interface AttendanceSettings {
  workStart: string; workEnd: string; lateThreshold: string;
  onsiteDays: number[]; wfhDays: number[]; workingDays: number[]; timezone: string;
}
