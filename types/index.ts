// types/index.ts
export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  salePrice?: number;
  image?: string;
}

export interface InvestorPayment {
  investorId: string;
  amount: number;
  paymentMethod: 'bank' | 'cash' | 'card' | 'mobile banking';
  reference?: string;
  paymentDate: Date;
}

export interface Investor {
  id: string;
  name: string;
  investmentAmount: number;
  profitShare: number;
  amountPaid: number;
  amountDue: number;
  payments: InvestorPayment[];
}

export interface Vendor {
  id: string;
  name: string;
  country: string;
  contact: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface PurchaseOrder {
  id: string;
  vendor: Vendor;
  products: Product[];
  investors: Investor[];
  taxPercentage: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  orderDate: Date;
  payments: Payment[]
  status: 'pending' | 'received' | 'cancelled';
  paymentMethod?: 'bank' | 'cash' | 'card' | 'mobile banking';
  paymentReference?: string;
  receivedDate?: Date;
}

export interface Payment {
  id: string;
  purchaseOrderId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank' | 'cash' | 'card' | 'mobile banking';
  reference?: string;
}

