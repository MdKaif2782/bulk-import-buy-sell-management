import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SalaryStatistics } from '@/types/employee';

interface StatisticsSectionProps {
  statistics: SalaryStatistics;
}

export function StatisticsSection({ statistics }: StatisticsSectionProps) {
  const { currentMonth, yearToDate, allTime, employeeStats } = statistics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Month Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Current Month</CardTitle>
          <CardDescription>
            {new Date(currentMonth.year, currentMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Paid:</span>
              <span className="font-medium text-green-600">{currentMonth.totalPaid.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pending:</span>
              <span className="font-medium text-yellow-600">{currentMonth.totalPending.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Employees:</span>
              <Badge variant="outline">
                {currentMonth.paidEmployees}/{currentMonth.totalEmployees}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year to Date Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
          <CardDescription>
            {currentMonth.year} Performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Paid:</span>
              <span className="font-medium">{yearToDate.totalPaid.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Payments:</span>
              <Badge variant="outline">{yearToDate.totalPayments}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Months:</span>
              <span className="text-sm">{yearToDate.totalMonths}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Time Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">All Time</CardTitle>
          <CardDescription>
            Historical Data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Paid:</span>
              <span className="font-medium">{allTime.totalPaid.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Payments:</span>
              <Badge variant="outline">{allTime.totalPayments}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Since inception
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Employees</CardTitle>
          <CardDescription>
            Current Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Active:</span>
              <Badge variant="default">{employeeStats.totalActive}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Paid This Month:</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {employeeStats.paidThisMonth}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pending Payment:</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {employeeStats.pendingThisMonth}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}