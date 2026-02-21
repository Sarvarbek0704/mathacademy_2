import { apiSlice } from "@/lib/api"
import type { Group, Student, PaginatedResponse, PaginationParams } from "@/types"

export const groupsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<PaginatedResponse<Group>, PaginationParams>({
      query: (params) => ({ url: "/staff/groups", params }),
      providesTags: ["Groups"],
    }),
    getGroup: builder.query<Group, string>({
      query: (id) => `/staff/groups/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Groups", id }],
    }),
    createGroup: builder.mutation<Group, Partial<Group>>({
      query: (body) => ({ url: "/staff/groups", method: "POST", body }),
      invalidatesTags: ["Groups"],
    }),
    updateGroup: builder.mutation<Group, { id: string; body: Partial<Group> }>({
      query: ({ id, body }) => ({ url: `/staff/groups/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Groups"],
    }),
    deleteGroup: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/groups/${id}`, method: "DELETE" }),
      invalidatesTags: ["Groups"],
    }),
    getGroupMembers: builder.query<Student[], string>({
      query: (id) => `/staff/groups/${id}/members`,
      providesTags: ["Groups"],
    }),
    addGroupMembers: builder.mutation<void, { id: string; studentIds: string[] }>({
      query: ({ id, ...body }) => ({ url: `/staff/groups/${id}/members`, method: "POST", body }),
      invalidatesTags: ["Groups", "Students"],
    }),
    removeGroupMembers: builder.mutation<void, { id: string; studentIds: string[] }>({
      query: ({ id, ...body }) => ({ url: `/staff/groups/${id}/members`, method: "DELETE", body }),
      invalidatesTags: ["Groups", "Students"],
    }),
  }),
})

export const {
  useGetGroupsQuery,
  useGetGroupQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useGetGroupMembersQuery,
  useAddGroupMembersMutation,
  useRemoveGroupMembersMutation,
} = groupsApi
