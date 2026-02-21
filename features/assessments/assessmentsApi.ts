import { apiSlice } from "@/lib/api"
import type { Assessment, AssessmentScore, AssessmentStatistics, PaginatedResponse, PaginationParams } from "@/types"

export const assessmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssessments: builder.query<PaginatedResponse<Assessment>, PaginationParams & { subjectId?: string; groupId?: string }>({
      query: (params) => ({ url: "/staff/assessments", params }),
      providesTags: ["Assessments"],
    }),
    getAssessment: builder.query<Assessment, string>({
      query: (id) => `/staff/assessments/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Assessments", id }],
    }),
    createAssessment: builder.mutation<Assessment, Partial<Assessment>>({
      query: (body) => ({ url: "/staff/assessments", method: "POST", body }),
      invalidatesTags: ["Assessments"],
    }),
    updateAssessment: builder.mutation<Assessment, { id: string; body: Partial<Assessment> }>({
      query: ({ id, body }) => ({ url: `/staff/assessments/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Assessments"],
    }),
    deleteAssessment: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/assessments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Assessments"],
    }),
    getAssessmentScores: builder.query<AssessmentScore[], string>({
      query: (id) => `/staff/assessments/${id}/scores`,
      providesTags: ["Assessments"],
    }),
    updateAssessmentScores: builder.mutation<void, { id: string; scores: Partial<AssessmentScore>[] }>({
      query: ({ id, scores }) => ({
        url: `/staff/assessments/${id}/scores`,
        method: "PUT",
        body: { scores },
      }),
      invalidatesTags: ["Assessments"],
    }),
    getAssessmentStats: builder.query<AssessmentStatistics, void>({
      query: () => "/staff/assessments/statistics",
      providesTags: ["Assessments"],
    }),
  }),
})

export const {
  useGetAssessmentsQuery,
  useGetAssessmentQuery,
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useDeleteAssessmentMutation,
  useGetAssessmentScoresQuery,
  useUpdateAssessmentScoresMutation,
  useGetAssessmentStatsQuery,
} = assessmentsApi
