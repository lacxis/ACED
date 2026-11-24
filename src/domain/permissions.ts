import type { Role } from '@/types';

/** Client-side permission helpers. These mirror — but never replace — the
 *  Firebase Security Rules, which are the real enforcement point. */
export const can = {
  seeAllStaff: (r: Role) => r === 'admin',
  seeDeptStaff: (r: Role) => r === 'admin' || r === 'manager',
  editEmployees: (r: Role) => r === 'admin',
  editSettings: (r: Role) => r === 'admin',
  changeRoles: (r: Role) => r === 'admin',
  approveLeave: (r: Role) => r === 'admin' || r === 'manager',
  viewReports: (r: Role) => r === 'admin' || r === 'manager',
};
