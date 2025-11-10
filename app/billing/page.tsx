'use client';

import React, { useState } from 'react';
import { useGetBillsQuery, useGetBillStatsQuery, useGetRecentBillsQuery, useGetAvailableBuyerPOsQuery } from '@/lib/store/api/billApi';
import { Bill, BillStats, AvailableBuyerPO } from '@/types/bill';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { AddPaymentDialog } from '@/components/add-payment';
import { BillCard } from '@/components/bill-card';
import { CreateBillDialog } from '@/components/bill-dialog';
import { BillStatsCards } from '@/components/bill-stat-card';
import { RecentBillsTable } from '@/components/recent-bills-table';

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Bill['status'] | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Fetch data
  const { data: billsData, isLoading: billsLoading, refetch: refetchBills } = useGetBillsQuery({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const { data: stats, isLoading: statsLoading } = useGetBillStatsQuery();
  const { data: recentBills, isLoading: recentLoading } = useGetRecentBillsQuery(5);
  const { data: availablePOs, isLoading: posLoading } = useGetAvailableBuyerPOsQuery();

  const handleCreateBill = () => {
    setIsCreateDialogOpen(true);
  };

  const handleAddPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
  };

  const handleRefresh = () => {
    refetchBills();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
              <p className="text-muted-foreground">Manage bills and payments</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleCreateBill}
                disabled={!availablePOs || availablePOs.length === 0}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Bill
              </Button>
            </div>
          </div>

          {/* Stats */}
          <BillStatsCards stats={stats} loading={statsLoading} />

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search bills by number, vendor, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: Bill['status'] | 'ALL') => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bills Grid */}
          <div className="space-y-4">
            {billsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : billsData?.data && billsData.data.length > 0 ? (
              <div className="space-y-4">
                {billsData.data.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onAddPayment={handleAddPayment}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground">
                    No bills found. {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your search.' : 'Create your first bill.'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {billsData && billsData.meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {billsData.meta.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(billsData.meta.totalPages, page + 1))}
                disabled={page === billsData.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Recent Bills Table */}
          <RecentBillsTable 
            bills={recentBills} 
            loading={recentLoading}
            onAddPayment={handleAddPayment}
          />
        </main>
      </div>

      {/* Dialogs */}
      <CreateBillDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        availablePOs={availablePOs || []}
      />

      <AddPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        bill={selectedBill}
      />
    </div>
  );
}