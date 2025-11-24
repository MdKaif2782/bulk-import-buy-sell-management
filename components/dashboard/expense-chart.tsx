"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenseChart } from "@/hooks/useStatistics";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  'var(--color-blue-500)',
  'var(--color-green-500)',
  'var(--color-yellow-500)',
  'var(--color-red-500)',
  'var(--color-purple-500)',
  'var(--color-indigo-500)',
  'var(--color-pink-500)',
];

export function ExpenseChart() {
  const { data: chartData, categoryBreakdown, isLoading } = useExpenseChart();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || !categoryBreakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-destructive">Failed to load expense data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p>৳{payload[0].value.toLocaleString("en-BD")}</p>
          <p>{payload[0].payload.percentage?.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <PieChartIcon className="h-5 w-5 mr-2 text-muted-foreground" />
        <CardTitle className="text-lg">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
                label={({ category, percentage }) => 
                  `${category}: ${percentage?.toFixed(1)}%`
                }
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Expense Categories
            </h4>
            {categoryBreakdown.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: category.color || COLORS[index % COLORS.length] 
                    }}
                  />
                  <span className="text-sm">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ৳{category.amount.toLocaleString("en-BD")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Expenses</span>
                <span className="text-lg font-bold text-destructive">
                  ৳{categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString("en-BD")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}