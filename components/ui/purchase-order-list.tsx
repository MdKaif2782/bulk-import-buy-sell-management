// app/purchase-order/components/purchase-order-list.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PurchaseOrder, Product } from '@/types';
import { Package, CheckCircle, Clock, Eye, Building, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  onUpdateStatus: (orderId: string, status: PurchaseOrder['status'], receivedProducts?: Product[]) => void;
}

export function PurchaseOrderList({ purchaseOrders, onUpdateStatus }: PurchaseOrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [receivedProducts, setReceivedProducts] = useState<Product[]>([]);

  const handleMarkReceived = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setReceivedProducts(order.products.map(p => ({ ...p, receivedQuantity: p.quantity, salePrice: p.unitPrice * 1.2 })));
    setIsReceiveDialogOpen(true);
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleConfirmReceive = () => {
    if (!selectedOrder) return;

    // Update products with received quantities and sale prices
    const updatedProducts = receivedProducts.map(product => ({
      ...product,
      quantity: product.receivedQuantity || product.quantity,
      totalPrice: (product.receivedQuantity || product.quantity) * product.unitPrice
    }));

    onUpdateStatus(selectedOrder.id, 'received', updatedProducts);
    setIsReceiveDialogOpen(false);
    setSelectedOrder(null);
    setReceivedProducts([]);
  };

  const updateReceivedProduct = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...receivedProducts];
    const product = updatedProducts[index];
    
    if (field === 'receivedQuantity') {
      product.receivedQuantity = Number(value);
    } else if (field === 'salePrice') {
      product.salePrice = Number(value);
    }
    
    setReceivedProducts(updatedProducts);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <Package className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'received':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {order.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.vendor.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.products.length} products
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {order.orderDate.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span className={order.amountDue > 0 ? "text-destructive font-medium" : "text-green-600"}>
                      {formatCurrency(order.amountDue)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkReceived(order)}
                        disabled={order.status === 'received'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Received
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {purchaseOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Purchase Orders</h3>
              <p className="text-muted-foreground">Create your first purchase order to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order Information</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Order ID:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Order Date:</span>
                      <span>{selectedOrder.orderDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={getStatusVariant(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vendor Information</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-medium">{selectedOrder.vendor.name}</div>
                    <div className="text-sm">{selectedOrder.vendor.contact}</div>
                    <div className="text-sm text-muted-foreground">{selectedOrder.vendor.country}</div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Products</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.quantity} × {formatCurrency(product.unitPrice)}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(product.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.taxPercentage > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({selectedOrder.taxPercentage}%):</span>
                      <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-destructive border-t pt-2">
                    <span>Amount Due:</span>
                    <span>{formatCurrency(selectedOrder.amountDue)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Received Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Confirm Product Receipt
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order ID:</span>
                  <div>{selectedOrder.id}</div>
                </div>
                <div>
                  <span className="font-medium">Vendor:</span>
                  <div>{selectedOrder.vendor.name}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Received Products</h4>
                <div className="space-y-3">
                  {receivedProducts.map((product, index) => (
                    <div key={product.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 border rounded-lg">
                      <div>
                        <Label>Product Name</Label>
                        <Input value={product.name} disabled />
                      </div>
                      <div>
                        <Label>Quantity Received</Label>
                        <Input 
                          type="number" 
                          value={product.receivedQuantity || product.quantity}
                          onChange={(e) => updateReceivedProduct(index, 'receivedQuantity', e.target.value)}
                          min="0"
                          max={product.quantity}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Ordered: {product.quantity}
                        </div>
                      </div>
                      <div>
                        <Label>Unit Cost (BDT)</Label>
                        <Input value={product.unitPrice} disabled />
                      </div>
                      <div>
                        <Label>Sale Price (BDT)</Label>
                        <Input 
                          type="number"
                          value={product.salePrice || product.unitPrice * 1.2}
                          onChange={(e) => updateReceivedProduct(index, 'salePrice', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Product Image</Label>
                        <Input 
                          type="file"
                          accept="image/*"
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsReceiveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmReceive}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Receipt & Add to Inventory
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}