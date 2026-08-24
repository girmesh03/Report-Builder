/**
 * @module redux/features/userSlice
 *
 * The client's §28 session surface as the user-domain endpoint set
 * (§42.6; file naming per the <domain>Slice.js convention): login,
 * register, logout, and the Google OAuth stub entry. Injected into
 * the single apiSlice descriptor exactly once (§42.2).
 */
import { apiSlice } from "./apiSlice.js";

/**
 * Login rejects in place — a 401 here is a credential rejection to
 * toast, not a session expiry, so the reauth chain must skip it.
 */
const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
      }),
      extraOptions: { skipReauth: true },
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/register",
        method: "POST",
        body: { email, password },
      }),
      extraOptions: { skipReauth: true },
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    googleAuth: builder.mutation({
      query: () => ({ url: "/auth/google", method: "GET" }),
      extraOptions: { skipReauth: true },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleAuthMutation,
} = userSlice;
