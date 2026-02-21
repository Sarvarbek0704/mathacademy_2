import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
    if (refreshToken) {
      const refreshResult = await baseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      )
      if (refreshResult.data) {
        const data = refreshResult.data as { accessToken: string }
        localStorage.setItem("accessToken", data.accessToken)
        result = await baseQuery(args, api, extraOptions)
      } else {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    } else {
      localStorage.removeItem("accessToken")
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Students", "Groups", "Users", "Subjects", "Attendance", "Assessments",
    "Billing", "Discipline", "Timetable", "Events", "Announcements", "Awards",
    "Certificates", "Competitions", "Ranking", "Dorms", "Displays", "Leaves",
    "Notifications", "Files", "Roles", "Permissions", "AcademicYears",
    "Campuses", "Cohorts", "Tracks", "Tenants", "Auth", "Risk", "Outcomes",
  ],
  endpoints: () => ({}),
})
