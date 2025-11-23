import { PurchaseOrderItem } from "./purchaseOrder";

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CARD = 'CARD'
}
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
}
export interface InvestorListResponse {
  investors: Investor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
  investorId:string,
}

// Enums


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

export interface InvestorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
  joinDate: string;
  status: string;
}

export enum POStatus {
  PENDING = 'PENDING',
  ORDERED = 'ORDERED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export interface InvestmentBreakdown {
  investmentId: string;
  poId: string;
  poNumber: string;
  vendorName: string;
  investmentAmount: number;
  profitPercentage: number;
  poStatus: POStatus;
  orderDate: string;
  receivedDate?: string;
  
  // Financial metrics
  poCost: number;
  poRevenue: number;
  poCollected: number;
  poProfit: number;
  poPayableNow: number;
  
  // Performance metrics
  roi: number;
  profitEarned: number;
  payableNow: number;

  // Products
  products: PurchaseOrderItem[];
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  paymentDate: string;
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
}

export interface RecentActivity {
  type: 'PO_RECEIVED' | 'PAYMENT_RECEIVED' | 'INVESTMENT_ADDED';
  date: string;
  description: string;
  amount: number;
  method?: PaymentMethod;
}

export interface ProductSale {
  poId: string;
  poNumber: string;
  productName: string;
  productCode: string;
  purchasePrice: number;
  expectedSalePrice: number;
  totalSold: number;
  totalRevenue: number;
  customers: string[];
}

export interface DueSummary {
  // Investor Information
  investor: InvestorInfo;
  
  // Summary Section
  summary: {
    totalInvestment: number;
    totalRevenue: number;
    totalCollected: number;
    totalProfitEarned: number;
    totalPaid: number;
    totalDue: number;
    payableNow: number;
    overallROI: number;
    collectionEfficiency: number;
    activeInvestments: number;
  };

  // Detailed Breakdowns
  investmentBreakdown: InvestmentBreakdown[];
  productSales: ProductSale[];
  paymentHistory: PaymentHistoryItem[];

  // Timeline & Recent Activity
  recentActivity: RecentActivity[];
}

// ==================== Payment & Payable Types ====================
export interface InvestorPayment {
  id: string;
  investorId: string;
  amount: number;
  paymentDate: string;
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  investor?: Investor;
}

export interface CreateInvestorPaymentData {
  amount: number;
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment: InvestorPayment;
  newBalance: {
    previousDue: number;
    newDue: number;
    remainingPayable: number;
  };
  investor: InvestorInfo;
}
