import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ExpenseCategory, ExpenseStatus, expenseCategoryLabels, type ExpensesListResponse } from '@/types/expense';
import { useDeleteExpenseMutation } from '@/lib/store/api/expenseApi';
import { Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExpenseTableProps {
  expenses: ExpensesListResponse | undefined;
  loading: boolean;
  onEdit: (expense: any) => void;
  onDeleteSuccess: () => void;
}

export default function ExpenseTable({ expenses, loading, onEdit, onDeleteSuccess }: ExpenseTableProps) {
  const [deleteExpense, { isLoading: deleting }] = useDeleteExpenseMutation();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteExpense(id).unwrap();
      onDeleteSuccess();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const getStatusVariant = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED:
        return 'default';
      case ExpenseStatus.PENDING:
        return 'secondary';
      case ExpenseStatus.REJECTED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<string, string> = {
      [ExpenseCategory.SALARY]: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      [ExpenseCategory.OFFICE_RENT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [ExpenseCategory.ELECTRICITY_BILL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [ExpenseCategory.INTERNET_PHONE_BILL]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      [ExpenseCategory.OFFICE_SUPPLIES]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      [ExpenseCategory.TRANSPORTATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      [ExpenseCategory.FOOD_REFRESHMENTS]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      [ExpenseCategory.EQUIPMENT_MAINTENANCE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [ExpenseCategory.SOFTWARE_SUBSCRIPTIONS]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      [ExpenseCategory.MARKETING_ADVERTISING]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      [ExpenseCategory.EMPLOYEE_ADVANCE]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      [ExpenseCategory.INVESTOR_PAYMENT]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      [ExpenseCategory.PURCHASE_ORDER_PAYMENT]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
      [ExpenseCategory.RAW_MATERIALS]: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      [ExpenseCategory.PACKAGING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [ExpenseCategory.SHIPPING_LOGISTICS]: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      [ExpenseCategory.TAXES_FEES]: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
      [ExpenseCategory.INSURANCE]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
      [ExpenseCategory.PROFESSIONAL_SERVICES]: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
      [ExpenseCategory.MISCELLANEOUS]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Records</CardTitle>
        <CardDescription>
          {expenses?.total || 0} expenses found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.expenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div>
                      <div>{expense.title}</div>
                      {expense.description && (
                        <div className="text-sm text-muted-foreground">
                          {expense.description}
                        </div>
                      )}
                    </div>
                    {expense.isAutoGenerated && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs gap-1 border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                              <Bot className="w-3 h-3" />
                              Auto
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Auto-generated by the system</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>৳{expense.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(getCategoryColor(expense.category))}>
                    {expenseCategoryLabels[expense.category] || expense.category.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {expense.paymentMethod.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(expense.status)}>
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {expense.isAutoGenerated ? (
                    <span className="text-xs text-muted-foreground italic">System managed</span>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleting}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!expenses?.expenses || expenses.expenses.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No expenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}