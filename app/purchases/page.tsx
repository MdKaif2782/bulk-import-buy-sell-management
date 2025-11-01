// app/purchase-order/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PurchaseOrderList } from '@/components/ui/purchase-order-list';
import { PayDueBills } from '@/components/pay-due-bills';
import { CreatePurchaseOrder } from '@/components/create-purchase-order';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, TrendingUp, Package, Clock, CheckCircle } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

export default function PurchaseOrderPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus } = usePurchaseOrders();

  // Calculate stats
  const stats = {
    totalOrders: purchaseOrders.length,
    pendingOrders: purchaseOrders.filter(order => order.status === 'pending').length,
    receivedOrders: purchaseOrders.filter(order => order.status === 'received').length,
    totalAmount: purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalDue: purchaseOrders.reduce((sum, order) => sum + order.amountDue, 0),
    totalPaid: purchaseOrders.reduce((sum, order) => sum + order.amountPaid, 0),
  };

  const handleCreateSuccess = (newOrder: any) => {
    addPurchaseOrder(newOrder);
    setIsCreateDialogOpen(false);
  };

  return (
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
              <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders} pending, {stats.receivedOrders} received
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} BDT</div>
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
                  {stats.totalDue.toLocaleString()} BDT
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
                  {stats.totalPaid.toLocaleString()} BDT
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
                onUpdateStatus={updatePurchaseOrderStatus}
              />
            </TabsContent>

            <TabsContent value="pay-due">
              <PayDueBills purchaseOrders={purchaseOrders} />
            </TabsContent>
          </Tabs>

          {/* Create Purchase Order Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="!max-w-[60vw] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <CreatePurchaseOrder onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}