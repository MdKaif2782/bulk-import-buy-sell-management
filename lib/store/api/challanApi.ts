import { baseApi } from './baseApi';
import {
  Challan,
  PendingBPO,
  DispatchSummary,
  CreateChallanDto,
  UpdateChallanStatusDto,
  DispatchBPODto,
  GetChallansQueryParams,
  PaginatedResponse,
  BpoSummary,
  ApiResponse
} from '@/types/challan';

export const challanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get pending BPOs (without challan or not dispatched)
    getPendingBPOs: builder.query<PendingBPO[], void>({
      query: () => ({
        url: '/challans/pending-bpos',
        method: 'GET',
      }),
    }),

    // Get dispatch summary
    getDispatchSummary: builder.query<DispatchSummary, void>({
      query: () => ({
        url: '/challans/dispatch-summary',
        method: 'GET',
      }),
    }),

    // Get all challans with filters
    getAllChallans: builder.query<
      Challan[],
      GetChallansQueryParams
    >({
      query: (params) => ({
        url: '/challans',
        method: 'GET',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status,
          search: params.search,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }),
    }),

    // Get challan by ID
    getChallanById: builder.query<Challan, string>({
      query: (id) => ({
        url: `/challans/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Challan', id }],
    }),

    // Get challans by BPO ID
    getChallansByBPOId: builder.query<Challan[], string>({
      query: (bpoId) => ({
        url: `/challans/bpo/${bpoId}/challans`,
        method: 'GET',
      }),
    }),

    // Create challan
    createChallan: builder.mutation<Challan, CreateChallanDto>({
      query: (challanData) => ({
        url: '/challans',
        method: 'POST',
        body: challanData,
      }),
    }),

    // Mark BPO as dispatched (creates challan automatically)
    markAsDispatched: builder.mutation<Challan, DispatchBPODto>({
      query: (dispatchData) => ({
        url: '/challans/dispatch-bpo',
        method: 'POST',
        body: dispatchData,
      }),
    }),

    // Update challan status
    updateChallanStatus: builder.mutation<
      ApiResponse<Challan>,
      { id: string; data: UpdateChallanStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/challans/${id}/status`,
        method: 'PUT',
        body: data,
      }),
    }),

    // // Download challan as PDF
    // downloadChallanPDF: builder.mutation<
    //   { success: boolean; url: string; filename: string },
    //   string
    // >({
    //   query: (challanId) => ({
    //     url: `/challans/${challanId}/download`,
    //     method: 'GET',
    //     responseHandler: async (response) => {
    //       const blob = await response.blob();
    //       const url = window.URL.createObjectURL(blob);
    //       const contentDisposition = response.headers.get('content-disposition');
    //       const filename = contentDisposition
    //         ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    //         : `challan-${challanId}.pdf`;
          
    //       return { success: true, url, filename };
    //     },
    //     cache: 'no-cache',
    //   }),
    // }),

    // Get BPO details by ID
    getBPODetails: builder.query<BpoSummary, string>({
      query: (bpoId) => ({
        url: `/challans/bpo/${bpoId}/details`,
        method: 'GET',
      }),
    }),

    // Check inventory availability for BPO
    checkInventoryAvailability: builder.query<
      ApiResponse<{
        isAvailable: boolean;
        missingItems: Array<{
          inventoryId: string;
          productName: string;
          required: number;
          available: number;
          shortfall: number;
        }>;
      }>,
      string
    >({
      query: (bpoId) => ({
        url: `/challans/bpo/${bpoId}/check-inventory`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPendingBPOsQuery,
  useGetDispatchSummaryQuery,
  useGetAllChallansQuery,
  useGetChallanByIdQuery,
  useGetChallansByBPOIdQuery,
  useCreateChallanMutation,
  useMarkAsDispatchedMutation,
  useUpdateChallanStatusMutation,
  // useDownloadChallanPDFMutation,
  useGetBPODetailsQuery,
  useCheckInventoryAvailabilityQuery,
  
  // Hook exports for manual cache updates
  endpoints: {
    getPendingBPOs,
    getDispatchSummary,
    getAllChallans,
    getChallanById,
    getChallansByBPOId,
    createChallan,
    markAsDispatched,
    updateChallanStatus,
    // downloadChallanPDF,
    getBPODetails,
    checkInventoryAvailability,
  },
} = challanApi;