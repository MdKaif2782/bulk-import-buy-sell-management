import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { useGetExpenseStatisticsQuery, useGetCategorySummaryQuery } from '@/lib/store/api/expenseApi';

export default function ExpenseStatistics() {
  const { data: statistics, isLoading: statsLoading } = useGetExpenseStatisticsQuery();
  const { data: categorySummary, isLoading: summaryLoading } = useGetCategorySummaryQuery();

  if (statsLoading || summaryLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ৳{statistics?.total?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics?.transactionCount} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ৳{statistics?.approved?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Average: ৳{statistics?.average?.toFixed(2) || '0.00'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            ৳{statistics?.pending?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting approval
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {categorySummary?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Active categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
}