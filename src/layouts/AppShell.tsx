import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';
import { IconGrid, IconClock, IconLeaf, IconUsers, IconBell } from '@/lib/icons';
import type { Role } from '@/types';

const NAV: Record<Role, { to: string; icon: typeof IconGrid; label: string; short: string }[]> = {
  employee: [
    { to: '/', icon: IconGrid, label: 'Dashboard', short: 'Home' },
    { to: '/attendance', icon: IconClock, label: 'My Attendance', short: 'Clock' },
    { to: '/leave', icon: IconLeaf, label: 'My Leave', short: 'Leave' },
    { to: '/notifications', icon: IconBell, label: 'Notifications', short: 'Alerts' },
  ],
  manager: [
    { to: '/', icon: IconGrid, label: 'Dashboard', short: 'Home' },
    { to: '/attendance', icon: IconClock, label: 'Team Attendance', short: 'Team' },
    { to: '/directory', icon: IconUsers, label: 'Directory', short: 'People' },
    { to: '/leave', icon: IconLeaf, label: 'Leave Requests', short: 'Leave' },
  ],
  admin: [
    { to: '/', icon: IconGrid, label: 'Dashboard', short: 'Home' },
    { to: '/attendance', icon: IconClock, label: 'Attendance', short: 'Clock' },
    { to: '/directory', icon: IconUsers, label: 'Employees', short: 'People' },
    { to: '/leave', icon: IconLeaf, label: 'Leave', short: 'Leave' },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const items = NAV[user.role];
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="app-shell">
      {/* desktop sidebar */}
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
            <small style={{ display: 'block', fontWeight: 500, color: 'var(--ink-3)', fontSize: '.66rem' }}>{user.position}</small>
          </div>
          <button onClick={signOut} title="Sign out" style={{ marginLeft: 'auto', background: 'none', border: 0, color: 'var(--ink-3)', fontSize: '1rem' }}>⎋</button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="mobile-top">
        <span className="m-logo">ACED</span>
        <div className="m-title">Attendance<small>{roleLabel} · {user.department}</small></div>
        <span className="m-bell"><IconBell size={20} /></span>
      </div>

      <main className="main"><div className="main-inner">{children}</div></main>

      {/* mobile bottom nav */}
      <nav className="bottom-nav">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            <it.icon size={21} /><span>{it.short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
