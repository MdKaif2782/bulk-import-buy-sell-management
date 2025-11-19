'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Components
import ExpenseStatistics from '@/components/ExpenseStatistics';
import ExpenseFilters from '@/components/ExpenseFilters';
import ExpenseTable from '@/components/ExpenseTable';
import ExpenseAnalytics from '@/components/ExpenseAnalytics';
import ExpenseTrends from '@/components/ExpenseTrends';
import CreateExpenseDialog from '@/components/CreateExpenseDialog';
import EditExpenseSheet from '@/components/EditExpenseSheet';

// API Hooks
import { useGetExpensesQuery } from '@/lib/store/api/expenseApi';
import type { GetExpensesParams } from '@/types/expense';
import { Sidebar } from '@/components/sidebar';

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [filters, setFilters] = useState<GetExpensesParams>({
    skip: 0,
    take: 10,
    search: '',
    category: undefined,
    startDate: undefined,
    endDate: undefined,
    status: undefined,
  });

  const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useGetExpensesQuery(filters);

  const handleEditClick = (expense: any) => {
    setSelectedExpense(expense);
    setIsEditSheetOpen(true);
  };

  const handleSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditSheetOpen(false);
    setSelectedExpense(null);
    refetchExpenses();
  };

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar/>
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Manage and track your organization&apos;s expenses
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Statistics */}
        <ExpenseStatistics />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="list">Expense List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Expense List Tab */}
          <TabsContent value="list" className="space-y-4">
            <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
            <ExpenseTable
              expenses={expensesData}
              loading={expensesLoading}
              onEdit={handleEditClick}
              onDeleteSuccess={refetchExpenses}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <ExpenseAnalytics />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <ExpenseTrends />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateExpenseDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleSuccess}
        />

        <EditExpenseSheet
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          expense={selectedExpense}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}