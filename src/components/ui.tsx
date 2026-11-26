import type { ReactNode, CSSProperties } from 'react';

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const ini = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 3, flexShrink: 0,
      background: 'linear-gradient(135deg,var(--orange),var(--orange-2))', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.4,
    }}>{ini}</div>
  );
}

const BADGE: Record<string, [string, string]> = {
  present: ['var(--green)', 'var(--green-t)'], late: ['var(--amber)', 'var(--amber-t)'],
  absent: ['var(--red)', 'var(--red-t)'], clocked_in: ['var(--blue)', 'var(--blue-t)'],
  on_leave: ['var(--ink-2)', 'var(--soft)'], not_started: ['var(--ink-2)', 'var(--soft)'],
  incomplete: ['var(--amber)', 'var(--amber-t)'], holiday: ['var(--purple)', 'var(--purple-t)'],
  non_working: ['var(--ink-3)', 'var(--soft)'],
};
export function Badge({ status, label }: { status: string; label: string }) {
  const [fg, bg] = BADGE[status] ?? ['var(--ink-2)', 'var(--soft)'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '.4rem', color: fg, background: bg,
      fontSize: '.72rem', fontWeight: 700, padding: '.28rem .64rem', borderRadius: 20,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />{label}
    </span>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 'var(--r)', border: '1px solid var(--line)',
      boxShadow: 'var(--sh)', padding: '1.2rem', ...style,
    }}>{children}</div>
  );
}

export function Tile({ label, value, sub, tint }: { label: string; value: string; sub?: string; tint: string }) {
  return (
    <Card style={{ padding: '1.15rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '.76rem', color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: tint }} />
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.85rem', marginTop: '.5rem', letterSpacing: '-.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '.73rem', marginTop: '.42rem', color: 'var(--ink-3)', fontWeight: 600 }}>{sub}</div>}
    </Card>
  );
}

export function Button({ children, variant = 'primary', onClick, full, disabled, type }: {
  children: ReactNode; variant?: 'primary' | 'ghost'; onClick?: () => void; full?: boolean;
  disabled?: boolean; type?: 'button' | 'submit';
}) {
  const primary = variant === 'primary';
  return (
    <button onClick={onClick} disabled={disabled} type={type} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem',
      fontWeight: 700, fontSize: '.83rem', padding: '.62rem 1.05rem', borderRadius: 13, border: 0,
      width: full ? '100%' : undefined, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.65 : 1,
      background: primary ? 'linear-gradient(135deg,var(--orange),var(--orange-2))' : 'var(--card)',
      color: primary ? '#fff' : 'var(--ink)',
      boxShadow: primary ? '0 7px 16px rgba(240,122,26,.3)' : 'none',
      borderWidth: primary ? 0 : 1, borderStyle: 'solid', borderColor: 'var(--line)',
    }}>{children}</button>
  );
}
