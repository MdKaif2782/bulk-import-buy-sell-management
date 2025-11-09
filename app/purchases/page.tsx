'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PurchaseOrderList } from '@/components/ui/purchase-order-list';
import { PayDueBills } from '@/components/pay-due-bills';
import { CreatePurchaseOrder } from '@/components/create-purchase-order';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, TrendingUp, Package, Clock, CheckCircle } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderStatsQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
} from '@/lib/store/api/purchaseOrdersApi';
import { useGetInvestorsQuery } from '@/lib/store/api/investorsApi';
import { POStatus, PaymentType } from '@/types/purchaseOrder';

export default function PurchaseOrderPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // API Queries
  const { data: purchaseOrdersData, isLoading: isLoadingOrders, refetch: refetchOrders } = useGetPurchaseOrdersQuery();
  const { data: statsData, isLoading: isLoadingStats } = useGetPurchaseOrderStatsQuery();
  const { data: investorsData, isLoading: isLoadingInvestors } = useGetInvestorsQuery();

  // API Mutations
  const [createPurchaseOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const [updatePurchaseOrderStatus] = useUpdatePurchaseOrderStatusMutation();

  const purchaseOrders = purchaseOrdersData?.data || [];
  const investors = investorsData?.investors || [];
  const stats = statsData || {
    total: 0,
    pending: 0,
    ordered: 0,
    shipped: 0,
    received: 0,
    cancelled: 0,
    totalInvestment: 0,
    pendingInvestment: 0,
  };

  const handleCreateSuccess = async (newOrderData: any) => {
    try {
      await createPurchaseOrder(newOrderData).unwrap();
      setIsCreateDialogOpen(false);
      refetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: POStatus) => {
    try {
      await updatePurchaseOrderStatus({ id: orderId, status: newStatus }).unwrap();
      refetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Calculate derived stats for display
  const displayStats = {
    totalOrders: stats.total,
    pendingOrders: stats.pending,
    receivedOrders: stats.received,
    totalAmount: purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalDue: purchaseOrders.reduce((sum, order) => sum + order.dueAmount, 0),
    totalPaid: purchaseOrders.reduce((sum, order) => sum + (order.totalAmount - order.dueAmount), 0),
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="flex min-h-screen bg-background flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Purchase Order Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your purchase orders and vendor payments
                </p>
              </div>
              {activeTab === 'orders' && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={isLoadingInvestors}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {displayStats.pendingOrders} pending, {displayStats.receivedOrders} received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.totalAmount.toLocaleString()} BDT</div>
                  <p className="text-xs text-muted-foreground">
                    All purchase orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {displayStats.totalDue.toLocaleString()} BDT
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all vendors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {displayStats.totalPaid.toLocaleString()} BDT
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total payments made
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Purchase Orders
                </TabsTrigger>
                <TabsTrigger value="pay-due" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pay Due Bills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <PurchaseOrderList
                  purchaseOrders={purchaseOrders}
                  onUpdateStatus={handleUpdateStatus}
                  isLoading={isLoadingOrders}
                />
              </TabsContent>

              <TabsContent value="pay-due">
                <PayDueBills/>
              </TabsContent>
            </Tabs>

            {/* Create Purchase Order Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent className="!max-w-[60vw] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>

                <CreatePurchaseOrder
                  onSuccess={handleCreateSuccess}
                  investors={investors}
                  isLoading={isCreating || isLoadingInvestors}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}