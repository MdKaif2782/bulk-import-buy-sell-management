import React from 'react';
import { Bill } from '@/types/bill';
import { Calendar, Building, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentBillsTableProps {
  bills: Bill[] | undefined;
  loading: boolean;
  onAddPayment: (bill: Bill) => void;
}

export const RecentBillsTable: React.FC<RecentBillsTableProps> = ({
  bills,
  loading,
  onAddPayment,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>Latest bill transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bills || bills.length === 0) return null;

  const getStatusVariant = (status: Bill['status']) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'PARTIALLY_PAID':
        return 'secondary';
      case 'OVERDUE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bills</CardTitle>
        <CardDescription>Latest bill transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Number</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.billNumber}</TableCell>
                <TableCell>{bill.buyerPO?.quotation?.companyName || 'N/A'}</TableCell>
                <TableCell>{format(new Date(bill.billDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="font-medium">
                  ৳{bill.totalAmount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={bill.dueAmount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                    ৳{bill.dueAmount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(bill.status)}>
                    {bill.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => onAddPayment(bill)}
                    disabled={bill.status === 'PAID'}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Payment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};