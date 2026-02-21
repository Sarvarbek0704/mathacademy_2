import { apiSlice } from "@/lib/api"
import type { AttendanceSession, AttendanceMark, AttendanceStatistics, PaginatedResponse, PaginationParams } from "@/types"

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceSessions: builder.query<PaginatedResponse<AttendanceSession>, PaginationParams & { groupId?: string; subjectId?: string }>({
      query: (params) => ({ url: "/staff/attendance/sessions", params }),
      providesTags: ["Attendance"],
    }),
    getAttendanceSession: builder.query<AttendanceSession, string>({
      query: (id) => `/staff/attendance/sessions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Attendance", id }],
    }),
    createAttendanceSession: builder.mutation<AttendanceSession, Partial<AttendanceSession>>({
      query: (body) => ({ url: "/staff/attendance/sessions", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    deleteAttendanceSession: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/attendance/sessions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceMarks: builder.query<AttendanceMark[], string>({
      query: (sessionId) => `/staff/attendance/sessions/${sessionId}/marks`,
      providesTags: ["Attendance"],
    }),
    updateAttendanceMarks: builder.mutation<void, { sessionId: string; marks: Partial<AttendanceMark>[] }>({
      query: ({ sessionId, marks }) => ({
        url: `/staff/attendance/sessions/${sessionId}/marks`,
        method: "PUT",
        body: { marks },
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceStats: builder.query<AttendanceStatistics, void>({
      query: () => "/staff/attendance/statistics",
      providesTags: ["Attendance"],
    }),
  }),
})

export const {
  useGetAttendanceSessionsQuery,
  useGetAttendanceSessionQuery,
  useCreateAttendanceSessionMutation,
  useDeleteAttendanceSessionMutation,
  useGetAttendanceMarksQuery,
  useUpdateAttendanceMarksMutation,
  useGetAttendanceStatsQuery,
} = attendanceApi
