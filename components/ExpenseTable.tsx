import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ExpenseCategory, ExpenseStatus, type ExpensesListResponse } from '@/types/expense';
import { useDeleteExpenseMutation } from '@/lib/store/api/expenseApi';

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
    const colors = {
      [ExpenseCategory.ELECTRICITY]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [ExpenseCategory.RENT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [ExpenseCategory.TRAVEL]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      [ExpenseCategory.OFFICE_SUPPLIES]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      [ExpenseCategory.MAINTENANCE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [ExpenseCategory.INTERNET]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      [ExpenseCategory.OTHER]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[category];
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
                  <div>
                    <div>{expense.title}</div>
                    {expense.description && (
                      <div className="text-sm text-muted-foreground">
                        {expense.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>${expense.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(getCategoryColor(expense.category))}>
                    {expense.category.replace('_', ' ')}
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