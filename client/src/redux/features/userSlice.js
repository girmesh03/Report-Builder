/**
 * @module redux/features/userSlice
 *
 * The client's §28 session surface as the user-domain endpoint set
 * (§42.6; file naming per the <domain>Slice.js convention): login,
 * register, logout, and the Google OAuth stub entry. Injected into
 * the single apiSlice descriptor exactly once (§42.2).
 *
 * All auth mutations use transformResponse to extract the flat user
 * object from the envelope — this ensures consumers receive the
 * UserDto with virtuals (fullName, etc.) directly, never nested under
 * `user.user`.
 */
import { apiSlice } from "./apiSlice.js";

/**
 * Extracts the flat user object from the §27.4 envelope.
 * Backend returns: { success, message, data: { user: UserDto } }
 * apiSlice normalizes to: { data: { user: UserDto } }
 * This transform returns the flat UserDto so .unwrap() yields the
 * user object directly with virtuals (fullName, etc.) intact.
 * @param {Object} response - The normalized RTK Query response.
 * @returns {Object} The flat UserDto with virtuals.
 */
const extractUser = (response) => response.data?.user;

const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
      }),
      transformResponse: extractUser,
      extraOptions: { skipReauth: true },
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/register",
        method: "POST",
        body: { email, password },
      }),
      transformResponse: extractUser,
      extraOptions: { skipReauth: true },
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    refresh: builder.mutation({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
      transformResponse: extractUser,
      extraOptions: { skipReauth: true },
      invalidatesTags: ["User"],
    }),
    googleAuth: builder.mutation({
      query: () => ({ url: "/auth/google", method: "GET" }),
      transformResponse: extractUser,
      extraOptions: { skipReauth: true },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGoogleAuthMutation,
} = userSlice;
