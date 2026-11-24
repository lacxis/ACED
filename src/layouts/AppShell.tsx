import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';
import { IconGrid, IconClock, IconLeaf, IconUsers, IconBell } from '@/lib/icons';
import type { Role } from '@/types';

const NAV: Record<Role, { to: string; icon: typeof IconGrid; label: string }[]> = {
  employee: [
    { to: '/', icon: IconGrid, label: 'Dashboard' },
    { to: '/attendance', icon: IconClock, label: 'My Attendance' },
    { to: '/leave', icon: IconLeaf, label: 'My Leave' },
    { to: '/notifications', icon: IconBell, label: 'Notifications' },
  ],
  manager: [
    { to: '/', icon: IconGrid, label: 'Dashboard' },
    { to: '/attendance', icon: IconClock, label: 'Team Attendance' },
    { to: '/directory', icon: IconUsers, label: 'Directory' },
    { to: '/leave', icon: IconLeaf, label: 'Leave Requests' },
  ],
  admin: [
    { to: '/', icon: IconGrid, label: 'Dashboard' },
    { to: '/attendance', icon: IconClock, label: 'Attendance' },
    { to: '/directory', icon: IconUsers, label: 'Employees' },
    { to: '/leave', icon: IconLeaf, label: 'Leave' },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const items = NAV[user.role];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '252px 1fr', minHeight: '100%' }}>
      <aside style={{ background: 'var(--card)', borderRight: '1px solid var(--line)', padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', gap: '.18rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--navy)', padding: '.2rem .4rem 1rem' }}>
          ACED <span style={{ color: 'var(--ink-3)', fontWeight: 500, fontSize: '.6rem', display: 'block' }}>Attendance</span>
        </div>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.68rem .75rem',
            borderRadius: 14, fontSize: '.85rem', fontWeight: 600,
            color: isActive ? '#fff' : 'var(--ink-2)',
            background: isActive ? 'var(--navy)' : 'transparent',
            boxShadow: isActive ? '0 10px 22px rgba(11,27,77,.2)' : 'none',
          })}>
            <it.icon size={20} /><span>{it.label}</span>
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', background: 'var(--soft)', borderRadius: 16, padding: '.7rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <Avatar name={`${user.firstName} ${user.lastName}`} size={28} />
          <div style={{ fontSize: '.78rem', fontWeight: 700, lineHeight: 1.2 }}>
            {user.firstName}
            <small style={{ display: 'block', fontWeight: 500, color: 'var(--ink-3)', fontSize: '.66rem' }}>
              {user.position}
            </small>
          </div>
          <button onClick={signOut} title="Sign out" style={{ marginLeft: 'auto', background: 'none', border: 0, color: 'var(--ink-3)' }}>⎋</button>
        </div>
      </aside>
      <main style={{ minWidth: 0, padding: '1.2rem 1.35rem' }}>{children}</main>
    </div>
  );
}
