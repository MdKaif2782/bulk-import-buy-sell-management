export interface ChallanItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  deliveredQuantity?: number
}

export interface Challan {
  id: string
  challanNumber: string
  poNumber: string
  companyName: string
  companyAddress: string
  issueDate: string
  deliveryDate: string
  status: "draft" | "dispatched" | "in_transit" | "delivered" | "cancelled"
  items: ChallanItem[]
  vehicleNumber?: string
  driverName?: string
  driverPhone?: string
  notes: string
  receivedBy?: string
  receivedDate?: string
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
  status: "confirmed" | "challan_processed" | "dispatched" | "delivered"
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    unit: string
  }>
  taxPercentage: number
  shippingCharges: number
}