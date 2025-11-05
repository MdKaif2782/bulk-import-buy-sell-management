export interface Investor {
  id: string
  name: string
  email: string
  phone: string
  sharePercentage: number
  investmentAmount: number
  joinDate: string
  status: "active" | "inactive"
  notes: string
}

export interface RecentOrder {
  id: string
  company: string
  orderDate: string
  quantity: number
  status: "pending" | "completed" | "cancelled"
  amount: number
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  supplier: string
  poNo?: string
  investors: Investor[]
  recentOrders: RecentOrder[]
}