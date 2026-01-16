// lib/store/api/retailSaleApi.ts
import { baseApi } from './baseApi';
import {
  RetailSale,
  CreateRetailSaleRequest,
  GetRetailSalesParams,
  RetailSalesResponse,
  RetailAnalytics,
  GetRetailAnalyticsParams,
} from '@/types/retailSale';

export const retailSaleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new retail sale
    createRetailSale: builder.mutation<RetailSale, CreateRetailSaleRequest>({
      query: (data) => ({
        url: '/retail-sales',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RetailSale', 'Inventory', 'Statistics'],
    }),

    // Get all retail sales with pagination and filters
    getRetailSales: builder.query<RetailSalesResponse, GetRetailSalesParams>({
      query: (params) => ({
        url: '/retail-sales',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.sales.map(({ id }) => ({ type: 'RetailSale' as const, id })),
              { type: 'RetailSale', id: 'LIST' },
            ]
          : [{ type: 'RetailSale', id: 'LIST' }],
    }),

    // Get a single retail sale by ID
    getRetailSaleById: builder.query<RetailSale, string>({
      query: (id) => ({
        url: `/retail-sales/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'RetailSale', id }],
    }),

    // Get retail analytics
    getRetailAnalytics: builder.query<RetailAnalytics, GetRetailAnalyticsParams>({
      query: (params) => ({
        url: '/retail-sales/analytics',
        method: 'GET',
        params,
      }),
      providesTags: ['RetailSale'],
    }),

    // Delete a retail sale
    deleteRetailSale: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/retail-sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RetailSale', 'Inventory', 'Statistics'],
    }),
  }),
});

export const {
  useCreateRetailSaleMutation,
  useGetRetailSalesQuery,
  useGetRetailSaleByIdQuery,
  useGetRetailAnalyticsQuery,
  useDeleteRetailSaleMutation,
} = retailSaleApi;
