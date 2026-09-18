import { Member, GymBranch, PaymentStatus } from '../types';

export const DEFAULT_MONTHLY_FEE = 450; // Cuota estándar fija de 450 MXN
export const DEFAULT_MEMBERSHIP_PLAN = 'Mensual'; // Plan único mensual

export const GYM_BRANCHES: GymBranch[] = [
  'León',
  'San Luis Potosí',
  'Silao',
  'Comanjilla'
];

export const BRANCH_DETAILS: Record<GymBranch, { address: string; phone: string; manager: string }> = {
  'León': {
    address: 'Blvd. Juan Alonso de Torres #1420, Plaza Mayor, León, Gto.',
    phone: '+52 477 712 3456',
    manager: 'Lic. Roberto Valenzuela'
  },
  'San Luis Potosí': {
    address: 'Av. Venustiano Carranza #2150, Las Lomas, San Luis Potosí, S.L.P.',
    phone: '+52 444 815 6789',
    manager: 'Ing. Alejandro Sotomayor'
  },
  'Silao': {
    address: 'Prolongación 5 de Mayo #45, Zona Centro, Silao, Gto.',
    phone: '+52 472 722 9900',
    manager: 'Lic. Claudia Moncada'
  },
  'Comanjilla': {
    address: 'Carretera Silao - San Felipe Km 8, Entrada a Comanjilla, Gto.',
    phone: '+52 477 980 1122',
    manager: 'Coach Marcos Estrada'
  }
};

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a member's payment has passed its due date or has overdue status.
 * If overdue, access to the gym and app MUST be denied.
 */
export function isMemberPaymentOverdue(member: Member, referenceDateString?: string): boolean {
  if (member.paymentStatus === 'overdue') return true;

  const todayStr = referenceDateString || getTodayDateString();
  if (!member.nextPaymentDueDate) return false;

  // Comparison by ISO date string (YYYY-MM-DD)
  return member.nextPaymentDueDate < todayStr;
}

/**
 * Returns the number of days overdue (positive number if expired, 0 or negative if active)
 */
export function getDaysOverdue(member: Member): number {
  if (!member.nextPaymentDueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(member.nextPaymentDueDate + 'T00:00:00');
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Returns days remaining until next payment due date
 */
export function getDaysUntilDue(member: Member): number {
  if (!member.nextPaymentDueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(member.nextPaymentDueDate + 'T00:00:00');
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns days remaining until next payment due date (positive if in the future, negative if overdue)
 */
export function getPaymentDaysDifference(dueDateStr?: string): number {
  if (!dueDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Renews a member's payment: updates last payment date to today,
 * computes the new nextPaymentDueDate based on plan or month,
 * and sets paymentStatus to 'paid'.
 */
export function renewMemberPaymentRecord(member: Member, monthsToAdd = 1): Member {
  const todayStr = getTodayDateString();
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  const nextDueDateStr = `${year}-${month}-${day}`;

  return {
    ...member,
    membershipType: DEFAULT_MEMBERSHIP_PLAN,
    monthlyFee: DEFAULT_MONTHLY_FEE,
    lastPaymentDate: todayStr,
    nextPaymentDueDate: nextDueDateStr,
    paymentStatus: 'paid',
    status: 'active'
  };
}
