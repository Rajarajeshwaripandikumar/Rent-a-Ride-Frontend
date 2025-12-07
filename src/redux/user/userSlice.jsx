// src/redux/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Async thunk to update the user profile.
 * Accepts either:
 *  - { id, formData }  -> sends multipart/form-data (for avatar + fields)
 *  - { id, payload }   -> sends JSON (for text-only updates)
 *
 * Server should respond with the updated user object (recommended).
 */
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async ({ id, formData, payload }, { rejectWithValue }) => {
    try {
      const url = `/api/user/editUserProfile/${id}`;

      // formData prioritized if present
      if (formData instanceof FormData) {
        const res = await fetch(url, {
          method: "POST",
          body: formData, // browser sets Content-Type boundary
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          return rejectWithValue(text || "Upload failed");
        }
        const data = await res.json();
        return data; // expected: updated user object or { profilePicture: url, ... }
      }

      // otherwise send JSON payload (text-only update)
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ formData: payload ?? {} }), // keep parity with your existing server shape
      });

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text || "Update failed");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const initialState = {
  currentUser: null,
  token: null, // ✅ app JWT from backend
  isUpdated: false,
  isLoading: false,
  isError: false, // can be boolean or message
  isSweetAlert: false,
  isPageLoading: false,
  isOrderModalOpen: false,
  singleOrderDetails: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.isLoading = true;
      state.isError = false;
    },

    loadingEnd: (state) => {
      state.isLoading = false;
    },

    /**
     * signInSuccess now safely supports:
     *  1) payload = { token, user }      // OAuth/firebase pattern
     *  2) payload = userObject           // direct user
     *  3) payload = { token, ...user }   // flat backend response
     */
    signInSuccess: (state, action) => {
      const payload = action.payload || {};

      if (payload.user) {
        // Shape: { token, user }
        state.currentUser = payload.user;
        state.token = payload.token || payload.user.token || null;
      } else {
        // Shape: flat object from backend (includes token + user fields)
        state.currentUser = payload;
        state.token = payload.token || null;
      }

      state.isError = false;
      state.isLoading = false;
    },

    signInFailure: (state, action) => {
      state.isError =
        action.payload || action.error?.message || "Sign in failed";
      state.isLoading = false;
    },

    resetAuthState: (state) => {
      state.isLoading = false;
      state.isError = false;
    },

    deleteUserStart: (state) => {
      state.isLoading = true;
    },

    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isError = false;
      state.isLoading = false;
    },

    deleteUserFailure: (state, action) => {
      state.isLoading = false;
      state.isError =
        action.payload || action.error?.message || "Delete failed";
    },

    signOut: (state) => {
      state.currentUser = null;
      state.token = null; // ✅ clear JWT on logout
      state.isLoading = false;
      state.isError = false;
    },

    /**
     * Local synchronous update — keeps your existing reducer
     * (useful if you want to update store immediately before server confirms)
     */
    editUserProfile: (state, action) => {
      const { username, email, phoneNumber, adress } = action.payload;
      if (!state.currentUser) return;
      if (username !== undefined) state.currentUser.username = username;
      if (email !== undefined) state.currentUser.email = email;
      if (phoneNumber !== undefined) state.currentUser.phoneNumber = phoneNumber;
      if (adress !== undefined) state.currentUser.adress = adress;
    },

    setUpdated: (state, action) => {
      state.isUpdated = action.payload;
    },

    setIsSweetAlert: (state, action) => {
      state.isSweetAlert = action.payload;
    },

    setPageLoading: (state, action) => {
      state.isPageLoading = action.payload;
    },

    setIsOrderModalOpen: (state, action) => {
      state.isOrderModalOpen = Boolean(action.payload);
    },

    setSingleOrderDetails: (state, action) => {
      state.singleOrderDetails = action.payload ?? {};
    },

    clearSingleOrderDetails: (state) => {
      state.singleOrderDetails = {};
      state.isOrderModalOpen = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUpdated = true;
        state.isError = false;

        const payload = action.payload ?? {};

        // If the server returns a full user object under a key
        if (payload.currentUser) {
          state.currentUser = payload.currentUser;
          return;
        }

        // If server returns the updated user directly, or partial fields like profilePicture
        state.currentUser = {
          ...(state.currentUser || {}),
          ...(typeof payload === "object" ? payload : {}),
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError =
          action.payload || action.error?.message || "Update failed";
      });
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOut,
  editUserProfile,
  setUpdated,
  loadingEnd,
  setIsSweetAlert,
  setPageLoading,
  setIsOrderModalOpen,
  setSingleOrderDetails,
  resetAuthState,
  clearSingleOrderDetails,
} = userSlice.actions;

export default userSlice.reducer;
