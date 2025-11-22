export interface Investor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  investments?: Investment[];
  profitDistributions?: ProfitDistribution[];
  payables?: InvestorPayable[];
  payments?: InvestorPayment[];
}

export interface Investment {
  id: string;
  investmentAmount: number;
  profitPercentage: number;
  isFullInvestment: boolean;
  purchaseOrder: {
    id: string;
    poNumber: string;
    status: string;
    totalAmount: number;
    vendorName: string;
    createdAt: string;
  };
}

export interface ProfitDistribution {
  id: string;
  amount: number;
  distributionDate: string;
  description?: string;
  bill: {
    billNumber: string;
    totalAmount: number;
    billDate: string;
  };
}

// Payment Management Types
export interface InvestorPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  status: InvestorPaymentStatus;
  investorId: string;
  payableId?: string;
  investorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorPayable {
  id: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PayableStatus;
  dueDate?: string;
  investorId: string;
  purchaseOrderId: string;
  investorName: string;
  poNumber: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
  payments?: InvestorPayment[];
}

export interface InvestorDueSummary {
  investorId: string;
  investorName: string;
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  payables: InvestorPayable[];
}

export interface PaymentHistoryResponse {
  payments: InvestorPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request Types
export interface CreateInvestorPaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  payableId?: string;
}

export interface CreatePayableData {
  purchaseOrderId: string;
  dueAmount: number;
  dueDate?: string;
}

// Response Types
export interface InvestorListResponse {
  investors: Investor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface InvestorStatistics {
  summary: {
    totalInvestors: number;
    activeInvestors: number;
    inactiveInvestors: number;
    totalInvestment: number;
    combinedCapital: number;
    averageInvestment: number;
    averageShare: number;
  };
  equityDistribution: Array<{
    investorName: string;
    sharePercentage: number;
    amount: number;
  }>;
  investorDetails: Array<{
    investorId: string;
    investorName: string;
    totalInvested: number;
    activeInvestments: number;
    sharePercentage: number;
  }>;
}

export interface InvestorPerformance {
  id: string;
  name: string;
  email: string;
  totalInvested: number;
  totalProfit: number;
  activeInvestments: number;
  completedInvestments: number;
  totalInvestments: number;
  roi: number;
  lastInvestment: string | null;
}

export type EquityDistribution = Array<{
  investorName: string;
  sharePercentage: number;
  amount: number;
}>;

export interface CreateInvestorData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
  isActive?: boolean;
}

export interface UpdateInvestorData extends Partial<CreateInvestorData> {}

export interface InvestorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaymentHistoryParams {
  page?: number;
  limit?: number;
}

// Enums
export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CARD = 'CARD'
}

export enum InvestorPaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum PayableStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}