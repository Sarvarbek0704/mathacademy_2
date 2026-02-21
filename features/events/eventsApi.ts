import { apiSlice } from "@/lib/api"
import type { Event, PaginatedResponse, PaginationParams } from "@/types"

export const eventsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<PaginatedResponse<Event>, PaginationParams>({
      query: (params) => ({ url: "/staff/events", params }),
      providesTags: ["Events"],
    }),
    getEvent: builder.query<Event, string>({
      query: (id) => `/staff/events/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Events", id }],
    }),
    createEvent: builder.mutation<Event, Partial<Event>>({
      query: (body) => ({ url: "/staff/events", method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation<Event, { id: string; body: Partial<Event> }>({
      query: ({ id, body }) => ({ url: `/staff/events/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Events"],
    }),
    getEventParticipants: builder.query<unknown[], string>({
      query: (id) => `/staff/events/${id}/participants`,
      providesTags: ["Events"],
    }),
    addEventParticipants: builder.mutation<void, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/staff/events/${id}/participants/add`, method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
    removeEventParticipants: builder.mutation<void, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/staff/events/${id}/participants`, method: "DELETE", body }),
      invalidatesTags: ["Events"],
    }),
  }),
})

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventParticipantsQuery,
  useAddEventParticipantsMutation,
  useRemoveEventParticipantsMutation,
} = eventsApi
