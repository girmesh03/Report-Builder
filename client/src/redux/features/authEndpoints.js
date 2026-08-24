/**
 * @module redux/features/authEndpoints
 *
 * The client's §28 session surface (§42.6): login, register,
 * logout, and the Google OAuth stub entry. Injected into the single
 * apiSlice descriptor exactly once (§42.2).
 */
import { apiSlice } from "./apiSlice.js";
import { HTTP_STATUS } from "../../utils/httpStatus.js";

/**
 * Login rejects in place — a 401 here is a credential rejection to
 * toast, not a session expiry, so the reauth chain must skip it.
 */
const authEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
      }),
      extraOptions: { skipReauth: true },
      invalidatesTags: ["Me"],
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
      invalidatesTags: ["Me"],
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
} = authEndpoints;

/** Status code the forms branch on for duplicate-email copy. */
export const DUPLICATE_STATUS = HTTP_STATUS.CONFLICT;
