'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { POStatus, PurchaseOrder, PaymentType } from '@/types/purchaseOrder';
import { Package, CheckCircle, Clock, Eye, Building, Calendar, Loader2, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { useMarkAsReceivedMutation } from '@/lib/store/api/purchaseOrdersApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  onUpdateStatus: (orderId: string, status: POStatus) => void;
  isLoading?: boolean;
}

// Interface for received items with imageUrl
interface ReceivedItemWithImage {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  expectedSalePrice: number;
  imageUrl: string;
}

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'du4spzaiq';
const CLOUDINARY_UPLOAD_PRESET = 'gift_corner'; // You need to create this in Cloudinary

export function PurchaseOrderList({ purchaseOrders, onUpdateStatus, isLoading = false }: PurchaseOrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [receivedItems, setReceivedItems] = useState<ReceivedItemWithImage[]>([]);
  
  const [markAsReceived, { isLoading: isMarkingReceived }] = useMarkAsReceivedMutation();

  // Initialize received items when dialog opens
  useEffect(() => {
    if (selectedOrder && isReceiveDialogOpen) {
      const initialItems = selectedOrder.items.map(item => ({
        purchaseOrderItemId: item.id,
        receivedQuantity: item.quantity,
        expectedSalePrice: item.unitPrice * 1.2,
        imageUrl: ''
      }));
      setReceivedItems(initialItems);
    }
  }, [selectedOrder, isReceiveDialogOpen]);

  const handleMarkReceived = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsReceiveDialogOpen(true);
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Handle number input with string conversion
  const handleNumberInput = (
    index: number,
    field: 'receivedQuantity' | 'expectedSalePrice',
    value: string
  ) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Allow empty string for backspace
    if (numericValue === '') {
      updateReceivedItem(index, field, 0);
      return;
    }

    // Prevent multiple decimal points
    if ((numericValue.match(/\./g) || []).length > 1) {
      return;
    }

    // Convert to number
    const numValue = parseFloat(numericValue);
    if (!isNaN(numValue)) {
      updateReceivedItem(index, field, numValue);
    }
  };

  const updateReceivedItem = (
    index: number,
    field: keyof ReceivedItemWithImage,
    value: number | string
  ) => {
    const updatedItems = [...receivedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setReceivedItems(updatedItems);
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle image upload
  const handleImageUpload = async (index: number, file: File) => {
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      updateReceivedItem(index, 'imageUrl', imageUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  // Generate Purchase Order PDF
  const generatePurchaseOrderPDF = (order: PurchaseOrder) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set font
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Company Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Genuine Stationers & Gift Corner', 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('169/C Kalabagan (Old), 94/1 Green Road (New) Staff Colony', 105, 22, { align: 'center' });
      doc.text('Kalabagan 2nd Lane, Dhanmondi, Dhaka- 1205', 105, 27, { align: 'center' });
      doc.text('Phone : +88-02-9114774', 105, 32, { align: 'center' });
      doc.text('Mobile : +88 01711-560963, +88 01971-560963', 105, 37, { align: 'center' });
      doc.text('E-mail : gsgcreza@gmail.com, gmsreza87@yahoo.com', 105, 42, { align: 'center' });

      // Separator line
      doc.setLineWidth(0.5);
      doc.line(10, 45, 200, 45);

      // Purchase Order Title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PURCHASE ORDER', 105, 55, { align: 'center' });

      // Order Information
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const orderInfoY = 65;
      doc.text(`PO Number: ${order.poNumber}`, 20, orderInfoY);
      doc.text(`Order Date: ${formatDateForPDF(order.createdAt)}`, 20, orderInfoY + 5);
      doc.text(`Status: ${order.status}`, 20, orderInfoY + 10);
      doc.text(`Payment Type: ${order.paymentType}`, 20, orderInfoY + 15);

      doc.text(`Created By: ${order.user.name}`, 120, orderInfoY);
      doc.text(`Created By Email: ${order.user.email}`, 120, orderInfoY + 5);
      
      if (order.receivedAt) {
        doc.text(`Received Date: ${formatDateForPDF(order.receivedAt)}`, 120, orderInfoY + 10);
      }

      // Vendor Information Section
      const vendorY = orderInfoY + 25;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 20, vendorY);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${order.vendorName}`, 20, vendorY + 7);
      doc.text(`${order.vendorContact}`, 20, vendorY + 12);
      
      if (order.vendorContactNo) {
        doc.text(`Phone: ${order.vendorContactNo}`, 20, vendorY + 17);
      }
      
      doc.text(`${order.vendorCountry}`, 20, vendorY + 22);
      
      if (order.vendorAddress) {
        const addressLines = doc.splitTextToSize(order.vendorAddress, 80);
        addressLines.forEach((line: string, index: number) => {
          doc.text(line, 20, vendorY + 27 + (index * 5));
        });
      }

      // Order Items Table
      const tableStartY = vendorY + 35;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER ITEMS', 20, tableStartY);

      const tableData = order.items.map(item => [
        item.productName,
        item.description || '',
        item.quantity.toString(),
        formatNumber(item.unitPrice),
        `${item.taxPercentage}%`,
        formatNumber(item.totalPrice)
      ]);

      autoTable(doc, {
        startY: tableStartY + 5,
        head: [['Product', 'Description', 'Qty', 'Unit Price (BDT)', 'Tax %', 'Total (BDT)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [241, 241, 241], textColor: 0, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 25, halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });

      // Investments Section (if any)
      if (order.investments && order.investments.length > 0) {
        const lastY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INVESTMENT DETAILS', 20, lastY);

        const investmentData = order.investments.map(investment => [
          investment.investor.name,
          investment.investor.email,
          formatNumber(investment.investmentAmount),
          `${investment.profitPercentage}%`,
        ]);

        autoTable(doc, {
          startY: lastY + 5,
          head: [['Investor', 'Email', 'Amount (BDT)', 'Profit %']],
          body: investmentData,
          theme: 'grid',
          headStyles: { fillColor: [241, 241, 241], textColor: 0, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'center' },
          },
          margin: { left: 20, right: 20 }
        });
      }

      // Order Summary
      const summaryY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER SUMMARY', 20, summaryY);

      const summaryData = [
        ['Subtotal', formatNumber(order.totalAmount - order.taxAmount)],
        ['Tax Amount', formatNumber(order.taxAmount)],
        ['Total Amount', formatNumber(order.totalAmount)]
      ];

      if (order.paymentType === PaymentType.DUE) {
        const paidAmount = order.totalAmount - order.dueAmount;
        summaryData.push(
          ['Amount Paid', formatNumber(paidAmount)],
          ['Due Amount', formatNumber(order.dueAmount)]
        );
      }

      autoTable(doc, {
        startY: summaryY + 5,
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
      });

      // Notes Section (if any)
      if (order.notes) {
        const lastY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES', 20, lastY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(order.notes, 170);
        noteLines.forEach((line: string, index: number) => {
          doc.text(line, 20, lastY + 10 + (index * 5));
        });
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a computer generated purchase order. No signature required.', 105, pageHeight - 20, { align: 'center' });
      doc.text('Thank you for your business!', 105, pageHeight - 15, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString('en-BD')}`, 105, pageHeight - 10, { align: 'center' });

      // Save PDF
      doc.save(`Purchase_Order_${order.poNumber}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Helper function to format date for PDF
  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format numbers without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleConfirmReceive = async () => {
    if (!selectedOrder) return;

    try {
      // Prepare the data for the API call
      const markAsReceivedData = {
        receivedItems: receivedItems.map(item => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          receivedQuantity: item.receivedQuantity,
          expectedSalePrice: item.expectedSalePrice,
          imageUrl: item.imageUrl
        }))
      };

      await markAsReceived({
        id: selectedOrder.id,
        data: markAsReceivedData
      }).unwrap();
      
      setIsReceiveDialogOpen(false);
      setSelectedOrder(null);
      setReceivedItems([]);
    } catch (error) {
      console.error('Failed to mark as received:', error);
    }
  };

  const getStatusIcon = (status: POStatus) => {
    switch (status) {
      case POStatus.RECEIVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case POStatus.CANCELLED:
        return <Package className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: POStatus) => {
    switch (status) {
      case POStatus.RECEIVED:
        return 'default';
      case POStatus.CANCELLED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Investors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {order.poNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.vendorName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.items.length} items
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {formatDate(order.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span className={order.dueAmount > 0 ? "text-destructive font-medium" : "text-green-600"}>
                      {formatCurrency(order.dueAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant={"default"}>
                        {order.investments.length > 0 
                          ? `${order.investments.length} investors` 
                          : "Self Funded"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePurchaseOrderPDF(order)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkReceived(order)}
                        disabled={order.status === POStatus.RECEIVED || order.status === POStatus.CANCELLED}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Received
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {purchaseOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Purchase Orders</h3>
              <p className="text-muted-foreground">Create your first purchase order to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog - Prevent closing on outside click */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="!max-w-[70vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Purchase Order Details</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order Information</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">PO Number:</span>
                      <span className="font-medium">{selectedOrder.poNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Order Date:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={getStatusVariant(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Payment Type:</span>
                      <span>{selectedOrder.paymentType}</span>
                    </div>
                    {selectedOrder.receivedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm">Received Date:</span>
                        <span>{formatDate(selectedOrder.receivedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vendor Information</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-medium">{selectedOrder.vendorName}</div>
                    <div className="text-sm">{selectedOrder.vendorContact}</div>
                    {selectedOrder.vendorContactNo && (
                      <div className="text-sm">Phone: {selectedOrder.vendorContactNo}</div>
                    )}
                    <div className="text-sm text-muted-foreground">{selectedOrder.vendorCountry}</div>
                    {selectedOrder.vendorAddress && (
                      <div className="text-sm text-muted-foreground">{selectedOrder.vendorAddress}</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Products</Label>
                  <span className="text-sm text-muted-foreground">
                    Total Items: {selectedOrder.items.length}
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.description && ` - ${item.description}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tax: {item.taxPercentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.investments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Investments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.investments.map((investment) => (
                      <div key={investment.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{investment.investor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Email: {investment.investor.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(investment.investmentAmount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Profit: {investment.profitPercentage}%
                            {investment.isFullInvestment && ' • Full Investment'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount - selectedOrder.taxAmount)}</span>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Type:</span>
                    <span className="font-medium">{selectedOrder.paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedOrder.totalAmount - selectedOrder.dueAmount)}
                    </span>
                  </div>
                  {selectedOrder.paymentType === PaymentType.DUE && (
                    <div className="flex justify-between font-bold text-destructive border-t pt-2">
                      <span>Amount Due:</span>
                      <span>{formatCurrency(selectedOrder.dueAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <div className="p-3 bg-muted rounded-lg mt-2">
                    <div className="text-sm whitespace-pre-wrap">{selectedOrder.notes}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => generatePurchaseOrderPDF(selectedOrder)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Received Dialog - Prevent closing on outside click */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="!max-w-[90vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Confirm Product Receipt
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">PO Number:</span>
                  <div>{selectedOrder.poNumber}</div>
                </div>
                <div>
                  <span className="font-medium">Vendor:</span>
                  <div>{selectedOrder.vendorName}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Received Products</h4>
                <div className="space-y-3">
                  {receivedItems.map((receivedItem, index) => {
                    const orderItem = selectedOrder.items.find(item => item.id === receivedItem.purchaseOrderItemId);
                    if (!orderItem) return null;

                    return (
                      <div key={orderItem.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-3 border rounded-lg">
                        <div>
                          <Label>Product Name</Label>
                          <Input value={orderItem.productName} disabled />
                        </div>
                        <div>
                          <Label>Quantity Received</Label>
                          <Input 
                            type="text" 
                            value={receivedItem.receivedQuantity.toString()}
                            onChange={(e) => handleNumberInput(index, 'receivedQuantity', e.target.value)}
                            placeholder="Enter quantity"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            Ordered: {orderItem.quantity}
                          </div>
                        </div>
                        <div>
                          <Label>Unit Cost (BDT)</Label>
                          <Input value={orderItem.unitPrice} disabled />
                        </div>
                        <div>
                          <Label>Sale Price (BDT)</Label>
                          <Input 
                            type="text"
                            value={receivedItem.expectedSalePrice.toString()}
                            onChange={(e) => handleNumberInput(index, 'expectedSalePrice', e.target.value)}
                            placeholder="Enter sale price"
                          />
                        </div>
                        <div>
                          <Label>Product Image</Label>
                          <div className="space-y-2">
                            <Input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(index, file);
                                }
                              }}
                              className="cursor-pointer"
                            />
                            {receivedItem.imageUrl && (
                              <div className="flex items-center gap-2 text-xs text-green-600">
                                <ImageIcon className="w-3 h-3" />
                                Image uploaded
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>Total Value</Label>
                          <Input 
                            value={formatCurrency(orderItem.totalPrice)}
                            disabled
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Note</div>
                  <div className="mt-1">
                    Marking this purchase order as received will:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Update the purchase order status to "RECEIVED"</li>
                      <li>Add all products to inventory with the specified sale prices</li>
                      <li>Generate product codes and barcodes for inventory tracking</li>
                      <li>Make products available for quotations and sales</li>
                      <li>Uploaded images will be attached to inventory items</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReceiveDialogOpen(false);
                    setReceivedItems([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmReceive}
                  disabled={isMarkingReceived}
                >
                  {isMarkingReceived ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Receipt & Add to Inventory
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}