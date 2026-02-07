"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesChart } from "@/hooks/useStatistics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

export function SalesChart() {
  const { data: chartData, isLoading } = useSalesChart();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-destructive">Failed to load sales data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartDataFormatted = chartData.labels.map((label, index) => ({
    period: label,
    corporate: chartData.datasets[0]?.data[index] || 0,
    retail: chartData.datasets[1]?.data[index] || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ৳{(entry.value ?? 0).toLocaleString("en-BD")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
        <CardTitle className="text-lg">Sales Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartDataFormatted}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="period" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="corporate" 
              name="Corporate Sales" 
              fill="var(--color-primary)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="retail" 
              name="Retail Sales" 
              fill="var(--color-green-500)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-lg font-semibold">
              ৳{(chartData.totalSales ?? 0).toLocaleString("en-BD")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Corporate</p>
            <p className="text-lg font-semibold text-primary">
              {(chartData.datasets[0]?.data.reduce((a, b) => a + b, 0) ?? 0).toLocaleString("en-BD")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Retail</p>
            <p className="text-lg font-semibold text-green-500">
              {(chartData.datasets[1]?.data.reduce((a, b) => a + b, 0) ?? 0).toLocaleString("en-BD")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}