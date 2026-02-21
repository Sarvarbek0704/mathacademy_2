import { apiSlice } from "@/lib/api"
import type { Student, StudentStatistics, PaginatedResponse, PaginationParams } from "@/types"

export const studentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<PaginatedResponse<Student>, PaginationParams & { status?: string; groupId?: string; cohortId?: string }>({
      query: (params) => ({
        url: "/staff/students",
        params,
      }),
      providesTags: ["Students"],
    }),
    getStudentStats: builder.query<StudentStatistics, void>({
      query: () => "/staff/students/statistics",
      providesTags: ["Students"],
    }),
    getStudent: builder.query<Student, string>({
      query: (id) => `/staff/students/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Students", id }],
    }),
    createStudent: builder.mutation<Student, Partial<Student>>({
      query: (body) => ({
        url: "/staff/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),
    updateStudent: builder.mutation<Student, { id: string; body: Partial<Student> }>({
      query: ({ id, body }) => ({
        url: `/staff/students/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Students"],
    }),
    deleteStudent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/staff/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),
    assignStudentGroup: builder.mutation<void, { id: string; groupId: string }>({
      query: ({ id, ...body }) => ({
        url: `/staff/students/${id}/group`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students", "Groups"],
    }),
    removeStudentGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/staff/students/${id}/group`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students", "Groups"],
    }),
    getStudentHistory: builder.query<unknown[], string>({
      query: (id) => `/staff/students/${id}/history`,
    }),
  }),
})

export const {
  useGetStudentsQuery,
  useGetStudentStatsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAssignStudentGroupMutation,
  useRemoveStudentGroupMutation,
  useGetStudentHistoryQuery,
} = studentsApi
