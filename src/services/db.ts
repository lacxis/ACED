import {
  ref, onValue, get, set, update, push, child, serverTimestamp,
  type Database,
} from 'firebase/database';
import { db } from '@/firebase/config';
import type {
  Employee, RoleSet, AttendanceRecord, WorkLocation, LeaveRequest, LeaveStatus,
  AttendanceSettings,
} from '@/types';
import { toEmployee, toLeaveList, cleanRoles, type PublicRow } from './map';

/** One place that knows the RTDB tree, so paths never drift across the app. */
export const P = {
  usersPublic: () => 'usersPublic',
  userPublic: (uid: string) => `usersPublic/${uid}`,
  roles: () => 'roles',
  roleOf: (uid: string) => `roles/${uid}`,
  records: (uid: string) => `records/${uid}`,
  record: (uid: string, date: string) => `records/${uid}/${date}`,
  leavesOf: (uid: string) => `leaves/${uid}`,
  leaves: () => 'leaves',
  leave: (uid: string, id: string) => `leaves/${uid}/${id}`,
  settingsAttendance: () => 'settings/attendance',
  audit: () => 'audit',
};

type Unsub = () => void;
const database: Database = db;

// ---------- Staff (usersPublic + roles, merged into Employee) ----------

/** Live list of all staff, assembled from usersPublic + roles. */
export function subscribeStaff(cb: (staff: Employee[]) => void): Unsub {
  let pub: Record<string, PublicRow> = {};
  let roles: Record<string, RoleSet> = {};
  let havePub = false;
  const emit = () => {
    if (!havePub) return;
    const list = Object.keys(pub).map((uid) => toEmployee(uid, pub[uid], roles[uid] ?? {}));
    list.sort((a, b) => a.firstName.localeCompare(b.firstName));
    cb(list);
  };
  const u1 = onValue(ref(database, P.usersPublic()), (s) => { pub = s.val() ?? {}; havePub = true; emit(); });
  const u2 = onValue(ref(database, P.roles()), (s) => { roles = s.val() ?? {}; emit(); });
  return () => { u1(); u2(); };
}

/** The signed-in person's own Employee record (profile + roles), live. */
export function subscribeMe(uid: string, cb: (me: Employee | null) => void): Unsub {
  let pub: PublicRow | null = null;
  let roles: RoleSet = {};
  let havePub = false;
  const emit = () => {
    if (!havePub) return;
    cb(pub ? toEmployee(uid, pub, roles) : null);
  };
  const u1 = onValue(ref(database, P.userPublic(uid)), (s) => { pub = s.val(); havePub = true; emit(); });
  const u2 = onValue(ref(database, P.roleOf(uid)), (s) => { roles = s.val() ?? {}; emit(); });
  return () => { u1(); u2(); };
}

// ---------- Attendance records ----------

export function subscribeRecord(uid: string, date: string, cb: (rec: AttendanceRecord | null) => void): Unsub {
  return onValue(ref(database, P.record(uid, date)), (s) => cb(s.val()));
}

/** All of a person's records, newest first (for their history view). */
export async function getHistory(uid: string): Promise<{ date: string; rec: AttendanceRecord }[]> {
  const s = await get(ref(database, P.records(uid)));
  const val: Record<string, AttendanceRecord> = s.val() ?? {};
  return Object.entries(val)
    .map(([date, rec]) => ({ date, rec }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Today's record for a set of people (register view). One read each — fine for a small company. */
export async function getTodayFor(uids: string[], date: string): Promise<Record<string, AttendanceRecord | null>> {
  const out: Record<string, AttendanceRecord | null> = {};
  await Promise.all(uids.map(async (uid) => {
    const s = await get(ref(database, P.record(uid, date)));
    out[uid] = s.val();
  }));
  return out;
}

export async function clockIn(
  uid: string, date: string, time: string,
  location: WorkLocation, clientId?: string,
): Promise<void> {
  const rec: AttendanceRecord = {
    clockIn: time, clockOut: null, workLocation: location,
    source: 'self',
    ...(location === 'client_site' && clientId ? { clientRef: { clientId } } : {}),
    createdAt: new Date().toISOString(),
  };
  await set(ref(database, P.record(uid, date)), rec);
}

export async function clockOut(uid: string, date: string, time: string): Promise<void> {
  await update(ref(database, P.record(uid, date)), { clockOut: time });
}

// ---------- Leave ----------

export function subscribeMyLeaves(uid: string, cb: (reqs: LeaveRequest[]) => void): Unsub {
  return onValue(ref(database, P.leavesOf(uid)), (s) => cb(toLeaveList(uid, s.val())));
}

/** Company-wide leave (admin / executive). Flattens leaves/{uid}/{id}. */
export function subscribeAllLeaves(cb: (reqs: LeaveRequest[]) => void): Unsub {
  return onValue(ref(database, P.leaves()), (s) => {
    const byUser: Record<string, Record<string, Omit<LeaveRequest, 'id' | 'uid'>>> = s.val() ?? {};
    const all: LeaveRequest[] = [];
    for (const uid of Object.keys(byUser)) all.push(...toLeaveList(uid, byUser[uid]));
    all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    cb(all);
  });
}

/** Leave for a specific set of people (a line manager's reports). */
export function subscribeLeavesFor(uids: string[], cb: (reqs: LeaveRequest[]) => void): Unsub {
  const buckets: Record<string, LeaveRequest[]> = {};
  const emit = () => {
    const all = Object.values(buckets).flat();
    all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    cb(all);
  };
  const unsubs = uids.map((uid) =>
    onValue(ref(database, P.leavesOf(uid)), (s) => { buckets[uid] = toLeaveList(uid, s.val()); emit(); }),
  );
  return () => unsubs.forEach((u) => u());
}

export async function applyLeave(uid: string, draft: Omit<LeaveRequest, 'id' | 'uid'>): Promise<string> {
  const node = push(child(ref(database), P.leavesOf(uid)));
  await set(node, draft);
  return node.key!;
}

export async function cancelLeave(uid: string, id: string): Promise<void> {
  await update(ref(database, P.leave(uid, id)), { status: 'cancelled' as LeaveStatus });
}

export async function decideLeave(
  ownerUid: string, id: string, status: 'approved' | 'rejected', approvedBy: string,
): Promise<void> {
  await update(ref(database, P.leave(ownerUid, id)), { status, approvedBy });
}

// ---------- Admin: profile + roles ----------

export async function saveProfile(uid: string, pub: Partial<PublicRow>): Promise<void> {
  await update(ref(database, P.userPublic(uid)), pub);
}

export async function setRoles(uid: string, roles: RoleSet): Promise<void> {
  // Store only the true flags; RTDB treats an empty object as deletion.
  await set(ref(database, P.roleOf(uid)), cleanRoles(roles));
}

// ---------- Settings ----------

export function subscribeSettings(cb: (s: AttendanceSettings | null) => void): Unsub {
  return onValue(ref(database, P.settingsAttendance()), (snap) => cb(snap.val()));
}

// ---------- Audit (append-only) ----------

export async function audit(actor: string, action: string, detail?: Record<string, unknown>): Promise<void> {
  const node = push(child(ref(database), P.audit()));
  await set(node, { actor, action, at: serverTimestamp(), ...(detail ? { detail } : {}) });
}
