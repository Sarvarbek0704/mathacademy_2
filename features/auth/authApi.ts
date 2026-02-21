import { apiSlice } from "@/lib/api"
import type { AuthResponse, AuthUser, Session } from "@/types"

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    staffLogin: builder.mutation<AuthResponse, { username: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/staff/login",
        method: "POST",
        body: credentials,
      }),
    }),
    guardianLogin: builder.mutation<AuthResponse, { studentId: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/guardian/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    logoutApi: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    changeStaffPassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: "/auth/staff/change-password",
        method: "POST",
        body,
      }),
    }),
    updateProfile: builder.mutation<AuthUser, Partial<AuthUser>>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getSessions: builder.query<Session[], void>({
      query: () => "/auth/sessions",
    }),
    deleteSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/auth/sessions/${sessionId}`,
        method: "DELETE",
      }),
    }),
    deleteAllSessions: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/sessions",
        method: "DELETE",
      }),
    }),
    adminResetStaffPassword: builder.mutation<void, { userId: string; newPassword: string }>({
      query: ({ userId, ...body }) => ({
        url: `/auth/admin/reset-staff-password/${userId}`,
        method: "POST",
        body,
      }),
    }),
    adminResetGuardianPassword: builder.mutation<void, { studentAccountId: string; newPassword: string }>({
      query: ({ studentAccountId, ...body }) => ({
        url: `/auth/admin/reset-guardian-password/${studentAccountId}`,
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useStaffLoginMutation,
  useGuardianLoginMutation,
  useGetMeQuery,
  useLogoutApiMutation,
  useChangeStaffPasswordMutation,
  useUpdateProfileMutation,
  useGetSessionsQuery,
  useDeleteSessionMutation,
  useDeleteAllSessionsMutation,
  useAdminResetStaffPasswordMutation,
  useAdminResetGuardianPasswordMutation,
} = authApi
