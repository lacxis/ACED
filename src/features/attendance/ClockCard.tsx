import { useState, type CSSProperties } from 'react';
import type { AttendanceRecord, WorkLocation } from '@/types';
import { businessDate, businessTime, fmt12, durationLabel } from '@/domain/time';
import { DEFAULT_SETTINGS, scheduledLocation, isWfhDay } from '@/domain/schedule';
import { deriveStatus, STATUS_LABEL } from '@/domain/attendance';
import { sampleClients } from '@/data/sample';
import { IconPin, IconHome, IconBrief, IconCheck } from '@/lib/icons';

const S = DEFAULT_SETTINGS;
const LOC: { id: WorkLocation; label: string; Icon: typeof IconPin }[] = [
  { id: 'office', label: 'Office', Icon: IconPin },
  { id: 'home', label: 'Work from home', Icon: IconHome },
  { id: 'client_site', label: 'Client site', Icon: IconBrief },
];

export function ClockCard() {
  const today = businessDate();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [location, setLocation] = useState<WorkLocation>(scheduledLocation(today, S));
  const [client, setClient] = useState('');

  const status = deriveStatus(record, today, S, { dayEnded: false });
  const clockedIn = !!record?.clockIn && !record?.clockOut;
  const done = !!record?.clockOut;

  function clockIn() {
    setRecord({
      clockIn: businessTime(), clockOut: null, workLocation: location,
      clientRef: location === 'client_site' ? { clientId: client || 'Client' } : undefined,
      source: 'self',
    });
  }
  function clockOut() {
    setRecord((r) => (r ? { ...r, clockOut: businessTime() } : r));
  }

  return (
    <div style={{
      borderRadius: 24, background: 'linear-gradient(120deg,var(--navy),var(--navy-2))', color: '#fff',
      padding: '1.6rem', boxShadow: '0 18px 44px rgba(11,27,77,.26)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', color: 'rgba(255,255,255,.7)' }}>
          {isWfhDay(today, S) ? 'WORK-FROM-HOME DAY' : 'OFFICE DAY'} · {today}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '.74rem', fontWeight: 700, background: 'rgba(255,255,255,.14)', borderRadius: 20, padding: '.24rem .7rem' }}>
          {STATUS_LABEL[status]}
        </div>
      </div>

      {!record && (
        <>
          <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.75)', margin: '1rem 0 .5rem' }}>Where are you working today?</div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {LOC.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setLocation(id)} style={pill(location === id)}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
          {location === 'client_site' && (
            <input list="clients" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Which client?" style={clientInput} />
          )}
          <datalist id="clients">{sampleClients.map((c) => <option key={c} value={c} />)}</datalist>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '1.3rem', flexWrap: 'wrap' }}>
        <div>
          <div className="tnum" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-.02em' }}>
            {done ? durationLabel(record.clockIn, record.clockOut) : clockedIn ? fmt12(record!.clockIn) : fmt12(businessTime())}
          </div>
          <div style={{ fontSize: '.74rem', color: 'rgba(255,255,255,.7)' }}>
            {done ? `Worked ${fmt12(record.clockIn)} – ${fmt12(record.clockOut)}`
              : clockedIn ? 'Clocked in — have a good day' : 'Current time (Lagos)'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {done ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 700 }}>
              <IconCheck size={18} /> Done for today
            </div>
          ) : clockedIn ? (
            <button onClick={clockOut} style={bigBtn}>Clock Out</button>
          ) : (
            <button onClick={clockIn} style={bigBtn}>Clock In</button>
          )}
        </div>
      </div>
    </div>
  );
}

const pill = (on: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontWeight: 700, fontSize: '.78rem',
  padding: '.55rem .85rem', borderRadius: 13, cursor: 'pointer',
  background: on ? '#fff' : 'rgba(255,255,255,.1)', color: on ? 'var(--navy)' : '#fff',
  border: '1px solid rgba(255,255,255,.2)',
});
const bigBtn: CSSProperties = {
  background: 'linear-gradient(135deg,var(--orange),var(--orange-2))', color: '#fff',
  fontWeight: 700, fontSize: '.95rem', border: 0, borderRadius: 14, padding: '.85rem 2rem',
  boxShadow: '0 8px 20px rgba(240,122,26,.4)', cursor: 'pointer',
};
const clientInput: CSSProperties = {
  marginTop: '.6rem', width: '100%', maxWidth: 320, padding: '.6rem .8rem', borderRadius: 11,
  border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.12)', color: '#fff',
  fontFamily: 'inherit', fontSize: '.84rem',
};
