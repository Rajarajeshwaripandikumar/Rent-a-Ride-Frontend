import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // theme
  mode: "light",

  // admin auth/profile
  currentAdmin: null,
  loading: false,
  error: null,
  isUpdated: false,
};

const adminSlice = createSlice({
  name: "admin", // 👈 selector will be state.admin.*
  initialState,
  reducers: {
    // THEME TOGGLE
    setMode: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },

    // AUTH / ADMIN STATE
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.currentAdmin = action.payload;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutAdmin: (state) => {
      state.currentAdmin = null;
      state.loading = false;
      state.error = null;
      state.isUpdated = false;
    },

    // used by ProfileEditAdmin for optimistic update
    editAdminProfile: (state, action) => {
      if (!state.currentAdmin) return;
      state.currentAdmin = {
        ...state.currentAdmin,
        ...action.payload,
      };
    },

    // used after successful update
    setAdminUpdated: (state, action) => {
      state.isUpdated = action.payload;
    },
  },
});

export const {
  setMode,
  signInStart,
  signInSuccess,
  signInFailure,
  logoutAdmin,
  editAdminProfile,
  setAdminUpdated,
} = adminSlice.actions;

export default adminSlice.reducer;
