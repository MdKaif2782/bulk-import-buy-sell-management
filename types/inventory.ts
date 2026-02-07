// types/inventory.ts
export interface Inventory {
  id: string;
  productCode: string;
  barcode?: string;
  productName: string;
  imageUrl?:string
  description?: string;
  quantity: number;
  purchasePrice: number;
  expectedSalePrice: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  createdAt: string;
  updatedAt: string;
  purchaseOrderId: string;
  purchaseOrder?: {
    poNumber: string;
    vendorName: string;
    vendorCountry?: string;
  };
}

export interface UpdateInventoryRequest {
  productName?: string;
  description?: string;
  expectedSalePrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  barcode?: string;
  imageUrl?: string;
}

export interface InventorySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryResponse {
  data: Inventory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LowStockItem extends Inventory {
  purchaseOrder: {
    poNumber: string;
    vendorName: string;
  };
}