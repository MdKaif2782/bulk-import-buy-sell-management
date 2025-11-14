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
  netSalary: number;
  status: SalaryStatus;
  paidDate?: string;
  employee?: {
    name: string;
    designation: string;
    employeeId: string;
  };
}

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