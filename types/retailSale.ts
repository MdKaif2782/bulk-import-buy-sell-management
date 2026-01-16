// types/retailSale.ts

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';

export interface RetailSaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventory: {
    id: string;
    productCode: string;
    productName: string;
    description?: string;
  };
}

export interface RetailSale {
  id: string;
  saleNumber: string;
  saleDate: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: RetailSaleItem[];
}

export interface CreateRetailSaleItemRequest {
  inventoryId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateRetailSaleRequest {
  items: CreateRetailSaleItemRequest[];
  paymentMethod: PaymentMethod;
  discount?: number;
  tax?: number;
  customerName?: string;
  customerPhone?: string;
  reference?: string;
  notes?: string;
}

export interface GetRetailSalesParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
}

export interface RetailSalesResponse {
  sales: RetailSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RetailAnalyticsSummary {
  totalSales: number;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  totalItemsSold: number;
  cashSales: number;
  cardSales: number;
  bankTransferSales: number;
  chequeSales: number;
}

export interface TopProduct {
  productCode: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DailySale {
  date: string;
  transactions: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  paymentMethod: PaymentMethod;
  count: number;
  total: number;
  percentage: number;
}

export interface RetailAnalytics {
  summary: RetailAnalyticsSummary;
  topProducts: TopProduct[];
  dailySales: DailySale[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
}

export interface GetRetailAnalyticsParams {
  startDate?: string;
  endDate?: string;
}
