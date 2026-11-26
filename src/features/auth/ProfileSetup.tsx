import { useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';

export function ProfileSetup() {
  const { fbUser, completeProfile, signOut } = useAuth();
  const [firstName, setFirst] = useState('');
  const [lastName, setLast] = useState('');
  const [department, setDept] = useState('');
  const [position, setPos] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError('Enter your first and last name.'); return; }
    setError(''); setBusy(true);
    try { await completeProfile({ firstName, lastName, department, position }); }
    catch { setError('Could not save your profile. Please try again.'); setBusy(false); }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'var(--bg)' }}>
      <form onSubmit={submit} style={card}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)' }}>ACED</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.35rem', marginTop: '.8rem' }}>Finish setting up</h2>
        <p style={{ color: 'var(--ink-2)', fontSize: '.84rem', margin: '.3rem 0 1.3rem' }}>
          Tell us who you are. Your administrator will assign your roles and line manager.
        </p>
        <div style={{ display: 'flex', gap: '.6rem' }}>
          <div style={{ flex: 1 }}><label style={lbl}>First name</label><input value={firstName} onChange={(e) => setFirst(e.target.value)} style={inp} /></div>
          <div style={{ flex: 1 }}><label style={lbl}>Last name</label><input value={lastName} onChange={(e) => setLast(e.target.value)} style={inp} /></div>
        </div>
        <label style={{ ...lbl, marginTop: '.9rem' }}>Department</label>
        <input value={department} onChange={(e) => setDept(e.target.value)} style={inp} placeholder="e.g. Project Delivery" />
        <label style={{ ...lbl, marginTop: '.9rem' }}>Position</label>
        <input value={position} onChange={(e) => setPos(e.target.value)} style={inp} placeholder="e.g. Consultant" />
        {error && <p style={{ color: 'var(--red)', fontSize: '.78rem', marginTop: '.8rem' }}>{error}</p>}
        <div style={{ marginTop: '1.1rem' }}><Button full disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button></div>
        <p className="muted" style={{ fontSize: '.74rem', marginTop: '1rem', textAlign: 'center' }}>
          Signed in as {fbUser?.email}. <button type="button" onClick={() => signOut()} style={linkBtn}>Sign out</button>
        </p>
      </form>
    </div>
  );
}

const card: CSSProperties = { width: '100%', maxWidth: 400, background: 'var(--card)', borderRadius: 20, padding: '2rem', boxShadow: '0 18px 44px rgba(11,27,77,.12)' };
const lbl: CSSProperties = { fontSize: '.74rem', fontWeight: 700, color: 'var(--ink-2)', display: 'block' };
const inp: CSSProperties = { width: '100%', padding: '.72rem .8rem', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--soft)', fontFamily: 'inherit', fontSize: '.86rem', color: 'var(--ink)', marginTop: '.4rem' };
const linkBtn: CSSProperties = { background: 'none', border: 0, color: 'var(--orange)', fontWeight: 700, cursor: 'pointer', fontSize: '.74rem' };
