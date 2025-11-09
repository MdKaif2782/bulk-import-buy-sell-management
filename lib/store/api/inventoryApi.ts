// lib/apis/inventoryApi.ts
import { baseApi } from './baseApi';
import {
  Inventory,
  InventoryResponse,
  UpdateInventoryRequest,
  InventorySearchParams,
  LowStockItem,
} from '@/types/inventory';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryResponse, InventorySearchParams>({
      query: (params) => ({
        url: '/inventory',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    getInventoryItem: builder.query<Inventory, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    updateInventory: builder.mutation<Inventory, { id: string; data: UpdateInventoryRequest }>({
      query: ({ id, data }) => ({
        url: `/inventory/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Inventory', id },
        'Inventory',
      ],
    }),

    getLowStockItems: builder.query<LowStockItem[], number | void>({
      query: (threshold) => ({
        url: '/inventory/low-stock',
        method: 'GET',
        params: threshold ? { threshold } : undefined,
      }),
      providesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useUpdateInventoryMutation,
  useGetLowStockItemsQuery,
  useLazyGetInventoryQuery,
} = inventoryApi;