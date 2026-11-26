import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Employee } from '@/types';
import { FIREBASE_ENABLED, auth } from '@/firebase/config';
import { sampleStaff } from '@/data/sample';

interface AuthState {
  user: Employee | null;
  loading: boolean;
  demo: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
}
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(FIREBASE_ENABLED);

  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) return;
    // In live mode, wire firebase onAuthStateChanged -> load profile from RTDB.
    // Scaffolded here; profile loading lands with the data layer.
    setLoading(false);
  }, []);

  function signIn(email: string) {
    // Demo mode: match a sample employee, default to the analyst.
    const found = sampleStaff.find((s) => s.email === email) ?? sampleStaff.find((s) => s.uid === 's4')!;
    setUser(found);
  }
  function signOut() { setUser(null); }

  return (
    <Ctx.Provider value={{ user, loading, demo: !FIREBASE_ENABLED, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
