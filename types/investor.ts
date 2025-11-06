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