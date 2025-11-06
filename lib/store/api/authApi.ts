import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut, updateTokens } from '../slices/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:2000/auth',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.accessToken
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
          url: '/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult?.data) {
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as any
        api.dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }))
        
        // Retry original request with new token
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logOut())
      }
    } else {
      api.dispatch(logOut())
    }
  }

  return result
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { email: string; password: string }) => ({
        url: '/local/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (error) {
          // Handle error
        }
      },
    }),
    register: builder.mutation({
      query: (userData: { email: string; password: string; name: string; role?: string }) => ({
        url: '/local/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (error) {
          // Handle error
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logOut())
        } catch (error) {
          dispatch(logOut())
        }
      },
    }),
    refreshToken: builder.mutation({
      query: (refreshToken: string) => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi