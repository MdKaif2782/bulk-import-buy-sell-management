// types/bill.ts
export interface BillItem {
  id: string;
  productDescription: string;
  packagingDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventoryId: string;
  inventory?: {
    id: string;
    productCode: string;
    productName: string;
    description?: string;
  };
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';
  reference?: string;
  notes?: string;
  billId: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  vatRegNo: string;
  code: string;
  vendorNo: string;
  totalAmount: number;
  taxAmount: number;
  dueAmount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
  buyerPOId: string;
  createdBy: string;
  items: BillItem[];
  payments: Payment[];
  buyerPO?: {
    id: string;
    poNumber: string;
    poDate: string;
    quotation?: {
      quotationNumber: string;
      companyName: string;
      companyContact?: string;
      totalAmount: number;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    payments: number;
  };
}

export interface CreateBillRequest {
  buyerPOId: string;
  vatRegNo: string;
  code: string;
  vendorNo: string;
  billDate?: string;
}

export interface AddPaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';
  reference?: string;
  notes?: string;
}

export interface BillSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BillResponse {
  data: Bill[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BillStats {
  totalBills: number;
  totalAmount: number;
  totalDue: number;
  pendingBills: number;
  paidBills: number;
  partiallyPaidBills: number;
  overdueBills: number;
  collectionRate: number;
}

export interface AvailableBuyerPO {
  id: string;
  poNumber: string;
  poDate: string;
  remainingAmount: number;
  canCreateBill: boolean;
  quotation: {
    totalAmount: number;
    companyName: string;
    companyContact?: string;
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      inventory: {
        id: string;
        productCode: string;
        productName: string;
      };
    }>;
  };
  bills: Array<{
    totalAmount: number;
  }>;
}