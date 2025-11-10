import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../index'

const baseQuery = fetchBaseQuery({
  //baseUrl: 'https://middleman-backend.vercel.app',
  baseUrl: 'http://localhost:2000',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult?.data) {
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as any
        
        // Update tokens in store and localStorage
        api.dispatch({
          type: 'auth/updateTokens',
          payload: { accessToken, refreshToken: newRefreshToken }
        })
        
        // Retry original request with new token
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch({ type: 'auth/logOut' })
      }
    } else {
      api.dispatch({ type: 'auth/logOut' })
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Product',
    'PurchaseOrder',
    'Bill',
    'Expense',
    'Investor',
    'Quotation',
    'Challan',
    'Report'
  ],
  endpoints: () => ({}),
})