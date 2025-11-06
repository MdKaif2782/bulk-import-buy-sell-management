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
} from '../../../types/investor';

export const investorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvestors: builder.query<InvestorListResponse, InvestorQueryParams | void>({
      query: (params?: InvestorQueryParams) => ({
        url: '/investors',
        method: 'GET',
        params,
      }),
      providesTags: ['Investor'],
    }),

    getInvestor: builder.query<Investor, string>({
      query: (id: string) => ({
        url: `/investors/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Investor', id }],
    }),

    createInvestor: builder.mutation<Investor, CreateInvestorData>({
      query: (investorData: CreateInvestorData) => ({
        url: '/investors',
        method: 'POST',
        body: investorData,
      }),
      invalidatesTags: ['Investor'],
    }),

    updateInvestor: builder.mutation<Investor, { id: string; data: UpdateInvestorData }>({
      query: ({ id, data }: { id: string; data: UpdateInvestorData }) => ({
        url: `/investors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Investor', id }, 'Investor'],
    }),

    deleteInvestor: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/investors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Investor'],
    }),

    toggleInvestorStatus: builder.mutation<Investor, string>({
      query: (id: string) => ({
        url: `/investors/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Investor', id }, 'Investor'],
    }),

    // Statistics endpoints
    getInvestorStatistics: builder.query<InvestorStatistics, void>({
      query: () => ({
        url: '/investors/statistics',
        method: 'GET',
      }),
      providesTags: ['Investor'],
    }),

    getInvestorPerformance: builder.query<InvestorPerformance[], void>({
      query: () => ({
        url: '/investors/performance',
        method: 'GET',
      }),
      providesTags: ['Investor'],
    }),

    getEquityDistribution: builder.query<EquityDistribution, void>({
      query: () => ({
        url: '/investors/equity-distribution',
        method: 'GET',
      }),
      providesTags: ['Investor'],
    }),
  }),
});

export const {
  useGetInvestorsQuery,
  useGetInvestorQuery,
  useCreateInvestorMutation,
  useUpdateInvestorMutation,
  useDeleteInvestorMutation,
  useToggleInvestorStatusMutation,
  useGetInvestorStatisticsQuery,
  useGetInvestorPerformanceQuery,
  useGetEquityDistributionQuery,
} = investorsApi;