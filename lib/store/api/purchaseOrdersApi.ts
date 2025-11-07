import { baseApi } from './baseApi';
import {
  PurchaseOrder,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderQueryParams,
  PurchaseOrderListResponse,
  MarkAsReceivedData,
  POStatus,
  PaymentType,
  ApiResponse,
  PurchaseOrderStats,
} from '../../../types/purchaseOrder';

export const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all purchase orders with pagination
    getPurchaseOrders: builder.query<PurchaseOrderListResponse, PurchaseOrderQueryParams | void>({
      query: (params?: PurchaseOrderQueryParams) => ({
        url: '/purchase-orders',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),

    // Get purchase order by ID
    getPurchaseOrder: builder.query<ApiResponse<PurchaseOrder>, string>({
      query: (id: string) => ({
        url: `/purchase-orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'PurchaseOrder', id }],
    }),

    // Create new purchase order
    createPurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, CreatePurchaseOrderData>({
      query: (purchaseOrderData: CreatePurchaseOrderData) => ({
        url: '/purchase-orders',
        method: 'POST',
        body: purchaseOrderData,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Update purchase order
    updatePurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, { id: string; data: UpdatePurchaseOrderData }>({
      query: ({ id, data }: { id: string; data: UpdatePurchaseOrderData }) => ({
        url: `/purchase-orders/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'PurchaseOrder', id }, 'PurchaseOrder'],
    }),

    // Delete purchase order
    deletePurchaseOrder: builder.mutation<ApiResponse<void>, string>({
      query: (id: string) => ({
        url: `/purchase-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Mark purchase order as received
    markAsReceived: builder.mutation<ApiResponse<PurchaseOrder>, { id: string; data: MarkAsReceivedData }>({
      query: ({ id, data }: { id: string; data: MarkAsReceivedData }) => ({
        url: `/purchase-orders/${id}/receive`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'PurchaseOrder', id }, 'PurchaseOrder', 'Product'],
    }),

    // Update purchase order status
    updatePurchaseOrderStatus: builder.mutation<ApiResponse<PurchaseOrder>, { id: string; status: string }>({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/purchase-orders/${id}/status/${status}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'PurchaseOrder', id }, 'PurchaseOrder'],
    }),

    // Get purchase orders by status
    getPurchaseOrdersByStatus: builder.query<PurchaseOrderListResponse, { status: string; params?: PurchaseOrderQueryParams }>({
      query: ({ status, params }: { status: string; params?: PurchaseOrderQueryParams }) => ({
        url: `/purchase-orders/status/${status}`,
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),

    // Get purchase order statistics
    getPurchaseOrderStats: builder.query<PurchaseOrderStats, void>({
      query: () => ({
        url: '/purchase-orders/stats/summary',
        method: 'GET',
      }),
      providesTags: ['PurchaseOrder'],
    }),

    // Generate PO number (if you have this endpoint)
    generatePONumber: builder.query<{ poNumber: string }, void>({
      query: () => ({
        url: '/purchase-orders/generate/po-number',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useMarkAsReceivedMutation,
  useUpdatePurchaseOrderStatusMutation,
  useGetPurchaseOrdersByStatusQuery,
  useGetPurchaseOrderStatsQuery,
  useGeneratePONumberQuery,
  useLazyGeneratePONumberQuery,
} = purchaseOrdersApi;