import { baseApi } from './baseApi';
import {
  Investor,
  InvestorListResponse,
  InvestorStatistics,
  InvestorPerformance,
  EquityDistribution,
  CreateInvestorData,
  UpdateInvestorData,
  InvestorQueryParams,
  InvestorPayment,
  InvestorPayable,
  InvestorDueSummary,
  PaymentHistoryResponse,
  CreateInvestorPaymentData,
  CreatePayableData,
  PaymentHistoryParams,
} from '../../../types/investor';

export const investorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Investor CRUD Operations ====================
    getInvestors: builder.query<InvestorListResponse, InvestorQueryParams | void>({
      query: (params?: InvestorQueryParams) => ({
        url: '/investors',
        method: 'GET',
        params: params as Record<string, any>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.investors.map(({ id }) => ({ type: 'Investor' as const, id })),
              { type: 'Investor', id: 'LIST' },
            ]
          : [{ type: 'Investor', id: 'LIST' }],
    }),

    getInvestor: builder.query<Investor, string>({
      query: (id: string) => ({
        url: `/investors/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Investor', id }],
    }),

    createInvestor: builder.mutation<Investor, CreateInvestorData>({
      query: (investorData: CreateInvestorData) => ({
        url: '/investors',
        method: 'POST',
        body: investorData,
      }),
      invalidatesTags: [{ type: 'Investor', id: 'LIST' }],
    }),

    updateInvestor: builder.mutation<Investor, { id: string; data: UpdateInvestorData }>({
      query: ({ id, data }: { id: string; data: UpdateInvestorData }) => ({
        url: `/investors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Investor', id },
        { type: 'Investor', id: 'LIST' },
      ],
    }),

    deleteInvestor: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/investors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Investor', id },
        { type: 'Investor', id: 'LIST' },
      ],
    }),

    toggleInvestorStatus: builder.mutation<Investor, string>({
      query: (id: string) => ({
        url: `/investors/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Investor', id },
        { type: 'Investor', id: 'LIST' },
      ],
    }),

    // ==================== Statistics & Reports ====================
    getInvestorStatistics: builder.query<InvestorStatistics, void>({
      query: () => ({
        url: '/investors/statistics',
        method: 'GET',
      }),
      providesTags: [{ type: 'Investor', id: 'STATS' }],
    }),

    getInvestorPerformance: builder.query<InvestorPerformance[], void>({
      query: () => ({
        url: '/investors/performance',
        method: 'GET',
      }),
      providesTags: [{ type: 'Investor', id: 'PERFORMANCE' }],
    }),

    getEquityDistribution: builder.query<EquityDistribution, void>({
      query: () => ({
        url: '/investors/equity-distribution',
        method: 'GET',
      }),
      providesTags: [{ type: 'Investor', id: 'EQUITY' }],
    }),

    // ==================== Payment Management ====================
    // Get due summary for specific investor or all investors
    getInvestorDueSummary: builder.query<InvestorDueSummary[], string | void>({
      query: (investorId?: string) => ({
        url: '/investor-payments/due-summary',
        method: 'GET',
        params: investorId ? { investorId } : {},
      }),
      providesTags: (result, error, investorId) => [
        { type: 'Investor', id: 'DUE_SUMMARY' },
        ...(investorId ? [{ type: 'Investor', id: investorId }] : []),
      ],
    }),

    // Get due payables for a specific investor
    getDuePayables: builder.query<InvestorPayable[], string>({
      query: (investorId: string) => ({
        url: `/investors/${investorId}/due-payables`,
        method: 'GET',
      }),
      providesTags: (result, error, investorId) => [
        { type: 'Investor', id: 'DUE_PAYABLES' },
        { type: 'Investor', id: investorId },
      ],
    }),

    // Get payment history for an investor
    getPaymentHistory: builder.query<PaymentHistoryResponse, { investorId: string; params?: PaymentHistoryParams }>({
      query: ({ investorId, params }: { investorId: string; params?: PaymentHistoryParams }) => ({
        url: `/investors/${investorId}/payment-history`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { investorId }) => [
        { type: 'Investor', id: 'PAYMENT_HISTORY' },
        { type: 'Investor', id: investorId },
      ],
    }),

    // Make payment to investor
    createInvestorPayment: builder.mutation<InvestorPayment, { investorId: string; paymentData: CreateInvestorPaymentData }>({
      query: ({ investorId, paymentData }: { investorId: string; paymentData: CreateInvestorPaymentData }) => ({
        url: `/investors/${investorId}/payments`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { investorId }) => [
        { type: 'Investor', id: investorId },
        { type: 'Investor', id: 'LIST' },
        { type: 'Investor', id: 'DUE_SUMMARY' },
        { type: 'Investor', id: 'DUE_PAYABLES' },
        { type: 'Investor', id: 'PAYMENT_HISTORY' },
        { type: 'Investor', id: 'STATS' },
        { type: 'Investor', id: 'PERFORMANCE' },
      ],
    }),

    // Create payable for investor (internal use - when profit is calculated)
    createPayable: builder.mutation<InvestorPayable, { investorId: string; payableData: CreatePayableData }>({
      query: ({ investorId, payableData }: { investorId: string; payableData: CreatePayableData }) => ({
        url: `/investor-payments/${investorId}/payables`,
        method: 'POST',
        body: payableData,
      }),
      invalidatesTags: (result, error, { investorId }) => [
        { type: 'Investor', id: investorId },
        { type: 'Investor', id: 'DUE_SUMMARY' },
        { type: 'Investor', id: 'DUE_PAYABLES' },
        { type: 'Investor', id: 'STATS' },
      ],
    }),

    // ==================== Alternative Payment Controller Endpoints ====================
    // These use the separate investor-payments controller if needed
    makePaymentAlt: builder.mutation<InvestorPayment, { investorId: string; paymentData: CreateInvestorPaymentData }>({
      query: ({ investorId, paymentData }: { investorId: string; paymentData: CreateInvestorPaymentData }) => ({
        url: `/investor-payments/${investorId}/payments`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { investorId }) => [
        { type: 'Investor', id: investorId },
        { type: 'Investor', id: 'LIST' },
        { type: 'Investor', id: 'DUE_SUMMARY' },
        { type: 'Investor', id: 'DUE_PAYABLES' },
        { type: 'Investor', id: 'PAYMENT_HISTORY' },
      ],
    }),

    getDuePayablesAlt: builder.query<InvestorPayable[], string>({
      query: (investorId: string) => ({
        url: `/investor-payments/${investorId}/due-payables`,
        method: 'GET',
      }),
      providesTags: (result, error, investorId) => [
        { type: 'Investor', id: 'DUE_PAYABLES' },
        { type: 'Investor', id: investorId },
      ],
    }),

    getDueSummaryAlt: builder.query<InvestorDueSummary[], string | void>({
      query: (investorId?: string) => ({
        url: '/investor-payments/due-summary',
        method: 'GET',
        params: investorId ? { investorId } : {},
      }),
      providesTags: (result, error, investorId) => [
        { type: 'Investor', id: 'DUE_SUMMARY' },
        ...(investorId ? [{ type: 'Investor', id: investorId }] : []),
      ],
    }),

    getPaymentHistoryAlt: builder.query<PaymentHistoryResponse, { investorId: string; params?: PaymentHistoryParams }>({
      query: ({ investorId, params }: { investorId: string; params?: PaymentHistoryParams }) => ({
        url: `/investor-payments/${investorId}/payment-history`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { investorId }) => [
        { type: 'Investor', id: 'PAYMENT_HISTORY' },
        { type: 'Investor', id: investorId },
      ],
    }),

    createPayableAlt: builder.mutation<InvestorPayable, { investorId: string; payableData: CreatePayableData }>({
      query: ({ investorId, payableData }: { investorId: string; payableData: CreatePayableData }) => ({
        url: `/investor-payments/${investorId}/payables`,
        method: 'POST',
        body: payableData,
      }),
      invalidatesTags: (result, error, { investorId }) => [
        { type: 'Investor', id: investorId },
        { type: 'Investor', id: 'DUE_SUMMARY' },
        { type: 'Investor', id: 'DUE_PAYABLES' },
      ],
    }),
  }),
});

export const {
  // Investor CRUD
  useGetInvestorsQuery,
  useGetInvestorQuery,
  useCreateInvestorMutation,
  useUpdateInvestorMutation,
  useDeleteInvestorMutation,
  useToggleInvestorStatusMutation,

  // Statistics & Reports
  useGetInvestorStatisticsQuery,
  useGetInvestorPerformanceQuery,
  useGetEquityDistributionQuery,

  // Payment Management (Main endpoints)
  useGetInvestorDueSummaryQuery,
  useGetDuePayablesQuery,
  useGetPaymentHistoryQuery,
  useCreateInvestorPaymentMutation,
  useCreatePayableMutation,

  // Alternative Payment Controller Endpoints
  useMakePaymentAltMutation,
  useGetDuePayablesAltQuery,
  useGetDueSummaryAltQuery,
  useGetPaymentHistoryAltQuery,
  useCreatePayableAltMutation,
} = investorsApi;