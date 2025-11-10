import React from 'react';
import { Bill } from '@/types/bill';
import { Calendar, Building, DollarSign, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BillCardProps {
  bill: Bill;
  onAddPayment: (bill: Bill) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onAddPayment }) => {
  const getStatusConfig = (status: Bill['status']) => {
    switch (status) {
      case 'PAID':
        return { icon: CheckCircle, variant: 'default' as const, label: 'Paid' };
      case 'PARTIALLY_PAID':
        return { icon: Clock, variant: 'secondary' as const, label: 'Partially Paid' };
      case 'OVERDUE':
        return { icon: AlertCircle, variant: 'destructive' as const, label: 'Overdue' };
      default:
        return { icon: Clock, variant: 'outline' as const, label: 'Pending' };
    }
  };

  const statusConfig = getStatusConfig(bill.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{bill.billNumber}</h3>
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(bill.billDate), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{bill.buyerPO?.quotation?.companyName || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Total: ৳{bill.totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Due: ৳{bill.dueAmount.toLocaleString()}</span>
              </div>
            </div>

            {bill.buyerPO?.quotation && (
              <div className="text-sm text-muted-foreground">
                <p>
                  PO: {bill.buyerPO.poNumber} • 
                  Contact: {bill.buyerPO.quotation.companyContact || 'N/A'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onAddPayment(bill)}
              disabled={bill.status === 'PAID'}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </div>

        {/* Items Summary */}
        {bill.items && bill.items.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Items ({bill.items.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {bill.items.slice(0, 2).map((item) => (
                <div key={item.id} className="text-sm text-muted-foreground">
                  {item.productDescription} - {item.quantity} × ৳{item.unitPrice}
                </div>
              ))}
              {bill.items.length > 2 && (
                <div className="text-sm text-muted-foreground">
                  +{bill.items.length - 2} more items
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};