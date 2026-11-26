import { useEffect, useState, useCallback } from 'react';
import type { Employee, AttendanceRecord, LeaveRequest, AttendanceSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/domain/schedule';
import * as api from './db';

export function useStaff() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => api.subscribeStaff((s) => { setStaff(s); setLoading(false); }), []);
  return { staff, loading };
}

export function useRecord(uid: string, date: string) {
  const [rec, setRec] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => api.subscribeRecord(uid, date, (r) => { setRec(r); setLoading(false); }), [uid, date]);
  return { rec, loading };
}

export function useHistory(uid: string) {
  const [history, setHistory] = useState<{ date: string; rec: AttendanceRecord }[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    api.getHistory(uid).then((h) => { setHistory(h); setLoading(false); });
  }, [uid]);
  useEffect(() => { reload(); }, [reload]);
  return { history, loading, reload };
}

export function useTodayFor(uids: string[], date: string) {
  const key = uids.join(',');
  const [map, setMap] = useState<Record<string, AttendanceRecord | null>>({});
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    if (!uids.length) { setMap({}); setLoading(false); return; }
    setLoading(true);
    api.getTodayFor(uids, date).then((m) => { setMap(m); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, date]);
  useEffect(() => { reload(); }, [reload]);
  return { map, loading, reload };
}

export function useMyLeaves(uid: string) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => api.subscribeMyLeaves(uid, (l) => { setLeaves(l); setLoading(false); }), [uid]);
  return { leaves, loading };
}

export function useAllLeaves(enabled: boolean) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) { setLeaves([]); setLoading(false); return; }
    return api.subscribeAllLeaves((l) => { setLeaves(l); setLoading(false); });
  }, [enabled]);
  return { leaves, loading };
}

export function useLeavesFor(uids: string[]) {
  const key = uids.join(',');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!uids.length) { setLeaves([]); setLoading(false); return; }
    return api.subscribeLeavesFor(uids, (l) => { setLeaves(l); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { leaves, loading };
}

export function useSettings(): AttendanceSettings {
  const [settings, setSettings] = useState<AttendanceSettings>(DEFAULT_SETTINGS);
  useEffect(() => api.subscribeSettings((s) => { if (s) setSettings({ ...DEFAULT_SETTINGS, ...s }); }), []);
  return settings;
}
