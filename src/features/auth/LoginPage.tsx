import { useState, type CSSProperties } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { IconArrow } from '@/lib/icons';

export function LoginPage() {
  const { signIn, demo } = useAuth();
  const [email, setEmail] = useState('e.udoh@aced.com');

  return (
    <div className="login-split">
      <div className="login-art" style={{ background: 'linear-gradient(150deg,var(--navy),var(--navy-2))', color: '#fff', padding: '2.6rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>ACED Attendance</div>
        <h1 style={{ fontWeight: 800, fontSize: '2.05rem', lineHeight: 1.14, marginTop: 'auto', maxWidth: '15ch', letterSpacing: '-.02em' }}>
          Attendance, the seamless way.
        </h1>
        <p style={{ color: 'rgba(255,255,255,.74)', fontSize: '.88rem', marginTop: '.7rem', maxWidth: '34ch' }}>
          Office, work-from-home and client-site — recognised accurately, every working day.
        </p>
      </div>
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.6rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); signIn(email); }} style={{ width: '100%', maxWidth: 350 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1.2rem' }}>ACED</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Welcome back</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: '.84rem', margin: '.3rem 0 1.5rem' }}>Sign in to your ACED Attendance account</p>
          <label style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--ink-2)' }}>Email address</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <label style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--ink-2)', marginTop: '.9rem', display: 'block' }}>Password</label>
          <input type="password" defaultValue="demo-mode" style={inputStyle} />
          <div style={{ marginTop: '1rem' }}><Button full>Sign In <IconArrow size={16} /></Button></div>
          {demo && <p className="muted" style={{ fontSize: '.72rem', marginTop: '1rem', textAlign: 'center' }}>
            Demo mode — any email signs you in. Try e.udoh@aced.com (employee), a.nwosu@aced.com (manager), g.adeyemi@aced.com (admin), or b.okonkwo@aced.com (executive — no clock-in).
          </p>}
        </form>
      </div>
    </div>
  );
}
const inputStyle: CSSProperties = {
  width: '100%', padding: '.78rem .85rem', borderRadius: 13, border: '1px solid var(--line)',
  background: 'var(--soft)', fontFamily: 'inherit', fontSize: '.88rem', color: 'var(--ink)', marginTop: '.4rem',
};
