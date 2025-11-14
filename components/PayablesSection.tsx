import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PayablesResponse } from '@/types/employee';

interface PayablesSectionProps {
  payables: PayablesResponse;
}

export function PayablesSection({ payables }: PayablesSectionProps) {
  const monthName = format(new Date(payables.year, payables.month - 1), 'MMMM yyyy');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Unpaid Salaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Unpaid Salaries</CardTitle>
          <CardDescription>
            Pending salary payments for {monthName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Unpaid:</span>
              <span className="font-bold text-destructive">
                {payables.unpaid.reduce((sum, salary) => sum + salary.netSalary, 0).toFixed(2)} BDT
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.unpaid.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{salary.employee?.name}</div>
                        <div className="text-sm text-muted-foreground">{salary.employee?.designation}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {salary.netSalary.toFixed(2)} BDT
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {payables.unpaid.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No unpaid salaries for {monthName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paid Salaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-600">Paid Salaries</CardTitle>
          <CardDescription>
            Completed salary payments for {monthName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid:</span>
              <span className="font-bold text-green-600">
                {payables.paid.reduce((sum, salary) => sum + salary.netSalary, 0).toFixed(2)} BDT
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Paid Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.paid.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{salary.employee?.name}</div>
                        <div className="text-sm text-muted-foreground">{salary.employee?.designation}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {salary.netSalary.toFixed(2)} BDT
                    </TableCell>
                    <TableCell>
                      {salary.paidDate ? format(new Date(salary.paidDate), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {payables.paid.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No paid salaries for {monthName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}