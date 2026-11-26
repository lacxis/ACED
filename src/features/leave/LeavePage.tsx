import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Tile, Button } from '@/components/ui';
import { DEFAULT_SETTINGS } from '@/domain/schedule';
import { DEFAULT_LEAVE_TYPES, workingDaysBetween, remainingBalance, overlaps } from '@/domain/leave';
import { businessDate } from '@/domain/time';
import { sampleLeave, sampleStaff } from '@/data/sample';
import type { LeaveRequest } from '@/types';

const S = DEFAULT_SETTINGS;
const fmtDate = (d: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' }).format(new Date(`${d}T12:00:00Z`));
const nameOf = (uid: string) => { const s = sampleStaff.find((x) => x.uid === uid); return s ? `${s.firstName} ${s.lastName}` : uid; };

/** Employee: apply, see balances and own requests. */
function MyLeave() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>(
    sampleLeave.filter((r) => r.uid === user!.uid).concat([
      { id: 'own1', uid: user!.uid, type: 'Annual', startDate: '2026-10-06', endDate: '2026-10-07', days: 2, status: 'approved', createdAt: '2026-09-30' },
    ]),
  );
  const [type, setType] = useState('annual');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const days = start && end ? workingDaysBetween(start, end, S) : 0;

  function submit() {
    setError('');
    if (!start || !end) { setError('Pick a start and end date.'); return; }
    if (days < 1) { setError('That range has no working days.'); return; }
    const draft: LeaveRequest = {
      id: `d${Date.now()}`, uid: user!.uid, type: DEFAULT_LEAVE_TYPES.find((t) => t.id === type)!.name,
      startDate: start, endDate: end, days, reason, status: 'pending', createdAt: businessDate(),
    };
    if (overlaps(draft, requests)) { setError('This overlaps leave you already have.'); return; }
    setRequests((r) => [draft, ...r]);
    setStart(''); setEnd(''); setReason('');
  }
  function cancel(id: string) {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)));
  }

  return (
    <>
      <div style={{ marginBottom: '1.05rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>My leave</div>
        <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>Apply for leave and track your balances.</div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.05rem' }}>
        {DEFAULT_LEAVE_TYPES.slice(0, 3).map((t) => (
          <Tile key={t.id} label={t.name} value={String(remainingBalance(t.days, requests, t.id))} sub={`of ${t.days} days left`} tint="var(--orange)" />
        ))}
      </div>

      <div className="row">
        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Apply for leave</div>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
              {DEFAULT_LEAVE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: '.7rem' }}>
            <Field label="From"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={input} /></Field>
            <Field label="To"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={input} /></Field>
          </div>
          <Field label="Reason (optional)">
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason" style={input} />
          </Field>
          {days > 0 && <div style={{ fontSize: '.78rem', color: 'var(--ink-2)', margin: '.2rem 0 .6rem' }}>That's <b>{days}</b> working day{days > 1 ? 's' : ''}.</div>}
          {error && <div style={{ fontSize: '.78rem', color: 'var(--red)', marginBottom: '.6rem' }}>{error}</div>}
          <Button onClick={submit}>Submit request</Button>
        </Card>

        <Card style={{ flex: 1.3 }}>
          <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>My requests</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead><tr><Th>Type</Th><Th>Dates</Th><Th>Days</Th><Th>Status</Th><Th /></tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <Td>{r.type}</Td>
                    <Td>{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</Td>
                    <Td>{r.days}</Td>
                    <Td><Badge status={statusBadge(r.status)} label={cap(r.status)} /></Td>
                    <Td>{r.status === 'pending' && <button onClick={() => cancel(r.id)} style={linkBtn}>Cancel</button>}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/** Manager / admin: review and decide requests. */
function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>(
    sampleLeave.concat([
      { id: 'm3', uid: 's6', type: 'Sick', startDate: '2026-11-24', endDate: '2026-11-24', days: 1, status: 'approved', approvedBy: 'Ada Okoro', createdAt: '2026-11-24' },
    ]),
  );
  function decide(id: string, status: 'approved' | 'rejected') {
    setRequests((r) => r.map((x) => (x.id === id && x.status === 'pending' ? { ...x, status, approvedBy: 'You' } : x)));
  }
  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <>
      <div style={{ marginBottom: '1.05rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>Leave management</div>
        <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>Review requests and keep the team calendar clear.</div>
      </div>
      <div className="grid-4" style={{ marginBottom: '1.05rem' }}>
        <Tile label="Awaiting you" value={String(pending.length)} sub="to review" tint="var(--amber)" />
        <Tile label="Approved" value={String(requests.filter((r) => r.status === 'approved').length)} sub="this period" tint="var(--green)" />
        <Tile label="Rejected" value={String(requests.filter((r) => r.status === 'rejected').length)} sub="this period" tint="var(--red)" />
        <Tile label="Requests" value={String(requests.length)} sub="in total" tint="var(--blue)" />
      </div>
      <Card>
        <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Leave requests</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead><tr><Th>Employee</Th><Th>Type</Th><Th>Dates</Th><Th>Days</Th><Th>Status</Th><Th /></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <Td><b style={{ fontSize: '.8rem' }}>{nameOf(r.uid)}</b></Td>
                  <Td>{r.type}</Td>
                  <Td>{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</Td>
                  <Td>{r.days}</Td>
                  <Td><Badge status={statusBadge(r.status)} label={cap(r.status)} /></Td>
                  <Td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button onClick={() => decide(r.id, 'approved')} style={{ ...pillBtn, background: 'var(--green-t)', color: 'var(--green)' }}>Approve</button>
                        <button onClick={() => decide(r.id, 'rejected')} style={{ ...pillBtn, background: 'var(--red-t)', color: 'var(--red)' }}>Reject</button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function LeavePage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'employee' ? <MyLeave /> : <LeaveManagement />;
}

// helpers
function statusBadge(s: string) { return s === 'approved' ? 'present' : s === 'rejected' ? 'absent' : s === 'cancelled' ? 'non_working' : 'late'; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '.7rem', flex: 1 }}><label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '.3rem' }}>{label}</label>{children}</div>;
}
const input: React.CSSProperties = { width: '100%', padding: '.6rem .7rem', borderRadius: 11, border: '1px solid var(--line)', background: 'var(--soft)', fontFamily: 'inherit', fontSize: '.84rem', color: 'var(--ink)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', minWidth: 360 };
const linkBtn: React.CSSProperties = { background: 'none', border: 0, color: 'var(--red)', fontWeight: 700, fontSize: '.74rem', cursor: 'pointer' };
const pillBtn: React.CSSProperties = { border: 0, borderRadius: 9, padding: '.35rem .7rem', fontWeight: 700, fontSize: '.73rem', cursor: 'pointer' };
function Th({ children }: { children?: React.ReactNode }) { return <th style={{ textAlign: 'left', fontSize: '.66rem', textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-3)', fontWeight: 800, padding: '.55rem .65rem' }}>{children}</th>; }
function Td({ children }: { children?: React.ReactNode }) { return <td style={{ padding: '.68rem .65rem', borderTop: '1px solid var(--line-2)', color: 'var(--ink)', verticalAlign: 'middle' }}>{children}</td>; }
