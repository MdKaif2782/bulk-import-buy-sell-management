import { useMemo } from 'react';
import {
  useGetDashboardStatsQuery,
  useGetSalesChartDataQuery,
  useGetExpenseChartDataQuery,
  useGetInventoryChartDataQuery,
  useGetQuickStatsQuery,
  useRefreshDashboardMutation
} from '@/lib/store/api/statisticsApi';
import { DateRange } from '@/types/statistics';

// Hook for dashboard with automatic refresh options
export const useDashboardStats = (range?: DateRange, autoRefresh = false) => {
  const { data, error, isLoading, isFetching, refetch } = useGetDashboardStatsQuery(range ?? {}, {
    pollingInterval: autoRefresh ? 30000 : 0, // Auto-refresh every 30 seconds if enabled
    refetchOnMountOrArgChange: true,
  });

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    isEmpty: !isLoading && !data,
  };
};

// Hook for sales chart with formatted data
export const useSalesChart = (range?: DateRange) => {
  const { data, ...queryInfo } = useGetSalesChartDataQuery(range ?? {});

  const formattedData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      // Add any additional formatting or calculations here
      totalSales: data.datasets.reduce((sum, dataset) => 
        sum + dataset.data.reduce((a, b) => a + b, 0), 0
      ),
    };
  }, [data]);

  return {
    ...queryInfo,
    data: formattedData,
    rawData: data,
  };
};

// Hook for expense chart with category breakdown
export const useExpenseChart = (range?: DateRange) => {
  const { data, ...queryInfo } = useGetExpenseChartDataQuery(range ?? {});

  const categoryBreakdown = useMemo(() => {
    if (!data) return null;

    return data.labels.map((label, index) => ({
      category: label,
      amount: data.datasets[0].data[index],
      percentage: 34.2,
      color: Array.isArray(data.datasets[0].backgroundColor) 
        ? data.datasets[0].backgroundColor[index]
        : data.datasets[0].backgroundColor,
    }));
  }, [data]);

  return {
    ...queryInfo,
    data,
    categoryBreakdown,
  };
};

// Hook for quick stats with refresh capability
export const useQuickStats = (range?: DateRange) => {
  const { data, error, isLoading, isFetching, refetch } = useGetQuickStatsQuery(range ?? {}, {
    refetchOnMountOrArgChange: true,
  });

  const statsWithTrends = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      trends: {
        daily: data.todaySales > 0 ? ((data.todaySales - data.weekSales / 7) / (data.weekSales / 7)) * 100 : 0,
        weekly: data.weekSales > 0 ? ((data.weekSales - data.monthSales / 4) / (data.monthSales / 4)) * 100 : 0,
      },
    };
  }, [data]);

  return {
    data: statsWithTrends,
    error,
    isLoading,
    isFetching,
    refetch,
  };
};

// Hook for refreshing all statistics
export const useRefreshStatistics = () => {
  const [refresh, { isLoading, isSuccess }] = useRefreshDashboardMutation();

  const refreshAll = async () => {
    try {
      await refresh().unwrap();
      return true;
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      return false;
    }
  };

  return {
    refreshAll,
    isLoading,
    isSuccess,
  };
};