import React, { useState, useEffect } from 'react';
import { useAddPaymentMutation } from '@/lib/store/api/billApi';
import { Bill } from '@/types/bill';
import { DollarSign, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
}

export const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
  open,
  onOpenChange,
  bill,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD'>('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [addPayment, { isLoading }] = useAddPaymentMutation();

  // Derived: parse amount safely, fallback to 0 if invalid
  const amount = parseFloat(amountStr) || 0;
  const isAmountValid = !isNaN(parseFloat(amountStr)) && amount >= 0.01 && amount <= (bill?.dueAmount || 0);
  const VALID_METHODS = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD'] as const;
  const isMethodValid = VALID_METHODS.includes(paymentMethod);

  // Reset form when dialog opens with a new bill
  useEffect(() => {
    if (open && bill) {
      setAmountStr(String(bill.dueAmount));
      setPaymentMethod('CASH');
      setReference('');
      setNotes('');
    }
  }, [open, bill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bill || !bill.id) {
      toast.error('No bill selected');
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount < 0.01) {
      toast.error('Please enter a valid payment amount (minimum 0.01)');
      return;
    }
    if (parsedAmount > bill.dueAmount) {
      toast.error(`Payment amount cannot exceed due amount (৳${bill.dueAmount.toLocaleString()})`);
      return;
    }

    // Validate payment method
    if (!VALID_METHODS.includes(paymentMethod)) {
      toast.error('Please select a valid payment method');
      return;
    }

    const payload = {
      amount: parsedAmount,
      paymentMethod,
      reference: reference?.trim() || undefined,
    };

    try {
      console.log('Submitting payment for bill:', bill.id, payload);

      await addPayment({
        id: bill.id,
        data: payload,
      }).unwrap();

      // Open PDF in new tab
      const pdfUrl = `https://genuine.inovate.it.com/api/bills/${bill.id}/pdf`;
      window.open(pdfUrl, '_blank');

      toast.success('Payment recorded successfully!');

      // Reset form and close dialog
      setAmountStr('');
      setPaymentMethod('CASH');
      setReference('');
      setNotes('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to add payment:', error);
      const msg = error?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to add payment');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setAmountStr('');
      setPaymentMethod('CASH');
      setReference('');
      setNotes('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Add a payment to the selected bill.
          </DialogDescription>
        </DialogHeader>

        {/* Bill Summary */}
        {bill && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bill Number:</span>
                <span className="font-medium">{bill.billNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Company:</span>
                <span>{bill.buyerPO?.quotation?.companyName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span>৳{bill.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due Amount:</span>
                <span className="font-medium text-green-600">৳{bill.dueAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              min="0.01"
              max={bill?.dueAmount || 0}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum: ৳{bill?.dueAmount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD') => setPaymentMethod(value)} 
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction ID, cheque number, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional payment notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !bill || !isAmountValid || !isMethodValid}
            >
              {isLoading ? 'Processing...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};