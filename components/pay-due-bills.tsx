// app/purchase-order/components/pay-due-bills.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, CreditCard, Building, Wallet, TrendingDown, Loader2, Receipt, Clock, CheckCircle } from 'lucide-react';
import { 
  useGetDuePurchaseOrdersQuery, 
  useAddPaymentMutation 
} from '@/lib/store/api/purchaseOrdersApi';

interface PaymentPayload {
  purchaseOrderId: string;
  paymentData: {
    amount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE';
    reference?: string;
    notes?: string;
    paymentDate: string;
  };
}

export function PayDueBills() {
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE'>('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch due purchase orders from API
  const { 
    data: dueOrdersResponse, 
    isLoading: isLoadingOrders, 
    error: ordersError,
    refetch: refetchDueOrders 
  } = useGetDuePurchaseOrdersQuery({});
  
  // Add payment mutation
  const [addPayment, { isLoading: isProcessingPayment }] = useAddPaymentMutation();

  const dueOrders = useMemo(() => dueOrdersResponse?.data || [], [dueOrdersResponse]);
  const selectedOrderData = useMemo(() => 
    dueOrders.find(order => order.id === selectedOrder), 
    [dueOrders, selectedOrder]
  );

  // 🔧 CRITICAL FIX: Minimal, serializable payload
  const preparePaymentPayload = useCallback((orderId: string, amount: number): PaymentPayload => {
    const order = dueOrders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    return {
      purchaseOrderId: orderId,
      paymentData: {
        amount: Number(amount), // Ensure it's a number
        paymentMethod,
        reference: reference.trim() || undefined, // Use undefined instead of empty string
        notes: `Payment for PO: ${order.poNumber}`,
        paymentDate: new Date().toISOString(),
      }
    };
  }, [paymentMethod, reference, dueOrders]);

  // 🔧 CRITICAL FIX: Handle payment with proper async flow
  const handlePayment = useCallback(async () => {
    if (!selectedOrderData || paymentAmount <= 0) {
      toast.error('Please select a bill and enter a valid payment amount');
      return;
    }

    if (paymentAmount > selectedOrderData.dueAmount) {
      toast.error('Payment amount cannot exceed due amount');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Processing payment...');

    try {
      // Prepare minimal, flattened payload
      const payload = preparePaymentPayload(selectedOrder, paymentAmount);
      console.log("Payload for due pay: ",payload)
      
      // 🔧 CRITICAL: Await the mutation directly
      await addPayment(payload).unwrap();

      toast.dismiss(loadingToast);
      toast.success('Payment recorded successfully!', {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        description: `Paid ${formatCurrency(paymentAmount)} to ${selectedOrderData.vendorName}`,
      });

      // Reset form
      setSelectedOrder('');
      setPaymentAmount(0);
      setReference('');
      
      // 🔧 CRITICAL: Small delay before refetch to ensure DB consistency
      setTimeout(() => {
        refetchDueOrders();
      }, 500);

    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Payment failed:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.error || 
                          'Payment processing failed. Please try again.';
      
      toast.error('Failed to record payment', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedOrderData, paymentAmount, selectedOrder, preparePaymentPayload, addPayment, refetchDueOrders]);

  // 🔧 CRITICAL FIX: Use useCallback for stable event handlers
  const handleOrderSelect = useCallback((orderId: string) => {
    setSelectedOrder(orderId);
    const order = dueOrders.find(o => o.id === orderId);
    if (order) {
      setPaymentAmount(order.dueAmount);
    }
  }, [dueOrders]);

  const handleFullAmountClick = useCallback(() => {
    if (selectedOrderData) {
      setPaymentAmount(selectedOrderData.dueAmount);
    }
  }, [selectedOrderData]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getPaymentMethodIcon = useCallback((method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return <Building className="w-3 h-3" />;
      case 'CASH': return <Wallet className="w-3 h-3" />;
      case 'CARD': return <CreditCard className="w-3 h-3" />;
      case 'CHEQUE': return <Receipt className="w-3 h-3" />;
      default: return <CreditCard className="w-3 h-3" />;
    }
  }, []);

  const getPaymentMethodLabel = useCallback((method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CASH': return 'Cash';
      case 'CARD': return 'Card';
      case 'CHEQUE': return 'Cheque';
      default: return method;
    }
  }, []);

  // Calculate totals
  const { totalDue, totalPaid, pendingBills } = useMemo(() => {
    const totalDue = dueOrders.reduce((sum, order) => sum + order.dueAmount, 0);
    const totalPaid = dueOrders.reduce((sum, order) => sum + (order.totalAmount - order.dueAmount), 0);
    const pendingBills = dueOrders.length;
    
    return { totalDue, totalPaid, pendingBills };
  }, [dueOrders]);

  // Handle loading state
  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading due bills...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (ordersError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <p className="font-semibold">Failed to load due bills</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check your connection and try again
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetchDueOrders()}
            disabled={isLoadingOrders}
          >
            <Loader2 className={`w-4 h-4 mr-2 ${isLoadingOrders ? 'animate-spin' : 'hidden'}`} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Due Bills List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Due Bills</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and pay your outstanding bills
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingOrders && <Loader2 className="w-4 h-4 animate-spin" />}
            <Badge variant={pendingBills > 0 ? "destructive" : "default"} className="text-sm">
              {pendingBills} {pendingBills === 1 ? 'Bill' : 'Bills'} Due
            </Badge>
          </div>
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
              <AccordionItem 
                key={order.id} 
                value={order.id} 
                className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="text-left">
                      <div className="font-semibold text-lg">
                        {order.vendorName}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        PO: {order.poNumber} • Due: {formatCurrency(order.dueAmount)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.dueAmount > 0 ? "destructive" : "default"}>
                        Due: {formatCurrency(order.dueAmount)}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 border-t border-gray-100">
                  <div className="space-y-6 pt-4">
                    {/* Order Summary */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Order Date:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span>
                        <div className="font-semibold mt-1">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Paid:</span>
                        <div className="text-green-600 font-semibold mt-1">
                          {formatCurrency(order.totalAmount - order.dueAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Due:</span>
                        <div className="text-destructive font-bold mt-1">
                          {formatCurrency(order.dueAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    {order.payments && order.payments.length > 0 && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          <Receipt className="w-4 h-4" />
                          <h4 className="font-medium text-sm">Payment History</h4>
                          <Badge variant="secondary" className="ml-auto">
                            {order.payments.length} payment{order.payments.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {order.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  {getPaymentMethodIcon(payment.paymentMethod)}
                                  <span className="text-xs font-medium">
                                    {getPaymentMethodLabel(payment.paymentMethod)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {formatDate(payment.paymentDate)}
                                </div>
                                {payment.reference && (
                                  <div className="text-xs text-muted-foreground">
                                    Ref: {payment.reference}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(payment.amount)}
                                </div>
                                {payment.notes && (
                                  <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                    {payment.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pay Button */}
                    <Button 
                      onClick={() => handleOrderSelect(order.id)}
                      className="w-full"
                      variant={selectedOrder === order.id ? "default" : "outline"}
                      size="lg"
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
                <div className="p-4 bg-muted rounded-lg border">
                  <div className="font-medium text-lg">
                    {selectedOrderData.vendorName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    PO: {selectedOrderData.poNumber}
                  </div>
                  <div className="text-lg font-bold text-destructive mt-2">
                    Due: {formatCurrency(selectedOrderData.dueAmount)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paymentAmount" className="flex justify-between mb-2">
                      <span>Payment Amount (BDT)</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={handleFullAmountClick}
                        disabled={isProcessing}
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
                      max={selectedOrderData.dueAmount}
                      step="0.01"
                      placeholder="Enter payment amount"
                      className="text-lg"
                      disabled={isProcessing}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      Maximum: {formatCurrency(selectedOrderData.dueAmount)}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod" className="mb-2">Payment Method</Label>
                    <Select 
                      value={paymentMethod} 
                      onValueChange={(value: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE') => setPaymentMethod(value)}
                      disabled={isProcessing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK_TRANSFER" className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="CASH" className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Cash
                        </SelectItem>
                        <SelectItem value="CARD" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Card
                        </SelectItem>
                        <SelectItem value="CHEQUE" className="flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          Cheque
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reference" className="mb-2">Reference Number</Label>
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Transaction reference, receipt number, etc."
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-2">Payment Summary</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Due:</span>
                        <span>{formatCurrency(selectedOrderData.dueAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Payment:</span>
                        <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                        <span className="font-medium">Remaining Due:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(selectedOrderData.dueAmount - paymentAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={
                    paymentAmount <= 0 || 
                    paymentAmount > selectedOrderData.dueAmount ||
                    isProcessing ||
                    isProcessingPayment
                  }
                  size="lg"
                >
                  {isProcessing || isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Record Payment'
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedOrder('');
                    setPaymentAmount(0);
                    setReference('');
                  }}
                  disabled={isProcessing || isProcessingPayment}
                >
                  Select Different Bill
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg mb-2">No Bill Selected</h3>
                <p className="text-sm">Select a bill from the list to make a payment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Due Bills:</span>
              <span className="font-semibold">{pendingBills}</span>
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
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Outstanding Balance:</span>
                <span className={totalDue > 0 ? "text-destructive text-lg" : "text-green-600 text-lg"}>
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