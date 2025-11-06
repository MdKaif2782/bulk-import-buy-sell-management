import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'MANAGER' | 'STAFF'
  } | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
}

// Safe localStorage access
const getStoredToken = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  _hasHydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      user: AuthState['user']
      accessToken: string
      refreshToken: string
    }>) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.isAuthenticated = true
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
      }
    },
    logOut: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    },
    updateTokens: (state, action: PayloadAction<{
      accessToken: string
      refreshToken: string
    }>) => {
      const { accessToken, refreshToken } = action.payload
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
      }
    },
    hydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        
        state.accessToken = accessToken
        state.refreshToken = refreshToken
        state.isAuthenticated = !!accessToken
        state._hasHydrated = true
      }
    },
  },
})

export const { setCredentials, logOut, updateTokens, hydrateAuth } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role
export const selectHasHydrated = (state: { auth: AuthState }) => state.auth._hasHydrated