/**
 * @module redux/features/branchesSlice
 *
 * Branches domain RTK Query endpoints (§56, §42).
 * Injects into the single apiSlice descriptor.
 */

import { apiSlice } from "./apiSlice.js";

const branchesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: ({ page = 1, limit = 10, sort = "name", isArchived = "all" }) => ({
        url: "/branches",
        params: { page, limit, sort, isArchived },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.docs.map(({ _id }) => ({ type: "Branch", id: _id })),
              { type: "Branch", id: "LIST" },
            ]
          : [{ type: "Branch", id: "LIST" }],
    }),
    getBranch: builder.query({
      query: (branchId) => `/branches/${branchId}`,
      providesTags: (result, error, id) => [{ type: "Branch", id }],
    }),
    getBranchDetail: builder.query({
      query: ({ branchId, page = 1, limit = 10 }) => ({
        url: `/branches/${branchId}/detail`,
        params: { page, limit },
      }),
      providesTags: (result, error, { branchId }) => [
        { type: "Branch", id: branchId },
        { type: "Branch", id: "LIST" },
      ],
    }),
    createBranch: builder.mutation({
      query: (body) => ({ url: "/branches", method: "POST", body }),
      invalidatesTags: [{ type: "Branch", id: "LIST" }],
    }),
    updateBranch: builder.mutation({
      query: ({ branchId, ...body }) => ({
        url: `/branches/${branchId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { branchId }) => [
        { type: "Branch", id: branchId },
        { type: "Branch", id: "LIST" },
      ],
    }),
    archiveBranch: builder.mutation({
      query: (branchId) => ({
        url: `/branches/${branchId}/archive`,
        method: "POST",
      }),
      invalidatesTags: (result, error, branchId) => [
        { type: "Branch", id: branchId },
        { type: "Branch", id: "LIST" },
      ],
    }),
    restoreBranch: builder.mutation({
      query: (branchId) => ({
        url: `/branches/${branchId}/restore`,
        method: "POST",
      }),
      invalidatesTags: (result, error, branchId) => [
        { type: "Branch", id: branchId },
        { type: "Branch", id: "LIST" },
      ],
    }),
    deleteBranch: builder.mutation({
      query: (branchId) => ({ url: `/branches/${branchId}`, method: "DELETE" }),
      invalidatesTags: (result, error, branchId) => [
        { type: "Branch", id: branchId },
        { type: "Branch", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchQuery,
  useGetBranchDetailQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useArchiveBranchMutation,
  useRestoreBranchMutation,
  useDeleteBranchMutation,
} = branchesApi;
