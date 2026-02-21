import { apiSlice } from "@/lib/api"
import type { Invoice, Payment, BillingDashboard, PaginatedResponse, PaginationParams } from "@/types"

export const billingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<PaginatedResponse<Invoice>, PaginationParams & { status?: string; studentId?: string }>({
      query: (params) => ({ url: "/staff/billing/invoices", params }),
      providesTags: ["Billing"],
    }),
    getInvoice: builder.query<Invoice, string>({
      query: (id) => `/staff/billing/invoices/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Billing", id }],
    }),
    createInvoice: builder.mutation<Invoice, Partial<Invoice>>({
      query: (body) => ({ url: "/staff/billing/invoices", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),
    updateInvoice: builder.mutation<Invoice, { id: string; body: Partial<Invoice> }>({
      query: ({ id, body }) => ({ url: `/staff/billing/invoices/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Billing"],
    }),
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({ url: `/staff/billing/invoices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Billing"],
    }),
    createPayment: builder.mutation<Payment, Partial<Payment>>({
      query: (body) => ({ url: "/staff/billing/payments", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),
    getPayments: builder.query<PaginatedResponse<Payment>, PaginationParams>({
      query: (params) => ({ url: "/staff/billing/payments", params }),
      providesTags: ["Billing"],
    }),
    getBillingDashboard: builder.query<BillingDashboard, void>({
      query: () => "/staff/billing/dashboard",
      providesTags: ["Billing"],
    }),
  }),
})

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useGetBillingDashboardQuery,
} = billingApi
