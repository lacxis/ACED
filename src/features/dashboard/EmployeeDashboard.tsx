import { useAuth } from '@/context/AuthContext';
import { Card, Tile } from '@/components/ui';
import { sampleBalances } from '@/data/sample';
import { businessDate } from '@/domain/time';

export function EmployeeDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const bal = sampleBalances[user.uid] ?? { Annual: 15, Sick: 12, Compassionate: 5 };
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Lagos' }).format(new Date());

  return (
    <>
      <div style={{ marginBottom: '1.05rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>Good morning, {user.firstName}</div>
        <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>{today} · Office day · {businessDate()}</div>
      </div>

      <div className="hero">
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>You're clocked in</h2>
          <p style={{ color: 'rgba(255,255,255,.78)', fontSize: '.86rem', marginTop: '.4rem' }}>
            On time today at the office. Have a good one.
          </p>
        </div>
        <div className="hero-clock" style={{ textAlign: 'center', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 20, padding: '1.15rem 1.4rem', marginLeft: 'auto' }}>
          <div style={{ fontSize: '.64rem', fontWeight: 800, letterSpacing: '.1em', color: 'rgba(255,255,255,.7)' }}>TIME ON SITE</div>
          <div className="tnum" style={{ fontSize: '1.9rem', margin: '.15rem 0 .55rem' }}>0:44</div>
          <button style={{ background: '#fff', color: 'var(--navy)', fontWeight: 700, border: 0, borderRadius: 13, padding: '.62rem 1.6rem' }}>Clock Out</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '1.05rem' }}>
        <Tile label="Today" value="Present" sub="Clocked in on time" tint="var(--green)" />
        <Tile label="This week" value="4 / 5" sub="days recorded" tint="var(--orange)" />
        <Tile label="Where" value="Office" sub="Mon · Tue · Thu" tint="var(--blue)" />
      </div>

      <div style={{ marginTop: '1.05rem' }}>
        <Card>
          <div style={{ fontWeight: 800, fontSize: '.96rem', marginBottom: '.9rem' }}>Leave balance</div>
          <div className="grid-3">
            {Object.entries(bal).map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.6rem' }}>{v}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, marginTop: '.2rem' }}>{k}</div>
                <small className="muted">days left</small>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
