export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  unit: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  quotationNumber: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  issueDate: string
  deliveryDate: string
  status: "pending" | "confirmed" | "challan_processed" | "dispatched" | "delivered" | "cancelled"
  lineItems: LineItem[]
  taxPercentage: number
  shippingCharges: number
  notes: string
  terms: string
  challanNumber?: string
  dispatchDate?: string
  deliveryDateActual?: string
}

type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHEQUE" | "CARD"
export interface CreatePurchaseOrderPaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  paymentDate?: string;
}

export interface PurchaseOrderPaymentResponseDto {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  purchaseOrderId: string;
  createdAt: Date;
}

export interface PaymentSummaryDto {
  totalAmount: number;
  totalPaid: number;
  remainingDue: number;
  paymentCount: number;
  payments: PurchaseOrderPaymentResponseDto[];
}