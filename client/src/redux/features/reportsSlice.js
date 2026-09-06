/**
 * @module redux/features/reportsSlice
 *
 * Reports domain RTK Query endpoints (§31/§32/§33, §42).
 * Injects into the single apiSlice descriptor; consumers read
 * `result.docs` / `result.data` (never `result.data.*`, C22).
 * 401 = the global auth gate (reauth chain) — ever a per-page error.
 */

import { apiSlice } from "./apiSlice.js";

const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /reports — paginated list with filters (§31.3). */
    getReports: builder.query({
      query: ({ page = 1, limit = 10, sort = "-date", isArchived = "all", branch, generated }) => ({
        url: "/reports",
        params: { page, limit, sort, isArchived, branch, generated },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.docs.map(({ _id }) => ({ type: "Report", id: _id })),
              { type: "Report", id: "LIST" },
            ]
          : [{ type: "Report", id: "LIST" }],
    }),

    /** GET /reports/:reportId — single meta read (Meta-tab seed). */
    getReport: builder.query({
      query: (reportId) => `/reports/${reportId}`,
      providesTags: (result, error, id) => [{ type: "Report", id }],
    }),

    /** POST /reports — atomic multipart create (metadata + clips + createKey). */
    createReport: builder.mutation({
      query: ({ metadata, clips, createKey, clipIndexes }) => {
        const formData = new FormData();
        formData.append("metadata", JSON.stringify(metadata));
        formData.append("createKey", createKey);
        formData.append("clipIndexes", JSON.stringify(clipIndexes));
        clips.forEach((clip) => {
          formData.append("clips", clip, clip.name ?? "clip");
        });
        return { url: "/reports", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "Report", id: "LIST" }],
    }),

    /** PATCH /reports/:reportId — whole-block meta edit (date + visits). */
    updateReport: builder.mutation({
      query: ({ reportId, ...body }) => ({
        url: `/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { reportId }) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** POST /reports/:reportId/archive. */
    archiveReport: builder.mutation({
      query: (reportId) => ({
        url: `/reports/${reportId}/archive`,
        method: "POST",
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** POST /reports/:reportId/restore. */
    restoreReport: builder.mutation({
      query: (reportId) => ({
        url: `/reports/${reportId}/restore`,
        method: "POST",
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** DELETE /reports/:reportId — archived-only physical delete. */
    deleteReport: builder.mutation({
      query: (reportId) => ({ url: `/reports/${reportId}`, method: "DELETE" }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** GET /reports/:reportId/clips — flat list (§32.3). */
    getReportClips: builder.query({
      query: (reportId) => `/reports/${reportId}/clips`,
      providesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
      ],
    }),

    /** POST /reports/:reportId/clips — add a clip (multipart single `clip`). */
    addClip: builder.mutation({
      query: ({ reportId, clip, durationSec }) => {
        const formData = new FormData();
        formData.append("clip", clip, clip.name ?? "clip");
        if (durationSec !== undefined) {
          formData.append("durationSec", String(durationSec));
        }
        return {
          url: `/reports/${reportId}/clips`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { reportId }) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** DELETE /reports/:reportId/clips/:clipId — direct delete. */
    deleteClip: builder.mutation({
      query: ({ reportId, clipId }) => ({
        url: `/reports/${reportId}/clips/${clipId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { reportId }) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** GET /reports/:reportId/transcription — always 200 {raw, latest, readiness}. */
    getTranscription: builder.query({
      query: (reportId) => `/reports/${reportId}/transcription`,
      providesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
      ],
    }),

    /** PUT /reports/:reportId/transcription — re-transcribe only. */
    reTranscribe: builder.mutation({
      query: (reportId) => ({
        url: `/reports/${reportId}/transcription`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
        { type: "Report", id: "LIST" },
      ],
    }),

    /** PATCH /reports/:reportId/transcription — write `latest`. */
    patchTranscription: builder.mutation({
      query: ({ reportId, latest }) => ({
        url: `/reports/${reportId}/transcription`,
        method: "PATCH",
        body: { latest },
      }),
      invalidatesTags: (result, error, { reportId }) => [
        { type: "Report", id: reportId },
      ],
    }),

    /** PUT /reports/:reportId/transcription/revert — latest←raw. */
    revertTranscription: builder.mutation({
      query: (reportId) => ({
        url: `/reports/${reportId}/transcription/revert`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
      ],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useArchiveReportMutation,
  useRestoreReportMutation,
  useDeleteReportMutation,
  useGetReportClipsQuery,
  useAddClipMutation,
  useDeleteClipMutation,
  useGetTranscriptionQuery,
  useReTranscribeMutation,
  usePatchTranscriptionMutation,
  useRevertTranscriptionMutation,
} = reportsApi;

export default reportsApi;