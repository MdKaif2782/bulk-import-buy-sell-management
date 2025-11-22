import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useGetCategoryChartQuery, useGetCategorySummaryQuery} from '@/lib/store/api/expenseApi';
import { ExpenseCategory } from '@/types/expense';

export default function ExpenseAnalytics() {
  const { data: categoryChart, isLoading: chartLoading } = useGetCategoryChartQuery();
  const { data: categorySummary, isLoading: summaryLoading } = useGetCategorySummaryQuery();

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors = {
      [ExpenseCategory.ELECTRICITY]: 'bg-blue-500',
      [ExpenseCategory.RENT]: 'bg-green-500',
      [ExpenseCategory.TRAVEL]: 'bg-purple-500',
      [ExpenseCategory.OFFICE_SUPPLIES]: 'bg-orange-500',
      [ExpenseCategory.MAINTENANCE]: 'bg-red-500',
      [ExpenseCategory.INTERNET]: 'bg-indigo-500',
      [ExpenseCategory.OTHER]: 'bg-gray-500',
    };
    return colors[category];
  };

  if (chartLoading || summaryLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorySummary?.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", getCategoryColor(item.category))} />
                  <span className="font-medium">{item.category.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">৳{item.total.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.count} expenses ({item.percentage.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Chart Data */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryChart?.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.category.replace('_', ' ')}</span>
                  <span>৳{item.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full", getCategoryColor(item.category))}
                    style={{ width: `${item.percentage.toFixed(2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}