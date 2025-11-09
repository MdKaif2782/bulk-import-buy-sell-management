import { selectCurrentUser, selectUserRole, selectIsAuthenticated } from "@/lib/store/slices/authSlice"
import { useAppSelector } from "./useRedux"

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = (window!==undefined)?localStorage.getItem("role"):"ADMIN"
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const hasRole = (requiredRole: string) => {
    if (!role) return false
    
    const roleHierarchy = {
      STAFF: 0,
      MANAGER: 1,
      ADMIN: 2,
    }
    
    return roleHierarchy[role as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole as keyof typeof roleHierarchy]
  }

  const hasAnyRole = (roles: string[]) => {
    return roles.some(requiredRole => hasRole(requiredRole))
  }

  return {
    user,
    role,
    isAuthenticated,
    hasRole,
    hasAnyRole,
  }
}