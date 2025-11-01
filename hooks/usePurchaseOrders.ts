// app/purchase-order/hooks/usePurchaseOrders.ts
'use client';

import { useState } from 'react';
import { Product, PurchaseOrder } from '@/types';
import { toast } from 'sonner';

// Extended mock data
const initialPurchaseOrders: PurchaseOrder[] = [
  {
      id: 'PO-001',
      vendor: {
          id: '1',
          name: 'ABC Electronics',
          country: 'China',
          contact: 'Zhang Wei',
          address: '123 Tech Street, Shenzhen',
          email: 'contact@abcelectronics.com',
          phone: '+86-123-4567'
      },
      products: [
          { id: '1', name: 'Smartphone', quantity: 50, unitPrice: 15000, totalPrice: 750000 },
          { id: '2', name: 'Tablet', quantity: 25, unitPrice: 20000, totalPrice: 500000 }
      ],
      investors: [
          {
              id: '1',
              name: 'Mr. Zaman',
              investmentAmount: 500000,
              profitShare: 40,
              amountPaid: 500000,
              amountDue: 0,
              payments: [
                  {
                      investorId: '1',
                      amount: 500000,
                      paymentMethod: 'bank',
                      reference: 'TRX-123456',
                      paymentDate: new Date('2024-01-15')
                  }
              ]
          }
      ],
      taxPercentage: 5,
      subtotal: 1250000,
      taxAmount: 62500,
      totalAmount: 1312500,
      amountPaid: 500000,
      amountDue: 812500,
      orderDate: new Date('2024-01-15'),
      status: 'pending',
      paymentMethod: 'bank',
      paymentReference: 'INV-001',
      payments: []
  },
  {
    id: 'PO-002',
    vendor: {
      id: '2',
      name: 'Dhaka Textiles',
      country: 'Bangladesh',
      contact: 'Ali Ahmed',
      address: '456 Textile Road, Dhaka',
      email: 'info@dhakatextiles.com',
      phone: '+880-123-4567'
    },
    products: [
      { id: '3', name: 'Cotton Fabric', quantity: 1000, unitPrice: 250, totalPrice: 250000 },
      { id: '4', name: 'Silk Material', quantity: 200, unitPrice: 1500, totalPrice: 300000 }
    ],
    investors: [],
    taxPercentage: 0,
    subtotal: 550000,
    taxAmount: 0,
    totalAmount: 550000,
    amountPaid: 0,
    amountDue: 550000,
    orderDate: new Date('2024-01-20'),
    status: 'pending',
    payments: []
  }
];

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);

  const addPurchaseOrder = (newOrder: Omit<PurchaseOrder, 'id'>) => {
    const order: PurchaseOrder = {
      ...newOrder,
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      orderDate: new Date(),
      status: 'pending'
    };
    
    setPurchaseOrders(prev => [...prev, order]);
    toast.success('Purchase order created successfully!');
  };

  const updatePurchaseOrderStatus = (orderId: string, status: PurchaseOrder['status'], receivedProducts?: Product[]) => {
    setPurchaseOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status,
              ...(status === 'received' && {
                receivedDate: new Date(),
                products: receivedProducts || order.products
              })
            }
          : order
      )
    );
    
    if (status === 'received') {
      toast.success('Products marked as received and added to inventory!');
    }
  };

  const addPaymentToOrder = (orderId: string, payment: any) => {
    setPurchaseOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              amountPaid: order.amountPaid + payment.amount,
              amountDue: order.amountDue - payment.amount,
              payments: [...(order.payments || []), payment]
            }
          : order
      )
    );
  };

  return {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    addPaymentToOrder
  };
}