import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppShell } from '@/layouts/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProfileSetup } from '@/features/auth/ProfileSetup';
import { EmployeeDashboard } from '@/features/dashboard/EmployeeDashboard';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { LeavePage } from '@/features/leave/LeavePage';
import { EmployeeDirectory } from '@/features/admin/EmployeeDirectory';

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>{title}</div>
      <p className="muted" style={{ fontSize: '.85rem', marginTop: '.4rem' }}>
        This screen is next in the build. The Seamless design for it is already approved.
      </p>
    </div>
  );
}

function Shell() {
  const { user, status } = useAuth();
  if (status === 'loading') {
    return <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>Loading…</div>;
  }
  if (status === 'signed_out') return <LoginPage />;
  if (status === 'no_profile' || !user) return <ProfileSetup />;
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/directory" element={<EmployeeDirectory />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/notifications" element={<Placeholder title="Notifications" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter><Shell /></BrowserRouter>
    </AuthProvider>
  );
}
