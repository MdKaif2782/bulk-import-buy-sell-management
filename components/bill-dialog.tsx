import React, { useState } from 'react';
import { useCreateBillMutation, useAddPaymentMutation } from '@/lib/store/api/billApi';
import { AvailableBuyerPO } from '@/types/bill';
import { Calendar, Building, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePOs: AvailableBuyerPO[];
}

export const CreateBillDialog: React.FC<CreateBillDialogProps> = ({
  open,
  onOpenChange,
  availablePOs,
}) => {
  const [selectedPO, setSelectedPO] = useState<AvailableBuyerPO | null>(null);
  const [vatRegNo, setVatRegNo] = useState('');
  const [code, setCode] = useState('');
  const [vendorNo, setVendorNo] = useState('');
  const [billDate, setBillDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Payment fields
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [createBill, { isLoading: creatingBill }] = useCreateBillMutation();
  const [addPayment, { isLoading: addingPayment }] = useAddPaymentMutation();

  const isLoading = creatingBill || addingPayment;

  const handlePOSelect = (poId: string) => {
    const po = availablePOs.find(p => p.id === poId);
    setSelectedPO(po || null);
    setPaymentAmount(po?.remainingAmount || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPO) return;

    try {
      // Create the bill
      const billResponse = await createBill({
        buyerPOId: selectedPO.id,
        vatRegNo,
        code,
        vendorNo,
        billDate,
      }).unwrap();

      // Add the first payment
      if (paymentAmount > 0) {
        await addPayment({
          id: billResponse.id,
          data: {
            amount: paymentAmount,
            paymentMethod,
            reference: paymentReference || undefined,
            notes: paymentNotes || undefined,
          },
        }).unwrap();
      }

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  const resetForm = () => {
    setSelectedPO(null);
    setVatRegNo('');
    setCode('');
    setVendorNo('');
    setBillDate(format(new Date(), 'yyyy-MM-dd'));
    setPaymentAmount(0);
    setPaymentMethod('CASH');
    setPaymentReference('');
    setPaymentNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
          <DialogDescription>
            Create a new bill and add the first payment for the selected purchase order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Bill Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po">Purchase Order *</Label>
                <Select value={selectedPO?.id || ''} onValueChange={handlePOSelect} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePOs.map((po) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.poNumber} - {po.quotation.companyName} (৳{po.remainingAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billDate">Bill Date *</Label>
                <Input
                  id="billDate"
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatRegNo">VAT Registration No *</Label>
                <Input
                  id="vatRegNo"
                  type="text"
                  value={vatRegNo}
                  onChange={(e) => setVatRegNo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorNo">Vendor No *</Label>
                <Input
                  id="vendorNo"
                  type="text"
                  value={vendorNo}
                  onChange={(e) => setVendorNo(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Selected PO Details */}
          {selectedPO && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">PO Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPO.quotation.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedPO.poDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Total: ৳{selectedPO.quotation.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Remaining: ৳{selectedPO.remainingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* First Payment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Initial Payment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  min="0"
                  max={selectedPO?.remainingAmount || 0}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} required>
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
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, cheque number, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Additional payment notes..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedPO}
            >
              {isLoading ? 'Creating...' : 'Create Bill & Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};