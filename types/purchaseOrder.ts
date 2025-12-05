export enum PaymentType {
  FULL = 'FULL',
  DUE = 'DUE'
}

export enum POStatus {
  PENDING = 'PENDING',
  ORDERED = 'ORDERED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export interface PurchaseOrderItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  totalPrice: number;
  purchaseOrderId: string;
}

export interface PurchaseOrderInvestment {
  id: string;
  investmentAmount: number;
  profitPercentage: number;
  isFullInvestment: boolean;
  purchaseOrderId: string;
  investorId: string;
  investor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorCountry: string;
  vendorAddress: string;
  vendorContact: string;
  vendorContactNo?: string;
  paymentType: PaymentType;
  status: POStatus;
  totalAmount: number;
  taxAmount: number;
  dueAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  receivedAt?: string;
  createdBy: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: PurchaseOrderItem[];
  investments: PurchaseOrderInvestment[];
  inventory: any[]; // You can type this more specifically if needed
}

export interface CreatePurchaseOrderItem {
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  totalPrice: number;
}

export interface CreatePurchaseOrderInvestment {
  investorId: string;
  investmentAmount: number;
  profitPercentage: number;
  isFullInvestment?: boolean;
}

export interface CreatePurchaseOrderData {
  vendorName: string;
  vendorCountry: string;
  vendorAddress: string;
  vendorContactNo: string
  vendorContact: string;
  paymentType: PaymentType;
  totalAmount: number;
  taxAmount: number;
  dueAmount: number;
  notes?: string;
  items: CreatePurchaseOrderItem[];
  investments: CreatePurchaseOrderInvestment[];
}

export interface UpdatePurchaseOrderData {
  vendorName?: string;
  vendorCountry?: string;
  vendorAddress?: string;
  vendorContact?: string;
  paymentType?: PaymentType;
  totalAmount?: number;
  taxAmount?: number;
  dueAmount?: number;
  notes?: string;
  status?: POStatus;
  items?: CreatePurchaseOrderItem[];
  investments?: CreatePurchaseOrderInvestment[];
}

export interface ReceivedItem {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  expectedSalePrice: number;
}

export interface MarkAsReceivedData {
  receivedItems: ReceivedItem[];
}

export interface PurchaseOrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PurchaseOrderStats {
  total: number;
  pending: number;
  ordered: number;
  shipped: number;
  received: number;
  cancelled: number;
  totalInvestment: number;
  pendingInvestment: number;
}