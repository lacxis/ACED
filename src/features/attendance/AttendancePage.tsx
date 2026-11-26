import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Tile } from '@/components/ui';
import { ClockCard } from './ClockCard';
import { sampleHistory, sampleStaff, sampleToday } from '@/data/sample';
import { DEFAULT_SETTINGS } from '@/domain/schedule';
import { deriveStatus, STATUS_LABEL } from '@/domain/attendance';
import { fmt12, durationLabel, businessDate } from '@/domain/time';
import { clocksIn, managesPeople, seesCompanyWide, myReports, isReadOnly } from '@/domain/permissions';
import { IconPin, IconHome, IconBrief } from '@/lib/icons';
import type { WorkLocation } from '@/types';

const S = DEFAULT_SETTINGS;

function LocationCell({ loc }: { loc: WorkLocation }) {
  const map = { office: [IconPin, 'Office'], home: [IconHome, 'Work from home'], client_site: [IconBrief, 'Client site'] } as const;
  const [Icon, label] = map[loc];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', color: 'var(--ink-2)', fontWeight: 600, fontSize: '.76rem' }}><Icon size={15} />{label}</span>;
}

function MyHistory() {
  return (
    <Card>
      <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Recent attendance</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead><tr><Th>Date</Th><Th>In</Th><Th>Out</Th><Th>Duration</Th><Th>Where</Th><Th>Status</Th></tr></thead>
          <tbody>
            {sampleHistory.map(({ date, rec }) => {
              const st = deriveStatus(rec, date, S, { dayEnded: true });
              return (
                <tr key={date}>
                  <Td>{new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' }).format(new Date(`${date}T12:00:00Z`))}</Td>
                  <Td mono>{fmt12(rec.clockIn)}</Td><Td mono>{fmt12(rec.clockOut)}</Td>
                  <Td mono>{durationLabel(rec.clockIn, rec.clockOut)}</Td>
                  <Td><LocationCell loc={rec.workLocation} /></Td>
                  <Td><Badge status={st} label={STATUS_LABEL[st]} /></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Register({ meUid, roles }: { meUid: string; roles: import('@/types').RoleSet }) {
  const today = businessDate();
  const companyWide = seesCompanyWide(roles);
  const staff = companyWide ? sampleStaff.filter((s) => clocksIn(s.roles)) : myReports(meUid, sampleStaff);
  const rows = staff.map((s) => {
    const rec = sampleToday[s.uid] ?? null;
    return { s, rec, st: deriveStatus(rec, today, S, { dayEnded: false }) };
  });
  const counts = {
    in: rows.filter((r) => r.rec?.clockIn).length,
    late: rows.filter((r) => r.st === 'late').length,
    remote: rows.filter((r) => r.rec && r.rec.workLocation !== 'office').length,
    out: rows.filter((r) => !r.rec?.clockIn).length,
  };
  return (
    <>
      <div className="grid-4" style={{ margin: '1.05rem 0' }}>
        <Tile label="Clocked in" value={String(counts.in)} sub={`of ${rows.length}`} tint="var(--green)" />
        <Tile label="Late" value={String(counts.late)} sub="after 08:20" tint="var(--amber)" />
        <Tile label="Working remotely" value={String(counts.remote)} sub="home or client" tint="var(--blue)" />
        <Tile label="Not in yet" value={String(counts.out)} sub="no clock-in" tint="var(--red)" />
      </div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.9rem' }}>
          <div style={{ fontWeight: 800, fontSize: '.96rem' }}>{companyWide ? "Today's register" : 'My team today'}</div>
          {isReadOnly(roles) && <span className="muted" style={{ fontSize: '.7rem', fontWeight: 700, background: 'var(--soft)', padding: '.2rem .55rem', borderRadius: 20 }}>Read-only</span>}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead><tr><Th>Employee</Th><Th>Where</Th><Th>Clock in</Th><Th>Status</Th></tr></thead>
            <tbody>
              {rows.map(({ s, rec, st }) => (
                <tr key={s.uid}>
                  <Td><div style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: '.8rem' }}>{s.firstName} {s.lastName}</b><small style={{ color: 'var(--ink-3)', fontSize: '.68rem' }}>{s.position}</small></div></Td>
                  <Td>{rec ? <LocationCell loc={rec.workLocation} /> : <span className="muted">—</span>}</Td>
                  <Td mono>{rec?.clockIn ? fmt12(rec.clockIn) : '—'}</Td>
                  <Td><Badge status={st} label={STATUS_LABEL[st]} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function AttendancePage() {
  const { user } = useAuth();
  if (!user) return null;
  const iClockIn = clocksIn(user.roles);
  const manages = managesPeople({ uid: user.uid, roles: user.roles }, sampleStaff.map((s) => s.reportingManager));

  return (
    <>
      <div style={{ marginBottom: '1.05rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>Attendance</div>
        <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>
          {iClockIn ? 'Clock in and out' : 'Team attendance'}{iClockIn && manages ? ', and keep an eye on your team.' : '.'}
        </div>
      </div>
      {iClockIn && <ClockCard />}
      {iClockIn && !manages && <div style={{ marginTop: '1.05rem' }}><MyHistory /></div>}
      {manages && <Register meUid={user.uid} roles={user.roles} />}
    </>
  );
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', minWidth: 420 };
function Th({ children }: { children: React.ReactNode }) { return <th style={{ textAlign: 'left', fontSize: '.66rem', textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-3)', fontWeight: 800, padding: '.55rem .65rem' }}>{children}</th>; }
function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) { return <td className={mono ? 'tnum' : undefined} style={{ padding: '.68rem .65rem', borderTop: '1px solid var(--line-2)', color: 'var(--ink)', verticalAlign: 'middle' }}>{children}</td>; }
