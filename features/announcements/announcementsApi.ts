import { apiSlice } from "@/lib/api"
import type { Announcement, PaginatedResponse, PaginationParams } from "@/types"

export const announcementsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<PaginatedResponse<Announcement>, PaginationParams>({
      query: (params) => ({ url: "/staff/announcements", params }),
      providesTags: ["Announcements"],
    }),
    getAnnouncement: builder.query<Announcement, string>({
      query: (id) => `/staff/announcements/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Announcements", id }],
    }),
    createAnnouncement: builder.mutation<Announcement, Partial<Announcement>>({
      query: (body) => ({ url: "/staff/announcements", method: "POST", body }),
      invalidatesTags: ["Announcements"],
    }),
    updateAnnouncement: builder.mutation<Announcement, { id: string; body: Partial<Announcement> }>({
      query: ({ id, body }) => ({ url: `/staff/announcements/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Announcements"],
    }),
    deleteAnnouncement: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/announcements/${id}`, method: "DELETE" }),
      invalidatesTags: ["Announcements"],
    }),
    publishAnnouncement: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/announcements/${id}/publish`, method: "POST" }),
      invalidatesTags: ["Announcements"],
    }),
    unpublishAnnouncement: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/announcements/${id}/unpublish`, method: "POST" }),
      invalidatesTags: ["Announcements"],
    }),
  }),
})

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
  useUnpublishAnnouncementMutation,
} = announcementsApi
