import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "./store"

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export function useAuth() {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth)
  return { user, isAuthenticated, token }
}
