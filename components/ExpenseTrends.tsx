import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useGetMonthlyTrendQuery } from '@/lib/store/api/expenseApi';

export default function ExpenseTrends() {
  const { data: monthlyTrend, isLoading: trendLoading } = useGetMonthlyTrendQuery(6);

  if (trendLoading) {
    return <Skeleton className="h-80" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expense Trends</CardTitle>
        <CardDescription>
          Last 6 months of expense data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyTrend?.map((trend) => (
            <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="font-medium">
                {format(new Date(trend.month + '-01'), 'MMMM yyyy')}
              </div>
              <div className="text-2xl font-bold text-primary">
                ${trend.amount.toLocaleString()}
              </div>
            </div>
          ))}
          {(!monthlyTrend || monthlyTrend.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No trend data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}