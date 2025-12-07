import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vendorVehicles: [],          // vendor’s own vehicles
  adminVendorRequests: [],     // ADMIN: pending vendor-vehicle requests
  vendorVehicleApproved: [],   // approved vendor vehicles (optional)
  
  vendorEditSuccess: false,
  vendorError: false,
  vendorDeleteSuccess: false,
};

export const vendorDashboardSlice = createSlice({
  name: "vendorDashboardSlice",
  initialState,
  reducers: {
    /* ------------------------------------------
       SET vendor’s own vehicles
    --------------------------------------------- */
    setVendorVehicles: (state, action) => {
      state.vendorVehicles = action.payload;
    },

    /* ------------------------------------------
       SET admin vendor-vehicle requests
    --------------------------------------------- */
    setAdminVendorRequests: (state, action) => {
      state.adminVendorRequests = action.payload;
    },

    /* ------------------------------------------
       UPDATE request table after Approve/Reject
       Removes it from Redux immediately
    --------------------------------------------- */
    setUpdateRequestTable: (state, action) => {
      const id = action.payload;
      state.adminVendorRequests = state.adminVendorRequests.filter(
        (item) => item._id !== id
      );
    },

    /* ------------------------------------------
       (Optional) Set approved vendor vehicles
    --------------------------------------------- */
    setVendorVehicleApproved: (state, action) => {
      state.vendorVehicleApproved = action.payload;
    },

    /* ------------------------------------------
       Success/Error Flags for vendor actions
    --------------------------------------------- */
    setVendorEditSuccess: (state, action) => {
      state.vendorEditSuccess = action.payload;
    },

    setVendorError: (state, action) => {
      state.vendorError = action.payload;
    },

    setVendorDeleteSuccess: (state, action) => {
      state.vendorDeleteSuccess = action.payload;
    },
  },
});

/* ============================================================
   EXPORT ACTIONS
=============================================================== */
export const {
  setVendorVehicles,
  setAdminVendorRequests,
  setUpdateRequestTable,
  setVendorVehicleApproved,
  setVendorEditSuccess,
  setVendorError,
  setVendorDeleteSuccess,
} = vendorDashboardSlice.actions;

/* ============================================================
   EXPORT REDUCER
=============================================================== */
export default vendorDashboardSlice.reducer;
