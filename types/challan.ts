// Base types matching Prisma schema
export interface Challan {
  id: string;
  challanNumber: string;
  status: ChallanStatus;
  dispatchDate?: string | null;
  deliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  buyerPurchaseOrderId: string;
  
  // Relations
  items?: ChallanItem[];
  buyerPurchaseOrder?: BuyerPurchaseOrder;
}

export interface ChallanItem {
  id: string;
  quantity: number;
  challanId: string;
  inventoryId: string;
  inventory?: Inventory;
}

export interface BuyerPurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  dispatchedQuantity: number;
  pdfUrl?: string | null;
  externalUrl?: string | null;
  createdAt: string;
  quotationId: string;
  
  // Relations
  quotation?: Quotation;
  challans?: Challan[];
  bills?: Bill[];
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  companyName: string;
  companyAddress: string;
  companyContact?: string | null;
  status: QuotationStatus;
  totalAmount: number;
  taxAmount: number;
  createdAt: string;
  validUntil?: string | null;
  
  // Relations
  items?: QuotationItem[];
  buyerPO?: BuyerPurchaseOrder;
}

export interface QuotationItem {
  id: string;
  quantity: number;
  mrp: number;
  unitPrice: number;
  packagePrice: number;
  taxPercentage?: number | null;
  totalPrice: number;
  quotationId: string;
  inventoryId: string;
  
  // Relations
  inventory?: Inventory;
}

export interface Inventory {
  id: string;
  productCode: string;
  barcode?: string | null;
  productName: string;
  imageUrl?: string | null;
  description?: string | null;
  quantity: number;
  purchasePrice: number;
  expectedSalePrice: number;
  minStockLevel?: number | null;
  maxStockLevel?: number | null;
  createdAt: string;
  updatedAt: string;
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
  status: BillStatus;
}

export interface BpoSummary {
  id: string;
  poNumber: string;
  companyName: string;
  totalQuantity: number;
  dispatchedQuantity: number;
  remainingQuantity: number;
  orderedValue: number;
  dispatchedValue: number;
  hasChallan: boolean;
  challanStatus?: string;
  createdAt: string;
  items?: Array<{
    inventoryId: string;
    productName: string;
    productCode: string;
    orderedQuantity: number;
    availableQuantity: number;
    unitPrice: number;
  }>;
}

export interface DispatchSummary {
  totalBPOs: number;
  fullyDispatched: number;
  partiallyDispatched: number;
  notDispatched: number;
  totalItemsOrdered: number;
  totalItemsDispatched: number;
  totalValueOrdered: number;
  totalValueDispatched: number;
  bpoDetails: BpoSummary[];
}

export interface PendingBPO {
  id: string;
  poNumber: string;
  companyName: string;
  totalQuantity: number;
  dispatchedQuantity: number;
  remainingQuantity: number;
  hasChallan: boolean;
  challanStatus?: string;
  items: Array<{
    inventoryId: string;
    productName: string;
    productCode: string;
    orderedQuantity: number;
    availableQuantity: number;
    unitPrice: number;
  }>;
}

// Enums
export enum ChallanStatus {
  DRAFT = 'DRAFT',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED'
}

export enum QuotationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum BillStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

// Request DTOs
export interface CreateChallanDto {
  buyerPurchaseOrderId: string;
  items: Array<{
    inventoryId: string;
    quantity: number;
  }>;
  dispatchDate?: string;
  deliveryDate?: string;
  status?: 'DRAFT' | 'DISPATCHED';
}

export interface UpdateChallanStatusDto {
  status: ChallanStatus;
}

export interface DispatchBPODto {
  buyerPurchaseOrderId: string;
  status?: 'DISPATCHED';
}

export interface GetChallansQueryParams {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}