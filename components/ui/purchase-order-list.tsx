'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { POStatus, PurchaseOrder } from '@/types/purchaseOrder';
import { Package, CheckCircle, Clock, Eye, Building, Calendar, Loader2 } from 'lucide-react';
import { useMarkAsReceivedMutation } from '@/lib/store/api/purchaseOrdersApi';

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  onUpdateStatus: (orderId: string, status: POStatus) => void;
  isLoading?: boolean;
}

export function PurchaseOrderList({ purchaseOrders, onUpdateStatus, isLoading = false }: PurchaseOrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [markAsReceived, { isLoading: isMarkingReceived }] = useMarkAsReceivedMutation();

  const handleMarkReceived = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsReceiveDialogOpen(true);
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!selectedOrder) return;

    try {
      // Create received items data - in a real app, you'd get this from form inputs
      const receivedItems = selectedOrder.items.map(item => ({
        purchaseOrderItemId: item.id,
        receivedQuantity: item.quantity, // Default to full quantity
        expectedSalePrice: item.unitPrice * 1.2, // Default 20% markup
      }));

      await markAsReceived({
        id: selectedOrder.id,
        data: { receivedItems }
      }).unwrap();
      
      setIsReceiveDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to mark as received:', error);
    }
  };

  const getStatusIcon = (status: POStatus) => {
    switch (status) {
      case POStatus.RECEIVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case POStatus.CANCELLED:
        return <Package className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: POStatus) => {
    switch (status) {
      case POStatus.RECEIVED:
        return 'default';
      case POStatus.CANCELLED:
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

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
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Investors</TableHead>
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
                      {order.poNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.vendorName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.items.length} items
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {formatDate(order.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span className={order.dueAmount > 0 ? "text-destructive font-medium" : "text-green-600"}>
                      {formatCurrency(order.dueAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant={"default"}>
                        {order.investments.length > 0 
                          ? `${order.investments.length} investors` 
                          : "Self Funded"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
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
                        disabled={order.status === POStatus.RECEIVED || order.status === POStatus.CANCELLED}
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
                      <span className="text-sm">PO Number:</span>
                      <span className="font-medium">{selectedOrder.poNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Order Date:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={getStatusVariant(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Payment Type:</span>
                      <span>{selectedOrder.paymentType}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vendor Information</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-medium">{selectedOrder.vendorName}</div>
                    <div className="text-sm">{selectedOrder.vendorContact}</div>
                    <div className="text-sm text-muted-foreground">{selectedOrder.vendorCountry}</div>
                    <div className="text-sm text-muted-foreground">{selectedOrder.vendorAddress}</div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Products</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.description && ` - ${item.description}`}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.investments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Investments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.investments.map((investment) => (
                      <div key={investment.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{investment.investor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Profit Share: {investment.profitPercentage}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(investment.investmentAmount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {investment.isFullInvestment ? 'Full Investment' : 'Partial Investment'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount - selectedOrder.taxAmount)}</span>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
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
                    <span className="text-green-600">
                      {formatCurrency(selectedOrder.totalAmount - selectedOrder.dueAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-destructive border-t pt-2">
                    <span>Amount Due:</span>
                    <span>{formatCurrency(selectedOrder.dueAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Received Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="!max-w-[70vw]">
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
                  <span className="font-medium">PO Number:</span>
                  <div>{selectedOrder.poNumber}</div>
                </div>
                <div>
                  <span className="font-medium">Vendor:</span>
                  <div>{selectedOrder.vendorName}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Received Products</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 border rounded-lg">
                      <div>
                        <Label>Product Name</Label>
                        <Input value={item.productName} disabled />
                      </div>
                      <div>
                        <Label>Quantity Received</Label>
                        <Input 
                          type="number" 
                          defaultValue={item.quantity}
                          min="0"
                          max={item.quantity}
                          disabled
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Ordered: {item.quantity}
                        </div>
                      </div>
                      <div>
                        <Label>Unit Cost (BDT)</Label>
                        <Input value={item.unitPrice} disabled />
                      </div>
                      <div>
                        <Label>Sale Price (BDT)</Label>
                        <Input 
                          type="number"
                          defaultValue={item.unitPrice * 1.2}
                          min="0"
                          step="0.01"
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Total Value</Label>
                        <Input 
                          value={formatCurrency(item.totalPrice)}
                          disabled
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Note</div>
                  <div className="mt-1">
                    Marking this purchase order as received will:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Update the purchase order status to "RECEIVED"</li>
                      <li>Add all products to inventory with the specified sale prices</li>
                      <li>Generate product codes and barcodes for inventory tracking</li>
                      <li>Make products available for quotations and sales</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsReceiveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmReceive}
                  disabled={isMarkingReceived}
                >
                  {isMarkingReceived ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Receipt & Add to Inventory
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}