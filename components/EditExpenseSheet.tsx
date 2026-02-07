import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseCategory, PaymentMethod, ExpenseStatus, expenseCategoryLabels, manualExpenseCategories, type UpdateExpenseRequest } from '@/types/expense';
import { useUpdateExpenseMutation } from '@/lib/store/api/expenseApi';

interface EditExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any;
  onSuccess: () => void;
}

export default function EditExpenseSheet({ open, onOpenChange, expense, onSuccess }: EditExpenseSheetProps) {
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();
  const [formData, setFormData] = useState<UpdateExpenseRequest>({
    title: '',
    description: '',
    amount: 0,
    category: ExpenseCategory.MISCELLANEOUS,
    expenseDate: new Date().toISOString(),
    paymentMethod: PaymentMethod.CASH,
    status: ExpenseStatus.PENDING,
    notes: '',
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description || '',
        amount: expense.amount,
        category: expense.category,
        expenseDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod,
        status: expense.status,
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;
    
    try {
      await updateExpense({
        id: expense.id,
        data: formData
      }).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleChange = (key: keyof UpdateExpenseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (!expense) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Expense</SheetTitle>
          <SheetDescription>
            Update the expense details below.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value as ExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {manualExpenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {expenseCategoryLabels[category] || category.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleChange('paymentMethod', value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentMethod).map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-expenseDate">Expense Date</Label>
              <Input
                id="edit-expenseDate"
                type="date"
                value={formData.expenseDate?.split('T')[0]}
                onChange={(e) => handleChange('expenseDate', new Date(e.target.value).toISOString())}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as ExpenseStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ExpenseStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Input
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={updating}>
              {updating ? 'Updating...' : 'Update Expense'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}