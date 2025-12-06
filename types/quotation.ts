// types/quotation.ts

// types/quotation.ts
export interface QuotationItem {
  id: string;
  quantity: number;
  mrp: number;
  unitPrice: number;
  packagePrice: number;
  taxPercentage?: number;
  totalPrice: number;
  inventoryId: string;
  inventory?: {
    id: string;
    productCode: string;
    productName: string;
    description?: string;
    imageUrl?: string;
    quantity: number;
    expectedSalePrice: number;
  };
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  companyName: string;
  companyAddress: string;
  companyContact?: string;
  contactPersonName?: string;
  subject?: string;
  body?: string;
  generalTerms?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  deliveryDays?: number;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  totalAmount: number;
  taxAmount: number;
  moneyInWords?: string;
  signatureImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  items: QuotationItem[];
  buyerPO?: {
    id: string;
    poNumber: string;
    poDate: string;
    pdfUrl?: string;
    externalUrl?: string;
    bills?: Array<{
      id: string;
      billNumber: string;
      billDate: string;
      totalAmount: number;
      status: string;
    }>;
    challans?: Array<{
      id: string;
      challanNumber: string;
      status: string;
      dispatchDate?: string;
    }>;
  };
}

export interface CreateQuotationRequest {
  companyName: string;
  companyAddress: string;
  companyContact?: string;
  contactPersonName?: string;
  subject?: string;
  body?: string;
  generalTerms?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  deliveryDays?: number;
  totalAmount: number;
  taxAmount: number;
  moneyInWords?: string;
  signatureImageUrl?: string;
  validUntil?: string;
  items: Array<{
    inventoryId: string;
    quantity: number;
    mrp: number;
    unitPrice: number;
    packagePrice: number;
    taxPercentage?: number;
  }>;
}

export interface AcceptQuotationRequest {
  poDate?: string;
  pdfUrl?: string;
  externalUrl?: string;
  commission?:number;
  items?: Array<{
    inventoryId: string;
    unitPrice?: number;
    packagePrice?: number;
    quantity?: number;
    mrp?: number;
    taxPercentage?: number;
  }>;
}



export interface UpdateQuotationRequest {
  companyName?: string;
  companyAddress?: string;
  companyContact?: string;
  deliveryTerms?: string;
  deliveryDays?: number;
  totalAmount?: number;
  taxAmount?: number;
  moneyInWords?: string;
  validUntil?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

export interface AcceptQuotationRequest {
  poDate?: string;
  pdfUrl?: string;
  externalUrl?: string;
}

export interface QuotationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuotationResponse {
  data: Quotation[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}