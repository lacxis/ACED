import type { JSX } from 'react';

type P = { size?: number; className?: string };
const svg = (path: JSX.Element) => ({ size = 20, className }: P) => (
  <span className={className} style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  </span>
);

export const IconGrid = svg(<><rect x="3" y="3" width="8" height="8" rx="2.5" /><rect x="13" y="3" width="8" height="8" rx="2.5" /><rect x="13" y="13" width="8" height="8" rx="2.5" /><rect x="3" y="13" width="8" height="8" rx="2.5" /></>);
export const IconClock = svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 1.8" /></>);
export const IconLeaf = svg(<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-11 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" /></>);
export const IconUsers = svg(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></>);
export const IconBell = svg(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>);
export const IconPin = svg(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>);
export const IconHome = svg(<><path d="M3.5 9.5l8.5-6.5 8.5 6.5" /><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /></>);
export const IconArrow = svg(<path d="M5 12h14M13 6l6 6-6 6" />);

export const IconBrief = svg(<><rect x="2.5" y="7.5" width="19" height="13" rx="2.5" /><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" /></>);
export const IconCheck = svg(<path d="M20 6L9 17l-5-5" />);

export const IconPlus = svg(<path d="M12 5v14M5 12h14" />);
export const IconSearch = svg(<><circle cx="11" cy="11" r="7.5" /><path d="m21 21-4.3-4.3" /></>);
