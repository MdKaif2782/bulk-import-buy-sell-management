import React, { useState, useEffect } from 'react';
import { useAddPaymentMutation } from '@/lib/store/api/billApi';
import { Bill } from '@/types/bill';
import { DollarSign, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';
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
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD'>('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [addPayment, { isLoading }] = useAddPaymentMutation();

  // Reset form when dialog opens with a new bill
  useEffect(() => {
    if (open && bill) {
      setAmount(bill.dueAmount);
      setPaymentMethod('CASH');
      setReference('');
      setNotes('');
    }
  }, [open, bill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bill before submit:", bill);
    console.log("Bill ID:", bill?.id);

    
    if (!bill) {
      console.error('No bill selected');
      return;
    }

    try {
      console.log('Submitting payment for bill:', bill.id, {
        amount,
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      });

      await addPayment({
        id: bill.id,
        data: {
          amount,
          paymentMethod,
          reference: reference || undefined
        },
      }).unwrap();

      // Open PDF in new tab
      const pdfUrl = `https://genuine.inovate.it.com/api/bills/${bill.id}/pdf`;
      window.open(pdfUrl, '_blank');

      // Reset form and close dialog
      setAmount(0);
      setPaymentMethod('CASH');
      setReference('');
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setAmount(0);
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
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="0"
              max={bill?.dueAmount || 0}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum: ${bill?.dueAmount.toLocaleString()}
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
              disabled={isLoading || !bill || amount <= 0 || amount > (bill?.dueAmount || 0)}
            >
              {isLoading ? 'Processing...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};