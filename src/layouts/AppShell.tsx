import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';
import { IconGrid, IconClock, IconLeaf, IconUsers, IconBell } from '@/lib/icons';
import { clocksIn, managesPeople, seesCompanyWide, roleLabel } from '@/domain/permissions';
import { sampleStaff } from '@/data/sample';

interface Item { to: string; icon: typeof IconGrid; label: string; short: string; }

/** Nav is built from the person's combined capabilities, not a single role. */
function navFor(roles: Parameters<typeof clocksIn>[0], uid: string): Item[] {
  const items: Item[] = [{ to: '/', icon: IconGrid, label: 'Dashboard', short: 'Home' }];
  const manages = managesPeople({ uid, roles }, sampleStaff.map((s) => s.reportingManager));
  // Attendance: a label that fits — your own clock-in, and/or a register you oversee
  if (clocksIn(roles) || manages) {
    items.push({ to: '/attendance', icon: IconClock, label: manages ? 'Attendance' : 'My Attendance', short: 'Clock' });
  }
  if (manages || seesCompanyWide(roles)) {
    items.push({ to: '/directory', icon: IconUsers, label: 'Directory', short: 'People' });
  }
  items.push({ to: '/leave', icon: IconLeaf, label: 'Leave', short: 'Leave' });
  items.push({ to: '/notifications', icon: IconBell, label: 'Notifications', short: 'Alerts' });
  return items;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const items = navFor(user.roles, user.uid);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">ACED <small>Attendance</small></div>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <it.icon size={20} /><span>{it.label}</span>
          </NavLink>
        ))}
        <div className="user">
          <Avatar name={`${user.firstName} ${user.lastName}`} size={28} />
          <div style={{ fontSize: '.78rem', fontWeight: 700, lineHeight: 1.2 }}>
            {user.firstName}
            <small style={{ display: 'block', fontWeight: 500, color: 'var(--ink-3)', fontSize: '.66rem' }}>{roleLabel(user.roles)}</small>
          </div>
          <button onClick={signOut} title="Sign out" style={{ marginLeft: 'auto', background: 'none', border: 0, color: 'var(--ink-3)', fontSize: '1rem' }}>⎋</button>
        </div>
      </aside>

      <div className="mobile-top">
        <span className="m-logo">ACED</span>
        <div className="m-title">Attendance<small>{roleLabel(user.roles)} · {user.department}</small></div>
        <span className="m-bell"><IconBell size={20} /></span>
      </div>

      <main className="main"><div className="main-inner">{children}</div></main>

      <nav className="bottom-nav">
        {items.slice(0, 5).map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            <it.icon size={21} /><span>{it.short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
