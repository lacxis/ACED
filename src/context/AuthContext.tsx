import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut, type User as FbUser,
} from 'firebase/auth';
import type { Employee } from '@/types';
import { auth } from '@/firebase/config';
import { subscribeMe, saveProfile } from '@/services/db';

export type AuthStatus = 'loading' | 'signed_out' | 'no_profile' | 'ready';

interface AuthState {
  user: Employee | null;
  fbUser: { uid: string; email: string | null } | null;
  status: AuthStatus;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  completeProfile: (p: { firstName: string; lastName: string; department: string; position: string }) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);

/** Firebase auth error codes → plain English. */
function friendly(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email': return 'That email address looks wrong.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password': return 'Email or password is incorrect.';
    case 'auth/email-already-in-use': return 'An account with this email already exists — sign in instead.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Wait a moment and try again.';
    case 'auth/network-request-failed': return 'Network problem — check your connection.';
    default: return 'Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [user, setUser] = useState<Employee | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const meUnsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (fb: FbUser | null) => {
      meUnsub.current?.(); meUnsub.current = null;
      if (!fb) { setFbUser(null); setUser(null); setStatus('signed_out'); return; }
      setFbUser({ uid: fb.uid, email: fb.email });
      setStatus('loading');
      meUnsub.current = subscribeMe(fb.uid, (me) => {
        setUser(me);
        setStatus(me ? 'ready' : 'no_profile');
      });
    });
  }, []);

  async function signIn(email: string, password: string) {
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (err) { throw new Error(friendly(err)); }
  }

  async function signUp(firstName: string, lastName: string, email: string, password: string) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await saveProfile(cred.user.uid, {
        firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(),
        department: '', position: '', status: 'active',
      });
    } catch (err) { throw new Error(friendly(err)); }
  }

  async function completeProfile(p: { firstName: string; lastName: string; department: string; position: string }) {
    if (!fbUser) return;
    await saveProfile(fbUser.uid, { ...p, email: fbUser.email ?? '', status: 'active' });
  }

  async function signOut() { await fbSignOut(auth); }

  return (
    <Ctx.Provider value={{ user, fbUser, status, loading: status === 'loading', signIn, signUp, completeProfile, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
