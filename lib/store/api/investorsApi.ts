import { baseApi } from './baseApi';
import {
  Investor,
  InvestorStatistics,
  InvestorPerformance,
  EquityDistribution,
  CreateInvestorData,
  UpdateInvestorData,
  InvestorQueryParams,
  DueSummary,
  CreateInvestorPaymentData,
  PaymentHistoryParams,
  PaymentResponse,
  InvestorListResponse,
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

    // ==================== Enhanced Due Summary & Payments ====================
    getInvestorDueSummary: builder.query<DueSummary, string>({
      query: (id: string) => ({
        url: `/investors/${id}/due-summary`,
        method: 'GET',
      }),
    }),

    payInvestor: builder.mutation<PaymentResponse, { id: string; data: CreateInvestorPaymentData }>({
      query: ({ id, data }: { id: string; data: CreateInvestorPaymentData }) => ({
        url: `/investors/${id}/pay`,
        method: 'POST',
        body: data,
      })
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

  // Enhanced Due Summary & Payments
  useGetInvestorDueSummaryQuery,
  usePayInvestorMutation,
  // Statistics & Reports
  useGetInvestorStatisticsQuery,
  useGetInvestorPerformanceQuery,
  useGetEquityDistributionQuery
} = investorsApi;