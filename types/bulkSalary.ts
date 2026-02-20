import { PaymentMethod } from './employee';

// ==================== Bulk Salary Upload Types ====================

/** A single row in the salary grid / upload payload */
export interface BulkSalaryEntry {
  employeeId?: string;
  employeeName: string;
  basic: number;
  joiningDate?: string;
  designation?: string;
  monthlySalary: number;
  medicalMobile?: number;
  bonusBoksis?: number;
  perDay?: number;
  dailyPresent?: number;
  totalPayable?: number;
  advance?: number;
  modeOfPayment?: string; // "0" | "1" | "2" | "3"
  balance?: number;
  signature?: any;
}

/** Top-level request body */
export interface BulkSalaryUploadRequest {
  month: number;
  year: number;
  entries: BulkSalaryEntry[];
}

/** Error for a single row */
export interface BulkSalaryRowError {
  row: number;
  employeeName: string;
  reason: string;
}

/** Response data from the bulk upload endpoint */
export interface BulkSalaryUploadData {
  success: boolean;
  month: number;
  year: number;
  monthName: string;
  processedRows: number;
  createdSalaries: string[];
  createdExpenses: string[];
  createdEmployees: string[];
  errors: BulkSalaryRowError[];
  updatedAdvanceBalances: Record<string, number>;
  summary: {
    totalRows: number;
    processed: number;
    failed: number;
    salariesCreated: number;
    expensesCreated: number;
    employeesCreated: number;
  };
}

/** Full API response wrapper */
export interface BulkSalaryUploadResponse {
  statusCode: number;
  message: string;
  data: BulkSalaryUploadData;
}

// ==================== Grid Row (client-side) ====================

export interface SalaryGridRow {
  /** Unique key for React rendering */
  _key: string;
  /** Row index (1-based, for display) */
  slNo: number;
  /** Employee ID from system (e.g. "EMP-00001") */
  employeeId: string;
  /** Employee name */
  employeeName: string;
  /** Base salary */
  basic: number;
  /** ISO date string */
  joiningDate: string;
  /** Designation / job title */
  designation: string;
  /** Monthly salary column */
  monthlySalary: number;
  /** Medical + mobile allowance */
  medicalMobile: number;
  /** Bonus */
  bonusBoksis: number;
  /** Per day rate (auto-calculated) */
  perDay: number;
  /** Days present */
  dailyPresent: number;
  /** Total payable (auto-calculated) */
  totalPayable: number;
  /** New advance given */
  advance: number;
  /** Payment mode: "0"=CASH, "1"=BANK_TRANSFER, "2"=CHEQUE, "3"=CARD */
  modeOfPayment: string;
  /** Balance (negative = recovery) */
  balance: number;
  /** Is this row from an existing employee? */
  _isExistingEmployee: boolean;
  /** The employee's current advance balance from backend */
  _currentAdvanceBalance: number;
}

// ==================== Payment Mode Helpers ====================

export const PAYMENT_MODE_MAP: Record<string, PaymentMethod> = {
  '0': 'CASH',
  '1': 'BANK_TRANSFER',
  '2': 'CHEQUE',
  '3': 'CARD',
};

export const PAYMENT_MODE_OPTIONS = [
  { value: '0', label: 'Cash' },
  { value: '1', label: 'Bank Transfer' },
  { value: '2', label: 'Cheque' },
  { value: '3', label: 'Card' },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ==================== Utility Functions ====================

/** Calculate per-day rate */
export function calcPerDay(basic: number, month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  return basic / daysInMonth;
}

/** Calculate total payable */
export function calcTotalPayable(row: SalaryGridRow, month: number, year: number): number {
  const perDay = calcPerDay(row.basic, month, year);
  if (row.dailyPresent > 0) {
    return perDay * row.dailyPresent + row.medicalMobile + row.bonusBoksis;
  }
  return row.monthlySalary + row.medicalMobile + row.bonusBoksis;
}

/** Calculate balance (total payable - advance deduction) */
export function calcBalance(totalPayable: number, advance: number, currentAdvanceBalance: number): number {
  return totalPayable - advance;
}

/** Create an empty grid row */
export function createEmptyRow(slNo: number): SalaryGridRow {
  return {
    _key: `row-${Date.now()}-${slNo}`,
    slNo,
    employeeId: '',
    employeeName: '',
    basic: 0,
    joiningDate: '',
    designation: '',
    monthlySalary: 0,
    medicalMobile: 0,
    bonusBoksis: 0,
    perDay: 0,
    dailyPresent: 0,
    totalPayable: 0,
    advance: 0,
    modeOfPayment: '0',
    balance: 0,
    _isExistingEmployee: false,
    _currentAdvanceBalance: 0,
  };
}

/** Convert grid rows to API entries */
export function gridRowsToEntries(rows: SalaryGridRow[]): BulkSalaryEntry[] {
  return rows
    .filter((r) => r.employeeName.trim() !== '')
    .map((row) => ({
      employeeId: row.employeeId || undefined,
      employeeName: row.employeeName,
      basic: row.basic,
      joiningDate: row.joiningDate || undefined,
      designation: row.designation || undefined,
      monthlySalary: row.monthlySalary,
      medicalMobile: row.medicalMobile,
      bonusBoksis: row.bonusBoksis,
      perDay: row.perDay,
      dailyPresent: row.dailyPresent,
      totalPayable: row.totalPayable,
      advance: row.advance,
      modeOfPayment: row.modeOfPayment,
      balance: row.balance,
    }));
}
