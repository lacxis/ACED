import { useAuth } from '@/context/AuthContext';
import { Card, Tile } from '@/components/ui';
import { businessDate, businessTime, durationLabel, fmt12 } from '@/domain/time';
import { clocksIn, seesCompanyWide } from '@/domain/permissions';
import { deriveStatus, STATUS_LABEL } from '@/domain/attendance';
import { scheduledLocation, isWfhDay, isWorkingDay } from '@/domain/schedule';
import { DEFAULT_LEAVE_TYPES, remainingBalance } from '@/domain/leave';
import { useRecord, useHistory, useMyLeaves, useSettings } from '@/services/hooks';

const LOC_LABEL = { office: 'Office', home: 'Work from home', client_site: 'Client site' } as const;

export function EmployeeDashboard() {
  const { user } = useAuth();
  const settings = useSettings();
  const today = businessDate();
  const { rec } = useRecord(user?.uid ?? '', today);
  const { history } = useHistory(user?.uid ?? '');
  const { leaves } = useMyLeaves(user?.uid ?? '');
  if (!user) return null;

  const iClockIn = clocksIn(user.roles);
  const status = deriveStatus(rec, today, settings, { dayEnded: false });
  const clockedIn = !!rec?.clockIn && !rec?.clockOut;
  const done = !!rec?.clockOut;
  const todayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Lagos' }).format(new Date());

  // Days recorded this week (Mon–today) from history.
  const weekStart = mondayOf(today);
  const workingSoFar = daysBetweenInclusive(weekStart, today).filter((d) => isWorkingDay(d, settings)).length;
  const recordedThisWeek = history.filter((h) => h.date >= weekStart && h.date <= today && h.rec.clockIn).length;

  return (
    <>
      <div style={{ marginBottom: '1.05rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>Good day, {user.firstName}</div>
        <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>
          {todayLabel} · {isWfhDay(today, settings) ? 'Work-from-home day' : isWorkingDay(today, settings) ? 'Office day' : 'Non-working day'}
        </div>
      </div>

      {iClockIn ? (
        <div className="hero">
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>
              {done ? 'Done for today' : clockedIn ? "You're clocked in" : 'Ready to start'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,.78)', fontSize: '.86rem', marginTop: '.4rem' }}>
              {done ? `Worked ${fmt12(rec!.clockIn)} – ${fmt12(rec!.clockOut)}.`
                : clockedIn ? 'Have a good one. Clock out from the Attendance tab when you finish.'
                : 'Head to the Attendance tab to clock in for the day.'}
            </p>
          </div>
          {clockedIn && (
            <div className="hero-clock" style={{ textAlign: 'center', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 20, padding: '1.15rem 1.4rem', marginLeft: 'auto' }}>
              <div style={{ fontSize: '.64rem', fontWeight: 800, letterSpacing: '.1em', color: 'rgba(255,255,255,.7)' }}>TIME ON SITE</div>
              <div className="tnum" style={{ fontSize: '1.9rem', margin: '.15rem 0 .2rem' }}>{durationLabel(rec!.clockIn, businessTime())}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="hero">
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Company overview</h2>
            <p style={{ color: 'rgba(255,255,255,.78)', fontSize: '.86rem', marginTop: '.4rem' }}>
              {seesCompanyWide(user.roles) ? 'Read-only visibility across the organisation. You approve leave for anyone who reports to you.' : 'Welcome back.'}
            </p>
          </div>
        </div>
      )}

      {iClockIn && (
        <div className="grid-3" style={{ marginTop: '1.05rem' }}>
          <Tile label="Today" value={STATUS_LABEL[status]} sub={rec?.clockIn ? `in at ${fmt12(rec.clockIn)}` : 'not clocked in'} tint="var(--green)" />
          <Tile label="This week" value={`${recordedThisWeek} / ${workingSoFar || 0}`} sub="days recorded" tint="var(--orange)" />
          <Tile label="Where today" value={LOC_LABEL[rec?.workLocation ?? scheduledLocation(today, settings)]} sub="per schedule" tint="var(--blue)" />
        </div>
      )}

      <div style={{ marginTop: '1.05rem' }}>
        <Card>
          <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Leave balance</div>
          <div className="grid-3">
            {DEFAULT_LEAVE_TYPES.slice(0, 3).map((t) => (
              <div key={t.id} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.6rem' }}>{remainingBalance(t.days, leaves, t.id)}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, marginTop: '.2rem' }}>{t.name}</div>
                <small className="muted">days left</small>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0 Sun … 6 Sat
  const diff = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}
function daysBetweenInclusive(a: string, b: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${a}T12:00:00Z`); const end = new Date(`${b}T12:00:00Z`);
  while (cur <= end) { out.push(cur.toISOString().slice(0, 10)); cur.setUTCDate(cur.getUTCDate() + 1); }
  return out;
}
