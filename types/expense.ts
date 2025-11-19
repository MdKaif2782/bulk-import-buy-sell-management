export enum ExpenseCategory {
  ELECTRICITY = 'ELECTRICITY',
  RENT = 'RENT',
  TRAVEL = 'TRAVEL',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  MAINTENANCE = 'MAINTENANCE',
  INTERNET = 'INTERNET',
  OTHER = 'OTHER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CARD = 'CARD'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Request Types
export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string; // ISO string
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  notes?: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  expenseDate?: string; // ISO string
  paymentMethod?: PaymentMethod;
  status?: ExpenseStatus;
  notes?: string;
}

export interface GetExpensesParams {
  skip?: number;
  take?: number;
  search?: string;
  category?: ExpenseCategory;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  status?: ExpenseStatus;
}

// Response Types
export interface ExpenseResponse {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  notes?: string;
  recordedBy: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesListResponse {
  expenses: ExpenseResponse[];
  total: number;
}

export interface ExpenseStatisticsResponse {
  total: number;
  transactionCount: number;
  approved: number;
  pending: number;
  average: number;
}

export interface MonthlyTrendResponse {
  month: string; // Format: "YYYY-MM"
  amount: number;
}

export interface CategorySummaryResponse {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}