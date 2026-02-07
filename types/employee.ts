export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  designation: string;
  joinDate: string;
  baseSalary: number;
  homeRentAllowance: number;
  healthAllowance: number;
  travelAllowance: number;
  mobileAllowance: number;
  otherAllowances: number;
  overtimeRate?: number;
  advanceBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  user?: {
    name: string;
    email: string;
  };
  salaries?: Salary[];
}

export interface Salary {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonus: number;
  deductions: number;
  grossSalary: number;
  advanceDeduction: number;
  netSalary: number;
  status: SalaryStatus;
  paidDate?: string;
  paymentMethod?: PaymentMethod | null;
  reference?: string | null;
  notes?: string | null;
  employee?: {
    name: string;
    designation: string;
    employeeId: string;
  };
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';

export type SalaryStatus = 'PENDING' | 'PAID' | 'CANCELLED';

// Payables and Statistics Types
export interface PayablesResponse {
  unpaid: Salary[];
  paid: Salary[];
  month: number;
  year: number;
}

export interface SalaryStatistics {
  currentMonth: {
    month: number;
    year: number;
    totalPaid: number;
    totalPending: number;
    paidEmployees: number;
    pendingEmployees: number;
    totalEmployees: number;
  };
  yearToDate: {
    totalPaid: number;
    totalMonths: number;
    totalPayments: number;
  };
  allTime: {
    totalPaid: number;
    totalPayments: number;
  };
  employeeStats: {
    totalActive: number;
    paidThisMonth: number;
    pendingThisMonth: number;
  };
}

export interface MonthlyTrend {
  month: number;
  paidAmount: number;
  pendingAmount: number;
  paidCount: number;
  pendingCount: number;
}

export interface TrendsResponse {
  year: number;
  trends: MonthlyTrend[];
}

// Request DTOs
export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  designation: string;
  joinDate: string;
  baseSalary: number;
  homeRentAllowance: number;
  healthAllowance: number;
  travelAllowance: number;
  mobileAllowance: number;
  otherAllowances: number;
  overtimeRate?: number;
  userId?: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  designation?: string;
  baseSalary?: number;
  homeRentAllowance?: number;
  healthAllowance?: number;
  travelAllowance?: number;
  mobileAllowance?: number;
  otherAllowances?: number;
  overtimeRate?: number;
  isActive?: boolean;
}

export interface CreateSalaryRequest {
  employeeId: string;
  month: number;
  year: number;
  overtimeHours?: number;
  bonus?: number;
  deductions?: number;
}

export interface PaySalaryRequest {
  employeeId: string;
  month: number;
  year: number;
  paidDate: string;
  advanceDeduction?: number;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface PayablesRequest {
  month?: number;
  year?: number;
}

export interface StatisticsRequest {
  month?: number;
  year?: number;
}

export interface TrendsRequest {
  year?: number;
}

// ==================== Advance Types ====================

export type AdvanceType = 'GIVEN' | 'RECOVERED' | 'ADJUSTMENT';

export interface AdvanceRecord {
  id: string;
  employeeId: string;
  amount: number;
  type: AdvanceType;
  description: string | null;
  paymentMethod: PaymentMethod | null;
  reference: string | null;
  balanceAfter: number;
  createdAt: string;
  salary?: { month: number; year: number } | null;
}

export interface GiveAdvanceRequest {
  amount: number;
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
}

export interface GiveAdvanceResponse {
  success: boolean;
  advance: AdvanceRecord;
  employee: {
    id: string;
    name: string;
    previousBalance: number;
    newBalance: number;
  };
}

export interface AdjustAdvanceRequest {
  amount: number;
  description: string;
}

export interface AdvanceHistoryResponse {
  employee: {
    id: string;
    name: string;
    advanceBalance: number;
  };
  advances: AdvanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdvanceOverviewResponse {
  summary: {
    totalOutstandingAdvance: number;
    employeesWithAdvance: number;
    totalActiveEmployees: number;
  };
  employees: {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    advanceBalance: number;
    lastAdvanceTransaction: {
      amount: number;
      type: AdvanceType;
      createdAt: string;
    } | null;
  }[];
}

export interface SalaryPreviewResponse {
  salary: {
    id: string;
    month: number;
    year: number;
    monthName: string;
    status: SalaryStatus;
    baseSalary: number;
    allowances: number;
    overtimeHours: number | null;
    overtimeAmount: number | null;
    bonus: number | null;
    deductions: number | null;
    grossSalary: number;
    advanceDeduction: number | null;
    netSalary: number | null;
    paidDate: string | null;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
    notes: string | null;
  };
  employee: {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    advanceBalance: number;
    baseSalary: number;
    homeRentAllowance: number;
    healthAllowance: number;
    travelAllowance: number;
    mobileAllowance: number;
    otherAllowances: number;
  };
  advance: {
    currentBalance: number;
    suggestedDeduction: number;
    netAfterDeduction: number;
    maxDeduction: number;
  };
}

export interface PaySalaryResponse {
  success: boolean;
  salary: {
    id: string;
    month: number;
    year: number;
    baseSalary: number;
    allowances: number;
    overtimeAmount: number;
    bonus: number;
    deductions: number;
    grossSalary: number;
    advanceDeduction: number;
    netSalary: number;
    status: 'PAID';
    paidDate: string;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
    notes: string | null;
  };
  advanceDeduction: {
    deducted: number;
    previousBalance: number;
    newBalance: number;
    recoveryRecord: AdvanceRecord | null;
  };
  payment: {
    grossSalary: number;
    advanceDeducted: number;
    netPaid: number;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
  };
  employee: {
    id: string;
    name: string;
    designation: string;
  };
}