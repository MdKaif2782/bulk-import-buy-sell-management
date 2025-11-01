// app/purchase-order/components/pay-due-bills.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder, Payment } from '@/types';
import { toast } from 'sonner';
import { Calendar, CreditCard, Building, Wallet, TrendingDown } from 'lucide-react';

interface PayDueBillsProps {
  purchaseOrders: PurchaseOrder[];
}

export function PayDueBills({ purchaseOrders }: PayDueBillsProps) {
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash' | 'card' | 'mobile banking'>('bank');
  const [reference, setReference] = useState('');

  const dueOrders = purchaseOrders.filter(order => order.amountDue > 0);
  const selectedOrderData = dueOrders.find(order => order.id === selectedOrder);

  const handlePayment = () => {
    if (!selectedOrderData || paymentAmount <= 0) {
      toast.error('Please select a bill and enter a valid payment amount');
      return;
    }

    if (paymentAmount > selectedOrderData.amountDue) {
      toast.error('Payment amount cannot exceed due amount');
      return;
    }

    // In a real app, you would make an API call here
    toast.success('Payment recorded successfully!', {
      description: `Paid ${paymentAmount.toLocaleString()} BDT to ${selectedOrderData.vendor.name}`,
    });

    // Reset form but keep the order selected
    setPaymentAmount(0);
    setReference('');
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    const order = dueOrders.find(o => o.id === orderId);
    if (order) {
      setPaymentAmount(order.amountDue);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalDue = dueOrders.reduce((sum, order) => sum + order.amountDue, 0);
  const totalPaid = purchaseOrders.reduce((sum, order) => sum + order.amountPaid, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Due Bills List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Due Bills</h2>
          <Badge variant="outline" className="text-sm">
            {dueOrders.length} {dueOrders.length === 1 ? 'Bill' : 'Bills'} Due
          </Badge>
        </div>

        {dueOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No Due Bills</h3>
                <p className="mt-2">All purchase orders have been paid in full.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Accordion 
            type="single" 
            collapsible 
            value={selectedOrder}
            onValueChange={setSelectedOrder}
            className="space-y-4"
          >
            {dueOrders.map((order) => (
              <AccordionItem key={order.id} value={order.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="text-left">
                      <div className="font-semibold">{order.vendor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        PO: {order.id} • Due: {formatCurrency(order.amountDue)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.amountDue > 0 ? "destructive" : "default"}>
                        Due: {formatCurrency(order.amountDue)}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Order Date:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {order.orderDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span>
                        <div className="font-semibold mt-1">{formatCurrency(order.totalAmount)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Paid:</span>
                        <div className="text-green-600 font-semibold mt-1">
                          {formatCurrency(order.amountPaid)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Due:</span>
                        <div className="text-destructive font-bold mt-1">
                          {formatCurrency(order.amountDue)}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleOrderSelect(order.id)}
                      className="w-full"
                      variant={selectedOrder === order.id ? "default" : "outline"}
                    >
                      {selectedOrder === order.id ? 'Selected for Payment' : 'Pay This Bill'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Payment Form & Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Make Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOrderData ? (
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">{selectedOrderData.vendor.name}</div>
                  <div className="text-sm text-muted-foreground">PO: {selectedOrderData.id}</div>
                  <div className="text-lg font-bold text-destructive mt-1">
                    Due: {formatCurrency(selectedOrderData.amountDue)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="paymentAmount" className="flex justify-between">
                      <span>Payment Amount (BDT)</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setPaymentAmount(selectedOrderData.amountDue)}
                      >
                        Pay Full Amount
                      </Button>
                    </Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      min="0"
                      max={selectedOrderData.amountDue}
                      step="0.01"
                      placeholder="Enter payment amount"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Maximum: {formatCurrency(selectedOrderData.amountDue)}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank" className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="cash" className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Cash
                        </SelectItem>
                        <SelectItem value="card" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Card
                        </SelectItem>
                        <SelectItem value="mobile banking" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Mobile Banking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Transaction reference, receipt number, etc."
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">Payment Summary</div>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Current Due:</span>
                        <span>{formatCurrency(selectedOrderData.amountDue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Payment:</span>
                        <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-300 pt-1">
                        <span>Remaining Due:</span>
                        <span className="font-bold">
                          {formatCurrency(selectedOrderData.amountDue - paymentAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={paymentAmount <= 0 || paymentAmount > selectedOrderData.amountDue}
                  size="lg"
                >
                  Record Payment
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedOrder('');
                    setPaymentAmount(0);
                    setReference('');
                  }}
                >
                  Select Different Bill
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Bill Selected</h3>
                <p className="text-sm">Select a bill from the list to make a payment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Due Bills:</span>
              <span className="font-semibold">{dueOrders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount Due:</span>
              <span className="font-semibold text-destructive">
                {formatCurrency(totalDue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Outstanding Balance:</span>
                <span className={totalDue > 0 ? "text-destructive" : "text-green-600"}>
                  {formatCurrency(totalDue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}