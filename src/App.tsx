import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppShell } from '@/layouts/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { EmployeeDashboard } from '@/features/dashboard/EmployeeDashboard';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { LeavePage } from '@/features/leave/LeavePage';

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
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading…</div>;
  if (!user) return <LoginPage />;
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/directory" element={<Placeholder title="Directory" />} />
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
