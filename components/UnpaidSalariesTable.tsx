import { format } from 'date-fns';
import { DollarSign, Calendar, User, BadgeDollarSign, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Salary } from '@/types/employee';

interface UnpaidSalariesTableProps {
  unpaidSalaries: Salary[];
  onPaySalary: (salary: Salary) => void;
  isPaying?: boolean;
}

export function UnpaidSalariesTable({ unpaidSalaries, onPaySalary, isPaying = false }: UnpaidSalariesTableProps) {
  const handlePayNow = (salary: Salary) => {
    onPaySalary(salary);
  };

  const totalUnpaid = unpaidSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeDollarSign className="w-5 h-5 text-destructive" />
          Unpaid Salaries - Immediate Action Required
        </CardTitle>
        <CardDescription>
          {unpaidSalaries.length} pending salary payments totaling {totalUnpaid.toFixed(2)} BDT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Gross Salary</TableHead>
              <TableHead>Advance Bal.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unpaidSalaries.map((salary) => (
              <TableRow key={salary.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{salary.employee?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {salary.employee?.employeeId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {salary.employee?.designation}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(salary.year, salary.month - 1), 'MMM yyyy')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-destructive">
                    {(salary.grossSalary ?? salary.netSalary).toFixed(2)} BDT
                  </div>
                </TableCell>
                <TableCell>
                  {(salary as any).employee?.advanceBalance != null && (salary as any).employee.advanceBalance > 0 ? (
                    <div className="flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">
                        {(salary as any).employee.advanceBalance.toLocaleString('en-BD')} BDT
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    PENDING
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handlePayNow(salary)}
                    disabled={isPaying}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Pay Now
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {unpaidSalaries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BadgeDollarSign className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
            <div className="text-lg font-medium text-green-600">All salaries are paid up to date!</div>
            <div className="text-sm">No pending salary payments for the current period.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}