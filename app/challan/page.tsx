'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useGetPendingBPOsQuery, 
  useGetDispatchSummaryQuery, 
  useGetAllChallansQuery,
  useMarkAsDispatchedMutation,
  useUpdateChallanStatusMutation,
  useCreateChallanMutation
} from '@/lib/store/api/challanApi'
import { format } from 'date-fns';
import { 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Download,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChallanStatus, CreateChallanDto } from '@/types/challan';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/sidebar';
import { toast } from 'sonner';

// BDT Currency formatter
const formatBDT = (amount: number) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ChallansPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBPO, setSelectedBPO] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // API Calls
  const { 
    data: pendingBPOs, 
    isLoading: pendingLoading, 
    refetch: refetchPending 
  } = useGetPendingBPOsQuery();
  
  const { 
    data: dispatchSummary, 
    isLoading: summaryLoading 
  } = useGetDispatchSummaryQuery();
  
  const { 
    data: challans, 
    isLoading: challansLoading,
    refetch: refetchChallans
  } = useGetAllChallansQuery({
    page: 1,
    limit: 20,
  });
  
  const [markAsDispatched, { isLoading: dispatching }] = useMarkAsDispatchedMutation();
  const [updateChallanStatus] = useUpdateChallanStatusMutation();
  const [createChallan, { isLoading: creating }] = useCreateChallanMutation();
const handleMarkAsDispatched = async (bpoId: string) => {
  try {
    await markAsDispatched({ buyerPurchaseOrderId: bpoId }).unwrap();
    toast.success('BPO marked as dispatched successfully');
    refetchPending();
    refetchChallans();
  } catch (error) {
    toast.error('Failed to mark as dispatched');
  }
};

const handleCreateChallan = async (data: CreateChallanDto) => {
  try {
    await createChallan(data).unwrap();
    toast.success('Challan created successfully');
    setSelectedBPO(null); // Close the dialog
    refetchPending();
    refetchChallans();
  } catch (error: any) {
    toast.error(error?.data?.message || 'Failed to create challan');
  }
};

const handleStatusUpdate = async (challanId: string, status: ChallanStatus) => {
  try {
    await updateChallanStatus({ id: challanId, data: { status } }).unwrap();
    toast.success('Challan status updated successfully');
    refetchChallans();
  } catch (error: any) {
    toast.error(error?.data?.message || 'Failed to update status');
  }
};

  useEffect(()=>{
    console.log(pendingBPOs)
  },[pendingBPOs])

  return (
        <div className="flex min-h-screen bg-background">
          <Sidebar />
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challan Management</h1>
          <p className="text-muted-foreground">
            Manage purchase order dispatches and delivery challans
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              refetchPending();
              refetchChallans();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && dispatchSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total BPOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dispatchSummary.totalBPOs}</div>
              <p className="text-xs text-muted-foreground">
                Purchase orders from buyers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fully Dispatched</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dispatchSummary.fullyDispatched}
              </div>
              <p className="text-xs text-muted-foreground">
                {((dispatchSummary.fullyDispatched / dispatchSummary.totalBPOs) * 100 || 0).toFixed(1)}% completion
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Dispatched</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dispatchSummary.totalItemsDispatched} / {dispatchSummary.totalItemsOrdered}
              </div>
              <p className="text-xs text-muted-foreground">
                {((dispatchSummary.totalItemsDispatched / dispatchSummary.totalItemsOrdered) * 100 || 0).toFixed(1)}% dispatched
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBDT(dispatchSummary.totalValueDispatched)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBDT(dispatchSummary.totalValueOrdered)} ordered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="pending">
            <Package className="h-4 w-4 mr-2" />
            Pending BPOs
            {pendingBPOs && pendingBPOs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingBPOs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="challans">
            <Truck className="h-4 w-4 mr-2" />
            All Challans
          </TabsTrigger>
          <TabsTrigger value="summary">
            <CheckCircle className="h-4 w-4 mr-2" />
            Dispatch Summary
          </TabsTrigger>
        </TabsList>

        {/* Pending BPOs Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Purchase Orders</CardTitle>
              <CardDescription>
                BPOs that need challans or dispatch
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingBPOs && pendingBPOs.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Ordered</TableHead>
                        <TableHead>Dispatched</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBPOs.map((bpo) => (
                        <TableRow key={bpo.id}>
                          <TableCell className="font-medium">{bpo.poNumber}</TableCell>
                          <TableCell>{bpo.companyName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{bpo.totalQuantity}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={bpo.dispatchedQuantity > 0 ? "secondary" : "outline"}>
                              {bpo.dispatchedQuantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              bpo.remainingQuantity > 0 
                                ? "destructive" 
                                : "outline"
                            }>
                              {bpo.remainingQuantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {bpo.items.length} item{bpo.items.length !== 1 ? 's' : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="!max-w-[75vw] max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>BPO Details</DialogTitle>
                                    <DialogDescription>
                                      {bpo.poNumber} - {bpo.companyName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Total Ordered</Label>
                                        <div className="text-lg font-semibold">
                                          {bpo.totalQuantity} items
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Remaining to Dispatch</Label>
                                        <div className="text-lg font-semibold">
                                          {bpo.remainingQuantity} items
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div>
                                      <Label>Order Items</Label>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Ordered</TableHead>
                                            <TableHead>Available</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {bpo.items.map((item) => (
                                            <TableRow key={item.inventoryId}>
                                              <TableCell>
                                                <div>
                                                  <div className="font-medium">{item.productName}</div>
                                                  <div className="text-sm text-muted-foreground">
                                                    {item.productCode}
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell>{item.orderedQuantity}</TableCell>
                                              <TableCell>
                                                <Badge 
                                                  variant={
                                                    item.availableQuantity >= item.orderedQuantity 
                                                      ? "outline" 
                                                      : "destructive"
                                                  }
                                                >
                                                  {item.availableQuantity}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{formatBDT(item.unitPrice)}</TableCell>
                                              <TableCell>
                                                {item.availableQuantity >= item.orderedQuantity ? (
                                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    In Stock
                                                  </Badge>
                                                ) : (
                                                  <Badge variant="outline" className="bg-red-50 text-red-700">
                                                    Low Stock
                                                  </Badge>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedBPO(bpo.id)}
                                    >
                                      Create Partial Challan
                                    </Button>
                                    <Button
                                      onClick={() => handleMarkAsDispatched(bpo.id)}
                                      disabled={dispatching}
                                    >
                                      {dispatching ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Dispatching...
                                        </>
                                      ) : (
                                        <>
                                          <Truck className="h-4 w-4 mr-2" />
                                          Mark as Dispatched
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No pending purchase orders found. All BPOs have been dispatched.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Challans Tab */}
        <TabsContent value="challans" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Challans</CardTitle>
                <CardDescription>
                  View and manage all delivery challans
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="ALL">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {challansLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : challans && challans.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Challan No.</TableHead>
                        <TableHead>BPO No.</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dispatch Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {challans.map((challan) => (
                        <TableRow key={challan.id}>
                          <TableCell className="font-medium">
                            {challan.challanNumber}
                          </TableCell>
                          <TableCell>
                            {challan.buyerPurchaseOrder?.poNumber || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {challan.buyerPurchaseOrder?.quotation?.companyName || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                challan.status === 'DELIVERED' ? 'default' :
                                challan.status === 'DISPATCHED' ? 'secondary' :
                                challan.status === 'RETURNED' ? 'destructive' :
                                'outline'
                              }
                            >
                              {challan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {challan.dispatchDate 
                              ? format(new Date(challan.dispatchDate), 'dd MMM yyyy')
                              : 'Not dispatched'
                            }
                          </TableCell>
                          <TableCell>
                            {challan.items?.length || 0} item{(challan.items?.length || 0) !== 1 ? 's' : ''}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="!max-w-[75vw] max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Challan Details</DialogTitle>
                                    <DialogDescription>
                                      {challan.challanNumber}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Challan Number</Label>
                                        <div className="text-lg font-semibold">
                                          {challan.challanNumber}
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div>
                                          <Badge 
                                            variant={
                                              challan.status === 'DELIVERED' ? 'default' :
                                              challan.status === 'DISPATCHED' ? 'secondary' :
                                              challan.status === 'RETURNED' ? 'destructive' :
                                              'outline'
                                            }
                                          >
                                            {challan.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Dispatch Date</Label>
                                        <div>
                                          {challan.dispatchDate 
                                            ? format(new Date(challan.dispatchDate), 'PPP')
                                            : 'Not dispatched'
                                          }
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Delivery Date</Label>
                                        <div>
                                          {challan.deliveryDate 
                                            ? format(new Date(challan.deliveryDate), 'PPP')
                                            : 'Not delivered'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {challan.items && challan.items.length > 0 && (
                                      <>
                                        <Separator />
                                        <div>
                                          <Label>Items</Label>
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Product Code</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {challan.items.map((item) => (
                                                <TableRow key={item.id}>
                                                  <TableCell>
                                                    {item.inventory?.productName || 'N/A'}
                                                  </TableCell>
                                                  <TableCell>{item.quantity}</TableCell>
                                                  <TableCell>
                                                    {item.inventory?.productCode || 'N/A'}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <Button variant="outline">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </Button>
                                    {challan.status === 'DISPATCHED' && (
                                      <Button
                                        onClick={() => handleStatusUpdate(challan.id, ChallanStatus.DELIVERED)}
                                      >
                                        Mark as Delivered
                                      </Button>
                                    )}
                                    {challan.status === 'DRAFT' && (
                                      <Button
                                        onClick={() => handleStatusUpdate(challan.id, ChallanStatus.DISPATCHED)}
                                      >
                                        Mark as Dispatched
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No challans found. Create a challan from pending BPOs.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispatch Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Summary</CardTitle>
              <CardDescription>
                Complete overview of dispatch operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : dispatchSummary ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600">
                            {dispatchSummary.fullyDispatched}
                          </div>
                          <p className="text-sm text-muted-foreground">Fully Dispatched BPOs</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-yellow-600">
                            {dispatchSummary.partiallyDispatched}
                          </div>
                          <p className="text-sm text-muted-foreground">Partially Dispatched BPOs</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-red-600">
                            {dispatchSummary.notDispatched}
                          </div>
                          <p className="text-sm text-muted-foreground">Not Dispatched BPOs</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* BPO Details Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">BPO Dispatch Details</h3>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PO Number</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Ordered</TableHead>
                            <TableHead>Dispatched</TableHead>
                            <TableHead>Remaining</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dispatchSummary.bpoDetails.map((bpo) => (
                            <TableRow key={bpo.id}>
                              <TableCell className="font-medium">{bpo.poNumber}</TableCell>
                              <TableCell>{bpo.companyName}</TableCell>
                              <TableCell>{bpo.totalQuantity}</TableCell>
                              <TableCell>{bpo.dispatchedQuantity}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    bpo.remainingQuantity > 0 
                                      ? "destructive" 
                                      : "outline"
                                  }
                                >
                                  {bpo.remainingQuantity}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    Ordered: {formatBDT(bpo.orderedValue)}
                                  </div>
                                  <div className="text-sm font-medium">
                                    Dispatched: {formatBDT(bpo.dispatchedValue)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {bpo.dispatchedQuantity === 0 ? (
                                  <Badge variant="destructive">Not Started</Badge>
                                ) : bpo.dispatchedQuantity < bpo.totalQuantity ? (
                                  <Badge variant="secondary">In Progress</Badge>
                                ) : (
                                  <Badge variant="default">Completed</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>

                  {/* Progress Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dispatch Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Items Dispatch Rate</span>
                            <span className="text-sm font-medium">
                              {((dispatchSummary.totalItemsDispatched / dispatchSummary.totalItemsOrdered) * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${(dispatchSummary.totalItemsDispatched / dispatchSummary.totalItemsOrdered) * 100 || 0}%`
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Value Dispatch Rate</span>
                            <span className="text-sm font-medium">
                              {((dispatchSummary.totalValueDispatched / dispatchSummary.totalValueOrdered) * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${(dispatchSummary.totalValueDispatched / dispatchSummary.totalValueOrdered) * 100 || 0}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to load dispatch summary. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Challan Dialog */}
      {selectedBPO && (
        <CreateChallanDialog
          open={!!selectedBPO}
          onOpenChange={() => setSelectedBPO(null)}
          bpoId={selectedBPO}
          onCreate={handleCreateChallan}
          isLoading={creating}
        />
      )}
    </div>
    </div>
  );
}

// Create Challan Dialog Component
interface CreateChallanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bpoId: string;
  onCreate: (data: CreateChallanDto) => void;
  isLoading: boolean;
}

function CreateChallanDialog({ 
  open, 
  onOpenChange, 
  bpoId, 
  onCreate, 
  isLoading 
}: CreateChallanDialogProps) {
  const { data: bpoDetails } = useGetPendingBPOsQuery();
  const [items, setItems] = useState<Array<{ inventoryId: string; quantity: number }>>([]);
  
  const currentBPO = bpoDetails?.find(bpo => bpo.id === bpoId);
  
const handleItemChange = (inventoryId: string, quantity: number) => {
  setItems(prev =>
    prev.map(item =>
      item.inventoryId === inventoryId
        ? { ...item, quantity: Math.max(0, quantity), touched: true }
        : item
    )
  );
};


  const handleSubmit = () => {
    const filteredItems = items.filter(item => item.quantity > 0);
    if (filteredItems.length === 0) {
      toast.error('Please add at least one item to dispatch');
      return;
    }

    onCreate({
      buyerPurchaseOrderId: bpoId,
      items: filteredItems,
      status: 'DISPATCHED',
      dispatchDate: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[75vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Challan</DialogTitle>
          <DialogDescription>
            Dispatch items from purchase order: {currentBPO?.poNumber}
          </DialogDescription>
        </DialogHeader>
        
        {currentBPO && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <div className="text-lg font-semibold">{currentBPO.companyName}</div>
              </div>
              <div>
                <Label>Total Ordered</Label>
                <div className="text-lg font-semibold">{currentBPO.totalQuantity} items</div>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Select Items to Dispatch</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Already Dispatched</TableHead>
                    <TableHead>Dispatch Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBPO.items.map((item) => {
                    const alreadyDispatched = currentBPO.dispatchedQuantity;
                    const remaining = item.orderedQuantity - alreadyDispatched;
                    const selectedItem = items.find(i => i.inventoryId === item.inventoryId);
                    
                    const ensureItemInitialized = (inventoryId: string, quantity: number) => {
  setItems(prev => {
    if (prev.some(i => i.inventoryId === inventoryId)) return prev;
    return [...prev, { inventoryId, quantity }];
  });
};


                    const getDefaultQuantity = (item: any) => {
  const alreadyDispatched = currentBPO?.dispatchedQuantity ?? 0;
  const remaining = item.orderedQuantity - alreadyDispatched;
  return Math.min(remaining, item.availableQuantity);
};


                    return (
                      <TableRow key={item.inventoryId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.productCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.orderedQuantity}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.availableQuantity >= remaining 
                                ? "outline" 
                                : "destructive"
                            }
                          >
                            {item.availableQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alreadyDispatched}</TableCell>
<TableCell>
  {(() => {
    const defaultQty = getDefaultQuantity(item);
    const selectedItem = items.find(i => i.inventoryId === item.inventoryId);

    // initialize once
    if (!selectedItem) {
      ensureItemInitialized(item.inventoryId, defaultQty);
    }

    return (
      <>
        <Input
          type="number"
          min={0}
          max={defaultQty}
          value={selectedItem?.quantity ?? defaultQty}
          onChange={(e) =>
            handleItemChange(
              item.inventoryId,
              parseInt(e.target.value) || 0
            )
          }
          className="w-24"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Max: {defaultQty}
        </div>
      </>
    );
  })()}
</TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Notes (Optional)</Label>
              <Textarea placeholder="Add any special instructions or notes for this dispatch..." />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Total items to dispatch: {items.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4 mr-2" />
                        Create Challan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}