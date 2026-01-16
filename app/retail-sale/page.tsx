'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, Plus, Eye, Trash2, ShoppingCart, TrendingUp, 
  DollarSign, Calendar, CreditCard, Package, AlertCircle 
} from 'lucide-react';
import { 
  useGetRetailSalesQuery, 
  useDeleteRetailSaleMutation,
  useGetRetailAnalyticsQuery 
} from '@/lib/store/api/retailSaleApi';
import { CreateRetailSaleDialog } from '@/components/retail-sale-dialog';
import { RetailSaleDetailsDialog } from '@/components/retail-sale-details-dialog';
import { useToast } from '@/components/ui/use-toast';
import { RetailSale, PaymentMethod } from '@/types/retailSale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RetailSalesPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    paymentMethod: '' as PaymentMethod | '',
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<RetailSale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

  const { data: salesResponse, isLoading, refetch } = useGetRetailSalesQuery(searchParams);
  const { data: analytics } = useGetRetailAnalyticsQuery({
    startDate: searchParams.startDate || undefined,
    endDate: searchParams.endDate || undefined,
  });
  const [deleteSale, { isLoading: isDeleting }] = useDeleteRetailSaleMutation();

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleViewDetails = (sale: RetailSale) => {
    setSelectedSale(sale);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (saleId: string) => {
    setSaleToDelete(saleId);
  };

  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;

    try {
      await deleteSale(saleToDelete).unwrap();
      toast({
        title: "Success",
        description: "Sale deleted and inventory restored successfully",
        variant: "default",
      });
      setSaleToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete sale",
        variant: "destructive",
      });
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const config = {
      CASH: { label: "Cash", variant: "default" as const },
      CARD: { label: "Card", variant: "secondary" as const },
      BANK_TRANSFER: { label: "Bank Transfer", variant: "outline" as const },
      CHEQUE: { label: "Cheque", variant: "outline" as const },
    };
    const { label, variant } = config[method] || config.CASH;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳ ${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-8 h-8" />
                Retail Sales
              </h1>
              <p className="text-muted-foreground mt-1">
                Point of Sale system for direct inventory sales
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Sale
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.summary.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.summary.totalTransactions} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  Average Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.summary.averageTransactionValue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  Items Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.summary.totalItemsSold}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total quantity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  Cash Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.summary.cashSales)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.paymentMethodBreakdown.find(p => p.paymentMethod === 'CASH')?.percentage.toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by sale number or customer..."
                  value={searchParams.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div>
                <Input
                  type="date"
                  value={searchParams.startDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                  placeholder="Start Date"
                />
              </div>

              <div>
                <Input
                  type="date"
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                  placeholder="End Date"
                />
              </div>

              <div>
                <Select
                  value={searchParams.paymentMethod || "ALL"}
                  onValueChange={(value) => setSearchParams(prev => ({ 
                    ...prev, 
                    paymentMethod: value === "ALL" ? '' : value as PaymentMethod | '', 
                    page: 1 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Sales History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading sales...</p>
                </div>
              </div>
            ) : !salesResponse || salesResponse.sales.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">No sales found</p>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first sale
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Sale
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold">Sale #</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Payment</th>
                        <th className="pb-3 font-semibold text-right">Amount</th>
                        <th className="pb-3 font-semibold text-right">Items</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesResponse.sales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">
                            <p className="font-mono font-medium text-blue-600">{sale.saleNumber}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm">{formatDate(sale.saleDate)}</p>
                          </td>
                          <td className="py-3">
                            {sale.customerName ? (
                              <div>
                                <p className="font-medium">{sale.customerName}</p>
                                {sale.customerPhone && (
                                  <p className="text-sm text-muted-foreground">{sale.customerPhone}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">Walk-in</p>
                            )}
                          </td>
                          <td className="py-3">
                            {getPaymentMethodBadge(sale.paymentMethod)}
                          </td>
                          <td className="py-3 text-right">
                            <p className="font-semibold text-green-600">{formatCurrency(sale.totalAmount)}</p>
                            {sale.discount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Discount: {formatCurrency(sale.discount)}
                              </p>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <Badge variant="outline">{sale.items.length} items</Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(sale)}
                                className="gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(sale.id)}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {salesResponse.pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {salesResponse.sales.length} of {salesResponse.pagination.total} sales
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={searchParams.page === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: salesResponse.pagination.pages }, (_, i) => i + 1)
                          .filter(page => {
                            const current = searchParams.page;
                            return page === 1 || 
                                   page === salesResponse.pagination.pages || 
                                   (page >= current - 1 && page <= current + 1);
                          })
                          .map((page, idx, arr) => (
                            <div key={page}>
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="px-2">...</span>
                              )}
                              <Button
                                variant={page === searchParams.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSearchParams(prev => ({ ...prev, page }))}
                              >
                                {page}
                              </Button>
                            </div>
                          ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={searchParams.page >= salesResponse.pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateRetailSaleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <RetailSaleDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        sale={selectedSale}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the sale and restore the inventory quantities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}