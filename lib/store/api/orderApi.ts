// src/lib/store/api/orderApi.ts
import { baseApi } from './baseApi'; // assuming you have ./baseApi
export interface Order { id: string; poNumber: string; poDate: string; pdfUrl?: string; externalUrl?: string; createdAt: string; quotation: { id: string; quotationNumber: string; companyName: string; companyAddress: string; status: string; totalAmount: number; items: Array<{ id: string; quantity: number; unitPrice: number; totalPrice: number; inventory: { id: string; productCode: string; productName: string; purchasePrice: number; }; }>; }; challans: Array<{ id: string; challanNumber: string; status: string; dispatchDate?: string; deliveryDate?: string; items: Array<{ quantity: number; inventory: { id: string; productName: string; }; }>; }>; bills: Array<{ id: string; billNumber: string; billDate: string; totalAmount: number; dueAmount: number; status: string; payments: Array<{ id: string; amount: number; paymentDate: string; }>; profitDistributions: Array<{ id: string; amount: number; investor: { id: string; name: string; }; }>; }>; } export interface CreateOrderRequest { quotationId: string; poDate?: string; pdfUrl?: string; externalUrl?: string; } export interface OrderSummary { orderId: string; orderNumber: string; quotationNumber: string; companyName: string; totalOrderedQuantity: number; totalDeliveredQuantity: number; totalBilledAmount: number; totalPaidAmount: number; totalProfitDistributed: number; completionPercentage: number; billCount: number; challanCount: number; status: string; createdAt: string; lastUpdated: string; } export interface InvestorProfitSummary { investorId: string; investorName: string; totalProfitPercentage: number; totalInvestmentAmount: number; calculatedProfit: number; actualDistributedProfit: number; purchaseOrders: Array<{ poNumber: string; profitPercentage: number; investmentAmount: number; }>; } export interface OrderStatistics { totalOrders: number; statusBreakdown: Array<{ status: string; _count: { id: number }; }>; totalBilledAmount: number; totalPaidAmount: number; pendingAmount: number; recentOrders: Array<{ id: string; poNumber: string; companyName: string; totalAmount: number; status: string; billCount: number; totalBilled: number; }>; }
export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all orders
        getOrders: builder.query<{ data: Order[]; meta: any }, { page?: number; limit?: number; status?: string }>({
            query: ({ page = 1, limit = 10, status }) =>
                `orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
            providesTags: ['Order'],
        }),

        // Get order by ID
        getOrder: builder.query<Order, string>({
            query: (id) => `orders/${id}`,
            providesTags: (result, error, id) => [{ type: 'Order', id }],
        }),

        // Create order
        createOrder: builder.mutation<Order, CreateOrderRequest>({
            query: (orderData) => ({
                url: 'orders',
                method: 'POST',
                body: orderData,
            }),
            invalidatesTags: ['Order', 'OrderStatistics'],
        }),

        // Update order
        updateOrder: builder.mutation<Order, { id: string; data: Partial<CreateOrderRequest> }>({
            query: ({ id, data }) => ({
                url: `orders/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Order', id },
                'OrderSummary',
            ],
        }),

        // Delete order
        deleteOrder: builder.mutation<void, string>({
            query: (id) => ({
                url: `orders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Order', 'OrderStatistics'],
        }),

        // Get order summary
        getOrderSummary: builder.query<OrderSummary, string>({
            query: (id) => `orders/${id}/summary`,
            providesTags: ['OrderSummary'],
        }),

        // Get investor profits
        getInvestorProfits: builder.query<InvestorProfitSummary[], string>({
            query: (id) => `orders/${id}/profits`,
        }),

        // Get order products
        getOrderProducts: builder.query<any[], string>({
            query: (id) => `orders/${id}/products`,
        }),

        // Get order timeline
        getOrderTimeline: builder.query<any[], string>({
            query: (id) => `orders/${id}/timeline`,
        }),

        // Get order statistics
        getOrderStatistics: builder.query<OrderStatistics, void>({
            query: () => 'orders/statistics',
            providesTags: ['OrderStatistics'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetOrdersQuery,
    useGetOrderQuery,
    useCreateOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useGetOrderSummaryQuery,
    useGetInvestorProfitsQuery,
    useGetOrderProductsQuery,
    useGetOrderTimelineQuery,
    useGetOrderStatisticsQuery,
} = orderApi;
