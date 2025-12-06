// lib/apis/quotationApi.ts
import { baseApi, uploadImageToCloudinary } from './baseApi';
import {
  Quotation,
  QuotationResponse,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  AcceptQuotationRequest,
  QuotationSearchParams,
} from '@/types/quotation';

export const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotations: builder.query<QuotationResponse, QuotationSearchParams>({
      query: (params) => ({
        url: '/quotations',
        method: 'GET',
        params,
      }),
      providesTags: ['Quotation'],
    }),

    getQuotation: builder.query<Quotation, string>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Quotation', id }],
    }),

    createQuotation: builder.mutation<Quotation, CreateQuotationRequest>({
      query: (data) => ({
        url: '/quotations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quotation'],
    }),

    updateQuotation: builder.mutation<Quotation, { id: string; data: UpdateQuotationRequest }>({
      query: ({ id, data }) => ({
        url: `/quotations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),

    acceptQuotation: builder.mutation<Quotation, { id: string; data: AcceptQuotationRequest }>({
      query: ({ id, data }) => ({
        url: `/quotations/${id}/accept`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),

    updateQuotationStatus: builder.mutation<Quotation, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/quotations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),

    deleteQuotation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quotation'],
    }),

    getExpiredQuotations: builder.query<Quotation[], void>({
      query: () => ({
        url: '/quotations/expired',
        method: 'GET',
      }),
      providesTags: ['Quotation'],
    }),
        // Cloudinary image upload endpoint
    uploadSignatureImage: builder.mutation<string, File>({
      query: async (file) => {
        try {
          const imageUrl = await uploadImageToCloudinary(file);
          return { data: imageUrl };
        } catch (error) {
          return { error: error as Error };
        }
      },
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useAcceptQuotationMutation,
  useUpdateQuotationStatusMutation,
  useDeleteQuotationMutation,
  useGetExpiredQuotationsQuery,
  useLazyGetQuotationsQuery,
  useUploadSignatureImageMutation
} = quotationApi;