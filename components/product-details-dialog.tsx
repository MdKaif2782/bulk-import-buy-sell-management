"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Product, Investor, RecentOrder } from "@/types/product"
import { Calendar, Mail, Phone, FileText } from "lucide-react"

interface ProductDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function ProductDetailsDialog({ isOpen, onClose, product }: ProductDetailsDialogProps) {
  if (!product) return null

  const totalInvestorPercentage = product.investors.reduce((sum, investor) => sum + investor.sharePercentage, 0)
  const selfFundedPercentage = 100 - totalInvestorPercentage

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Product Details - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p className="text-sm">{product.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="text-sm">{product.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-sm">{product.supplier}</p>
              </div>
              {product.poNo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Order No.</label>
                  <p className="text-sm font-mono">{product.poNo}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                <p className="text-sm">
                  {product.quantity} units
                  {product.quantity <= product.reorderLevel && (
                    <Badge variant="destructive" className="ml-2">
                      Low Stock
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reorder Level</label>
                <p className="text-sm">{product.reorderLevel} units</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                <p className="text-sm">${product.unitPrice}</p>
              </div>
            </CardContent>
          </Card>

          {/* Investor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Structure</CardTitle>
              <CardDescription>
                Total investment coverage: {totalInvestorPercentage}%
                {selfFundedPercentage > 0 && `, Self-funded: ${selfFundedPercentage}%`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.investors.length > 0 ? (
                <div className="space-y-4">
                  {product.investors.map((investor) => (
                    <div key={investor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {investor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{investor.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span>{investor.email}</span>
                            <Phone className="w-3 h-3 ml-2" />
                            <span>{investor.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{investor.sharePercentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          ${investor.investmentAmount.toLocaleString()}
                        </p>
                        <Badge variant={investor.status === "active" ? "default" : "secondary"} className="mt-1">
                          {investor.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No investors listed</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          {product.recentOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest company orders for this product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.company}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.quantity} units</p>
                        <p className="text-sm text-muted-foreground">${order.amount.toLocaleString()}</p>
                        <Badge 
                          variant={
                            order.status === "completed" ? "default" : 
                            order.status === "pending" ? "secondary" : "destructive"
                          }
                          className="mt-1"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}