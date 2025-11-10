// lib/apis/billApi.ts
import { baseApi } from './baseApi';
import {
  Bill,
  BillResponse,
  CreateBillRequest,
  AddPaymentRequest,
  BillSearchParams,
  BillStats,
  AvailableBuyerPO,
} from '@/types/bill';

export const billApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query<BillResponse, BillSearchParams>({
      query: (params) => ({
        url: '/bills',
        method: 'GET',
        params,
      }),
      providesTags: ['Bill'],
    }),

    getBill: builder.query<Bill, string>({
      query: (id) => ({
        url: `/bills/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Bill', id }],
    }),

    createBill: builder.mutation<Bill, CreateBillRequest>({
      query: (data) => ({
        url: '/bills',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bill'],
    }),

    addPayment: builder.mutation<Bill, { id: string; data: AddPaymentRequest }>({
     
      query: ({ id, data }) => ({
        url: `/bills/${id}/payments`,
        method: 'POST',
        body: data,
      }),
    }),

    getBillStats: builder.query<BillStats, void>({
      query: () => ({
        url: '/bills/stats',
        method: 'GET',
      }),
      providesTags: ['Bill'],
    }),

    getRecentBills: builder.query<Bill[], number | void>({
      query: (limit = 10) => ({
        url: '/bills/recent',
        method: 'GET',
        params: { limit },
      }),
      providesTags: ['Bill'],
    }),

    getAvailableBuyerPOs: builder.query<AvailableBuyerPO[], void>({
      query: () => ({
        url: '/bills/available-pos',
        method: 'GET',
      }),
      providesTags: ['Bill'],
    }),

    getBillsByBuyerPO: builder.query<Bill[], string>({
      query: (buyerPOId) => ({
        url: `/bills/by-buyer-po/${buyerPOId}`,
        method: 'GET',
      }),
      providesTags: ['Bill'],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillQuery,
  useCreateBillMutation,
  useAddPaymentMutation,
  useGetBillStatsQuery,
  useGetRecentBillsQuery,
  useGetAvailableBuyerPOsQuery,
  useGetBillsByBuyerPOQuery,
  useLazyGetBillsQuery,
} = billApi;