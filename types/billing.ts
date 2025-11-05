export interface BillItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

export interface Bill {
  id: string
  billNumber: string
  poNumber: string
  companyName: string
  companyEmail: string
  companyAddress: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "overdue" | "paid" | "cancelled"
  items: BillItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  notes: string
  terms: string
  paymentMethod?: string
  paymentDate?: string
  createdFromPO: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  companyName: string
  companyEmail: string
  companyAddress: string
  issueDate: string
  deliveryDate: string
  status: "challan_processed" | "dispatched" | "delivered" | "cancelled"
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    unit: string
  }>
  taxPercentage: number
  shippingCharges: number
  totalAmount: number
  billedAmount: number
  paidAmount: number
  dueAmount: number
}