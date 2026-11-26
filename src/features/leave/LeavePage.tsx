import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Tile, Button } from '@/components/ui';
import { DEFAULT_LEAVE_TYPES, workingDaysBetween, remainingBalance, overlaps } from '@/domain/leave';
import { businessDate } from '@/domain/time';
import { canApproveLeaveFor, managesPeople, seesCompanyWide, myReports } from '@/domain/permissions';
import { useStaff, useMyLeaves, useAllLeaves, useLeavesFor, useSettings } from '@/services/hooks';
import * as api from '@/services/db';
import type { Employee, AttendanceSettings } from '@/types';

const fmtDate = (d: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' }).format(new Date(`${d}T12:00:00Z`));

/** Everyone can apply for their own leave. */
function MyLeave({ uid, settings }: { uid: string; settings: AttendanceSettings }) {
  const { leaves, loading } = useMyLeaves(uid);
  const [type, setType] = useState('annual');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const days = start && end ? workingDaysBetween(start, end, settings) : 0;

  async function submit() {
    setError('');
    if (!start || !end) { setError('Pick a start and end date.'); return; }
    if (days < 1) { setError('That range has no working days.'); return; }
    const draft = {
      type: DEFAULT_LEAVE_TYPES.find((t) => t.id === type)!.name,
      startDate: start, endDate: end, days, reason, status: 'pending' as const, createdAt: businessDate(),
    };
    if (overlaps({ ...draft, id: 'new', uid }, leaves)) { setError('This overlaps leave you already have.'); return; }
    setBusy(true);
    try { await api.applyLeave(uid, draft); setStart(''); setEnd(''); setReason(''); }
    catch { setError('Could not submit. Try again.'); }
    finally { setBusy(false); }
  }
  const cancel = (id: string) => api.cancelLeave(uid, id).catch(() => {});

  return (
    <>
      <div className="grid-3" style={{ marginBottom: '1.05rem' }}>
        {DEFAULT_LEAVE_TYPES.slice(0, 3).map((t) => (
          <Tile key={t.id} label={t.name} value={String(remainingBalance(t.days, leaves, t.id))} sub={`of ${t.days} days left`} tint="var(--orange)" />
        ))}
      </div>
      <div className="row">
        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Apply for leave</div>
          <Field label="Type"><select value={type} onChange={(e) => setType(e.target.value)} style={input}>{DEFAULT_LEAVE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
          <div style={{ display: 'flex', gap: '.7rem' }}>
            <Field label="From"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={input} /></Field>
            <Field label="To"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={input} /></Field>
          </div>
          <Field label="Reason (optional)"><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason" style={input} /></Field>
          {days > 0 && <div style={{ fontSize: '.78rem', color: 'var(--ink-2)', margin: '.2rem 0 .6rem' }}>That's <b>{days}</b> working day{days > 1 ? 's' : ''}.</div>}
          {error && <div style={{ fontSize: '.78rem', color: 'var(--red)', marginBottom: '.6rem' }}>{error}</div>}
          <Button onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</Button>
        </Card>
        <Card style={{ flex: 1.3 }}>
          <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>My requests</div>
          {loading ? <div className="muted" style={{ fontSize: '.8rem' }}>Loading…</div>
            : leaves.length === 0 ? <div className="muted" style={{ fontSize: '.8rem' }}>No leave requests yet.</div>
            : (
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead><tr><Th>Type</Th><Th>Dates</Th><Th>Days</Th><Th>Status</Th><Th /></tr></thead>
                <tbody>
                  {leaves.map((r) => (
                    <tr key={r.id}><Td>{r.type}</Td><Td>{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</Td><Td>{r.days}</Td>
                      <Td><Badge status={statusBadge(r.status)} label={cap(r.status)} /></Td>
                      <Td>{r.status === 'pending' && <button onClick={() => cancel(r.id)} style={linkBtn}>Cancel</button>}</Td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

/** Shown to anyone who oversees people. Approve is gated per-request by the
 *  line-manager rule, so an executive only acts on their own reports. */
function ApprovalQueue({ me, staff }: { me: Employee; staff: Employee[] }) {
  const companyWide = seesCompanyWide(me.roles);
  const reports = myReports(me.uid, staff);
  const reportUids = reports.map((s) => s.uid);
  const all = useAllLeaves(companyWide);
  const mine = useLeavesFor(companyWide ? [] : reportUids);
  const requests = companyWide ? all.leaves : mine.leaves;
  const loading = companyWide ? all.loading : mine.loading;

  const staffOf = (uid: string) => staff.find((x) => x.uid === uid);
  const nameOf = (uid: string) => { const s = staffOf(uid); return s ? `${s.firstName} ${s.lastName}` : uid; };
  const myName = `${me.firstName} ${me.lastName}`;

  const decide = (ownerUid: string, id: string, status: 'approved' | 'rejected') =>
    api.decideLeave(ownerUid, id, status, myName).catch(() => {});
  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div style={{ marginTop: '1.4rem' }}>
      <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '.2rem' }}>Approvals</div>
      <div className="muted" style={{ fontSize: '.78rem', marginBottom: '.9rem' }}>
        {companyWide ? 'Requests across the company. You can approve people who report to you.' : 'Requests from your team.'}
      </div>
      <div className="grid-4" style={{ marginBottom: '1.05rem' }}>
        <Tile label="Awaiting" value={String(pending.length)} sub="pending" tint="var(--amber)" />
        <Tile label="Your reports" value={String(reportUids.length)} sub="you approve" tint="var(--blue)" />
        <Tile label="Approved" value={String(requests.filter((r) => r.status === 'approved').length)} sub="shown" tint="var(--green)" />
        <Tile label="Requests" value={String(requests.length)} sub="visible" tint="var(--purple)" />
      </div>
      <Card>
        <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Leave requests</div>
        {loading ? <div className="muted" style={{ fontSize: '.8rem' }}>Loading…</div>
          : requests.length === 0 ? <div className="muted" style={{ fontSize: '.8rem' }}>No requests to review.</div>
          : (
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead><tr><Th>Employee</Th><Th>Type</Th><Th>Dates</Th><Th>Days</Th><Th>Status</Th><Th /></tr></thead>
              <tbody>
                {requests.map((r) => {
                  const canApprove = canApproveLeaveFor(me, staffOf(r.uid)?.reportingManager);
                  return (
                    <tr key={`${r.uid}/${r.id}`}>
                      <Td><b style={{ fontSize: '.8rem' }}>{nameOf(r.uid)}</b></Td>
                      <Td>{r.type}</Td><Td>{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</Td><Td>{r.days}</Td>
                      <Td><Badge status={statusBadge(r.status)} label={cap(r.status)} /></Td>
                      <Td>
                        {r.status === 'pending' && canApprove && (
                          <div style={{ display: 'flex', gap: '.4rem' }}>
                            <button onClick={() => decide(r.uid, r.id, 'approved')} style={{ ...pillBtn, background: 'var(--green-t)', color: 'var(--green)' }}>Approve</button>
                            <button onClick={() => decide(r.uid, r.id, 'rejected')} style={{ ...pillBtn, background: 'var(--red-t)', color: 'var(--red)' }}>Reject</button>
                          </div>
                        )}
                        {r.status === 'pending' && !canApprove && <span className="muted" style={{ fontSize: '.7rem' }}>Not your report</span>}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function LeavePage() {
  const { user } = useAuth();
  const { staff } = useStaff();
  const settings = useSettings();
  if (!user) return null;
  const manages = managesPeople({ uid: user.uid, roles: user.roles }, staff.map((s) => s.reportingManager));
  return (
    <>
      <div style={{ marginBottom: '1.05rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>Leave</div>
        <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>Apply for your own leave{manages ? ", and review your team’s requests." : ' and track your balances.'}</div>
      </div>
      <MyLeave uid={user.uid} settings={settings} />
      {manages && <ApprovalQueue me={user} staff={staff} />}
    </>
  );
}

function statusBadge(s: string) { return s === 'approved' ? 'present' : s === 'rejected' ? 'absent' : s === 'cancelled' ? 'non_working' : 'late'; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div style={{ marginBottom: '.7rem', flex: 1 }}><label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '.3rem' }}>{label}</label>{children}</div>; }
const input: React.CSSProperties = { width: '100%', padding: '.6rem .7rem', borderRadius: 11, border: '1px solid var(--line)', background: 'var(--soft)', fontFamily: 'inherit', fontSize: '.84rem', color: 'var(--ink)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', minWidth: 360 };
const linkBtn: React.CSSProperties = { background: 'none', border: 0, color: 'var(--red)', fontWeight: 700, fontSize: '.74rem', cursor: 'pointer' };
const pillBtn: React.CSSProperties = { border: 0, borderRadius: 9, padding: '.35rem .7rem', fontWeight: 700, fontSize: '.73rem', cursor: 'pointer' };
function Th({ children }: { children?: React.ReactNode }) { return <th style={{ textAlign: 'left', fontSize: '.66rem', textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-3)', fontWeight: 800, padding: '.55rem .65rem' }}>{children}</th>; }
function Td({ children }: { children?: React.ReactNode }) { return <td style={{ padding: '.68rem .65rem', borderTop: '1px solid var(--line-2)', color: 'var(--ink)', verticalAlign: 'middle' }}>{children}</td>; }
