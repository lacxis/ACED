import { useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { IconArrow } from '@/lib/icons';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [firstName, setFirst] = useState('');
  const [lastName, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else {
        if (!firstName.trim() || !lastName.trim()) throw new Error('Enter your first and last name.');
        await signUp(firstName, lastName, email, password);
      }
    } catch (e) { setError((e as Error).message); setBusy(false); }
    // On success, onAuthStateChanged swaps the screen; no need to reset busy.
  }

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
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 350 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1.2rem' }}>ACED</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: '.84rem', margin: '.3rem 0 1.5rem' }}>
            {mode === 'signin' ? 'Sign in to your ACED Attendance account' : 'Use your ACED work email address'}
          </p>

          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: '.6rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>First name</label>
                <input value={firstName} onChange={(e) => setFirst(e.target.value)} style={inputStyle} autoComplete="given-name" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Last name</label>
                <input value={lastName} onChange={(e) => setLast(e.target.value)} style={inputStyle} autoComplete="family-name" />
              </div>
            </div>
          )}

          <label style={{ ...labelStyle, marginTop: mode === 'signup' ? '.9rem' : 0 }}>Email address</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} type="email" autoComplete="email" required />

          <label style={{ ...labelStyle, marginTop: '.9rem' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required />

          {error && <p style={{ color: 'var(--red)', fontSize: '.78rem', marginTop: '.8rem' }}>{error}</p>}

          <div style={{ marginTop: '1rem' }}>
            <Button full disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? <>Sign In <IconArrow size={16} /></> : <>Create account <IconArrow size={16} /></>}
            </Button>
          </div>

          <p className="muted" style={{ fontSize: '.78rem', marginTop: '1.1rem', textAlign: 'center' }}>
            {mode === 'signin' ? "New to ACED Attendance? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              style={{ background: 'none', border: 0, color: 'var(--orange)', fontWeight: 700, cursor: 'pointer', fontSize: '.78rem' }}>
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = { fontSize: '.74rem', fontWeight: 700, color: 'var(--ink-2)', display: 'block' };
const inputStyle: CSSProperties = {
  width: '100%', padding: '.78rem .85rem', borderRadius: 13, border: '1px solid var(--line)',
  background: 'var(--soft)', fontFamily: 'inherit', fontSize: '.88rem', color: 'var(--ink)', marginTop: '.4rem',
};
