import { baseApi } from './baseApi';
import {
  Employee,
  Salary,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateSalaryRequest,
  PaySalaryRequest,
  PayablesResponse,
  SalaryStatistics,
  TrendsResponse,
  PayablesRequest,
  StatisticsRequest,
  TrendsRequest,
} from '@/types/employee';

// Define the response wrapper type
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface MonthlySalaryGenerationResponse {
  month: number;
  year: number;
  summary: {
    totalEmployees: number;
    created: number;
    skipped: number;
    errors: number;
  };
  details: {
    created: Array<{
      employeeId: string;
      employeeName: string;
      salaryId: string;
      netSalary: number;
    }>;
    skipped: Array<{
      employeeId: string;
      employeeName: string;
      reason: string;
    }>;
    errors: Array<{
      employeeId: string;
      employeeName: string;
      error: string;
    }>;
  };
}

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Employee endpoints
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      transformResponse: (response: ApiResponse<Employee[]>) => response.data,
      providesTags: ['Employee'],
    }),

    getEmployee: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      transformResponse: (response: ApiResponse<Employee>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),

    createEmployee: builder.mutation<Employee, CreateEmployeeRequest>({
      query: (body) => ({
        url: '/employees',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Employee>) => response.data,
      invalidatesTags: ['Employee'],
    }),

    updateEmployee: builder.mutation<Employee, { id: string; body: UpdateEmployeeRequest }>({
      query: ({ id, body }) => ({
        url: `/employees/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<Employee>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Employee', id }],
    }),

    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),

    // Salary endpoints
    getSalaries: builder.query<Salary[], string>({
      query: (employeeId) => `/employees/${employeeId}/salaries`,
      transformResponse: (response: ApiResponse<Salary[]>) => response.data,
      providesTags: (result, error, employeeId) => [{ type: 'Salary', employeeId }],
    }),

    createSalary: builder.mutation<Salary, CreateSalaryRequest>({
      query: (body) => ({
        url: '/employees/salaries',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Salary>) => response.data,
      invalidatesTags: ['Salary', 'Payables', 'Statistics'],
    }),

    paySalary: builder.mutation<Salary, PaySalaryRequest>({
      query: (body) => ({
        url: '/employees/salaries/pay',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Salary>) => response.data,
      invalidatesTags: ['Salary', 'Payables', 'Statistics'],
    }),

    // NEW MUTATION: Generate Monthly Salaries
    generateMonthlySalaries: builder.mutation<MonthlySalaryGenerationResponse, { month?: number; year?: number }>({
      query: ({ month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        
        return {
          url: `/employees/salaries/generate-monthly?${params.toString()}`,
          method: 'POST',
        };
      },
      transformResponse: (response: ApiResponse<MonthlySalaryGenerationResponse>) => response.data,
      invalidatesTags: ['Salary', 'Payables', 'Statistics'],
    }),

    getSalaryReport: builder.query<Salary[], { month: number; year: number }>({
      query: ({ month, year }) => 
        `/employees/reports/salaries?month=${month}&year=${year}`,
      transformResponse: (response: ApiResponse<Salary[]>) => response.data,
      providesTags: ['Salary'],
    }),

    // New endpoints for payables and statistics
    getPayables: builder.query<PayablesResponse, PayablesRequest>({
      query: ({ month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        
        return `/employees/payables/salaries?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PayablesResponse>) => response.data,
      providesTags: ['Payables'],
    }),

    getSalaryStatistics: builder.query<SalaryStatistics, StatisticsRequest>({
      query: ({ month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        
        return `/employees/statistics/salaries?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<SalaryStatistics>) => response.data,
      providesTags: ['Statistics'],
    }),

    getMonthlyTrends: builder.query<TrendsResponse, TrendsRequest>({
      query: ({ year }) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());
        
        return `/employees/trends/salaries?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<TrendsResponse>) => response.data,
      providesTags: ['Statistics'],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetSalariesQuery,
  useCreateSalaryMutation,
  usePaySalaryMutation,
  useGenerateMonthlySalariesMutation,
  useGetSalaryReportQuery,
  useGetPayablesQuery,
  useGetSalaryStatisticsQuery,
  useGetMonthlyTrendsQuery,
} = employeeApi;