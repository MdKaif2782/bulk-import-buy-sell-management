import React from 'react';
import { BillStats } from '@/types/bill';
import { DollarSign, FileText, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BillStatsCardsProps {
  stats: BillStats | undefined;
  loading: boolean;
}

export const BillStatsCards: React.FC<BillStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Bills',
      value: stats.totalBills,
      icon: FileText,
      description: 'All bills',
    },
    {
      title: 'Total Amount',
      value: `৳${stats.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total billed amount',
    },
    {
      title: 'Total Due',
      value: `৳${stats.totalDue.toLocaleString()}`,
      icon: Clock,
      description: 'Outstanding amount',
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate.toFixed(2)}%`,
      icon: TrendingUp,
      description: 'Payment collection rate',
    },
  ];

  const statusCards = [
    {
      title: 'Pending',
      value: stats.pendingBills,
      icon: Clock,
    },
    {
      title: 'Partially Paid',
      value: stats.partiallyPaidBills,
      icon: AlertCircle,
    },
    {
      title: 'Paid',
      value: stats.paidBills,
      icon: CheckCircle,
    },
    {
      title: 'Overdue',
      value: stats.overdueBills,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};