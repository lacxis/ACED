import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Button } from '@/components/ui';
import { canConfigure, roleLabel, seesCompanyWide, myReports } from '@/domain/permissions';
import { sampleStaff } from '@/data/sample';
import { IconUsers, IconPlus, IconSearch } from '@/lib/icons';
import type { Employee, Role, RoleSet } from '@/types';

const ROLE_INFO: { id: Role; label: string; note: string }[] = [
  { id: 'employee', label: 'Employee', note: 'Clocks in, self-service' },
  { id: 'manager', label: 'Manager', note: 'Approves their direct reports' },
  { id: 'admin', label: 'Admin', note: 'Full system administration' },
  { id: 'executive', label: 'Executive', note: 'No clock-in, company-wide read-only' },
];

const blank = (): Employee => ({
  uid: `new${Date.now()}`, firstName: '', lastName: '', email: '', phone: '',
  department: '', position: '', roles: { employee: true }, reportingManager: undefined,
});

export function EmployeeDirectory() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Employee[]>(() => sampleStaff.map((s) => ({ ...s })));
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  if (!user) return null;

  const isAdmin = canConfigure(user.roles);
  // Admin sees everyone; a manager/exec sees the people they oversee.
  const scope = seesCompanyWide(user.roles) ? staff : myReports(user.uid, staff);
  const list = useMemo(
    () => scope.filter((s) => `${s.firstName} ${s.lastName} ${s.department} ${s.position}`.toLowerCase().includes(query.toLowerCase())),
    [scope, query],
  );

  function save(e: Employee) {
    setStaff((prev) => (prev.some((s) => s.uid === e.uid) ? prev.map((s) => (s.uid === e.uid ? e : s)) : [...prev, e]));
    setEditing(null);
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.05rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-.02em' }}>Employees</div>
          <div style={{ color: 'var(--ink-2)', fontSize: '.8rem', marginTop: 3 }}>
            {isAdmin ? 'Manage people, roles and reporting lines.' : 'The people you oversee.'}
          </div>
        </div>
        {isAdmin && (
          <div style={{ marginLeft: 'auto' }}>
            <Button onClick={() => setEditing(blank())}><IconPlus size={16} /> Add employee</Button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '1.05rem', maxWidth: 360 }}>
        <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--ink-3)' }}><IconSearch size={16} /></span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people"
          style={{ width: '100%', padding: '.6rem .7rem .6rem 2.1rem', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--card)', fontFamily: 'inherit', fontSize: '.84rem' }} />
      </div>

      <div className="grid-3">
        {list.map((s) => (
          <Card key={s.uid} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
            <div onClick={() => isAdmin && setEditing({ ...s })} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
              <Avatar name={`${s.firstName} ${s.lastName}`} size={46} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '.9rem' }}>{s.firstName} {s.lastName}</div>
                <div className="muted" style={{ fontSize: '.74rem' }}>{s.position || '—'}</div>
                <div className="muted" style={{ fontSize: '.72rem', marginTop: 2 }}>{s.department || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginTop: '.8rem' }}>
              {roleLabel(s.roles).split(' · ').map((r) => (
                <span key={r} style={{ fontSize: '.66rem', fontWeight: 700, color: 'var(--navy)', background: 'var(--soft)', borderRadius: 20, padding: '.18rem .55rem' }}>{r}</span>
              ))}
            </div>
            {s.reportingManager && (
              <div className="muted" style={{ fontSize: '.7rem', marginTop: '.5rem' }}>
                Reports to {nameOf(s.reportingManager, staff)}
              </div>
            )}
            {isAdmin && (
              <button onClick={() => setEditing({ ...s })} style={{ marginTop: '.7rem', background: 'var(--soft)', border: 0, borderRadius: 9, padding: '.4rem .75rem', fontWeight: 700, fontSize: '.74rem', color: 'var(--ink)', cursor: 'pointer' }}>
                Edit
              </button>
            )}
          </Card>
        ))}
      </div>

      {editing && <Editor employee={editing} staff={staff} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}

function Editor({ employee, staff, onSave, onClose }: { employee: Employee; staff: Employee[]; onSave: (e: Employee) => void; onClose: () => void }) {
  const [e, setE] = useState<Employee>(employee);
  const set = (patch: Partial<Employee>) => setE((cur) => ({ ...cur, ...patch }));
  const toggleRole = (r: Role) => setE((cur) => {
    const roles: RoleSet = { ...cur.roles };
    if (roles[r]) delete roles[r]; else roles[r] = true;
    return { ...cur, roles };
  });
  const isNew = !staff.some((s) => s.uid === e.uid);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={drawer} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '1rem' }}>
          <IconUsers size={20} />
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{isNew ? 'Add employee' : 'Edit employee'}</div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 0, fontSize: '1.3rem', color: 'var(--ink-3)', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: '.7rem' }}>
          <F label="First name"><input value={e.firstName} onChange={(x) => set({ firstName: x.target.value })} style={inp} /></F>
          <F label="Last name"><input value={e.lastName} onChange={(x) => set({ lastName: x.target.value })} style={inp} /></F>
        </div>
        <F label="Email"><input value={e.email} onChange={(x) => set({ email: x.target.value })} style={inp} /></F>
        <div style={{ display: 'flex', gap: '.7rem' }}>
          <F label="Department"><input value={e.department} onChange={(x) => set({ department: x.target.value })} style={inp} /></F>
          <F label="Position"><input value={e.position} onChange={(x) => set({ position: x.target.value })} style={inp} /></F>
        </div>

        <div style={{ margin: '.4rem 0 .3rem', fontWeight: 800, fontSize: '.82rem' }}>Roles</div>
        <div className="muted" style={{ fontSize: '.72rem', marginBottom: '.55rem' }}>A person can hold several. Executives don't clock in.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem', marginBottom: '.9rem' }}>
          {ROLE_INFO.map((r) => (
            <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.55rem .7rem', border: '1px solid var(--line)', borderRadius: 11, cursor: 'pointer', background: e.roles[r.id] ? 'var(--soft)' : 'var(--card)' }}>
              <input type="checkbox" checked={!!e.roles[r.id]} onChange={() => toggleRole(r.id)} style={{ width: 'auto' }} />
              <div><div style={{ fontWeight: 700, fontSize: '.8rem' }}>{r.label}</div><div className="muted" style={{ fontSize: '.7rem' }}>{r.note}</div></div>
            </label>
          ))}
        </div>

        <F label="Reports to (line manager)">
          <select value={e.reportingManager ?? ''} onChange={(x) => set({ reportingManager: x.target.value || undefined })} style={inp}>
            <option value="">— None —</option>
            {staff.filter((s) => s.uid !== e.uid).map((s) => <option key={s.uid} value={s.uid}>{s.firstName} {s.lastName}</option>)}
          </select>
        </F>
        <div className="muted" style={{ fontSize: '.7rem', marginTop: '-.3rem', marginBottom: '.9rem' }}>
          Their line manager approves their leave and sees their attendance.
        </div>

        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(e)}>{isNew ? 'Add employee' : 'Save changes'}</Button>
        </div>
      </div>
    </div>
  );
}

function nameOf(uid: string, staff: Employee[]) { const s = staff.find((x) => x.uid === uid); return s ? `${s.firstName} ${s.lastName}` : '—'; }
function F({ label, children }: { label: string; children: React.ReactNode }) { return <div style={{ marginBottom: '.7rem', flex: 1 }}><label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '.3rem' }}>{label}</label>{children}</div>; }
const inp: React.CSSProperties = { width: '100%', padding: '.58rem .7rem', borderRadius: 11, border: '1px solid var(--line)', background: 'var(--soft)', fontFamily: 'inherit', fontSize: '.84rem', color: 'var(--ink)' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(10,15,34,.45)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' };
const drawer: React.CSSProperties = { width: 'min(440px, 100%)', height: '100%', background: 'var(--card)', padding: '1.3rem', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(0,0,0,.2)' };
