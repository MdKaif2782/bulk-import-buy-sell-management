export interface Order {
  id: string;
  poNumber: string;
  poDate: string;
  pdfUrl?: string;
  externalUrl?: string;
  createdAt: string;
  quotation: Quotation;
  challans: Challan[];
  bills: Bill[];
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  companyName: string;
  companyAddress: string;
  status: string;
  totalAmount: number;
  items: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventory: Inventory;
}

export interface Inventory {
  id: string;
  productCode: string;
  productName: string;
  purchasePrice: number;
  purchaseOrder?: PurchaseOrder;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  investments: PurchaseOrderInvestment[];
}

export interface PurchaseOrderInvestment {
  id: string;
  investmentAmount: number;
  profitPercentage: number;
  investor: Investor;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
}

export interface Challan {
  id: string;
  challanNumber: string;
  status: string;
  dispatchDate?: string;
  deliveryDate?: string;
  items: ChallanItem[];
}

export interface ChallanItem {
  id: string;
  quantity: number;
  inventory: {
    id: string;
    productName: string;
  };
}

export interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  totalAmount: number;
  dueAmount: number;
  status: string;
  payments: Payment[];
  profitDistributions: ProfitDistribution[];
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
}

export interface ProfitDistribution {
  id: string;
  amount: number;
  investor: Investor;
}

export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  quotationNumber: string;
  companyName: string;
  totalOrderedQuantity: number;
  totalDeliveredQuantity: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  totalProfitDistributed: number;
  completionPercentage: number;
  billCount: number;
  challanCount: number;
  status: string;
  createdAt: string;
  lastUpdated: string;
}

export interface InvestorProfitSummary {
  investorId: string;
  investorName: string;
  totalProfitPercentage: number;
  totalInvestmentAmount: number;
  calculatedProfit: number;
  actualDistributedProfit: number;
  purchaseOrders: {
    poNumber: string;
    profitPercentage: number;
    investmentAmount: number;
  }[];
}

export interface OrderStatistics {
  totalOrders: number;
  statusBreakdown: Array<{
    status: string;
    _count: { id: number };
  }>;
  totalBilledAmount: number;
  totalPaidAmount: number;
  pendingAmount: number;
  recentOrders: Array<{
    id: string;
    poNumber: string;
    companyName: string;
    totalAmount: number;
    status: string;
    billCount: number;
    totalBilled: number;
  }>;
}

export interface CreateOrderData {
  quotationId: string;
  poDate?: string;
  pdfUrl?: string;
  externalUrl?: string;
}