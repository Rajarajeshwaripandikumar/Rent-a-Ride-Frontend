// src/redux/.../selectRideSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDistrict: null,
  locationsOfDistrict: [],
  wholeData: [],
  availableCars: [],
};

// Normalizer: ensure we always store an array regardless of backend shape
function normalizeArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw.data && Array.isArray(raw.data)) return raw.data;
  if (raw.available && Array.isArray(raw.available)) return raw.available;
  if (raw.vehicles && Array.isArray(raw.vehicles)) return raw.vehicles;

  // fallback: find first array inside an object
  const firstArray = Object.values(raw).find((v) => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

const selectRideSlice = createSlice({
  name: "selectRideSlice",
  initialState,
  reducers: {
    setSelectedDistrict: (state, action) => {
      state.selectedDistrict = action.payload;
    },
    setLocationsOfDistrict: (state, action) => {
      state.locationsOfDistrict = action.payload;
    },
    setWholeData: (state, action) => {
      state.wholeData = action.payload;
    },
    setAvailableCars: (state, action) => {
      state.availableCars = normalizeArray(action.payload);
    },
  },
});

export const {
  setSelectedDistrict,
  setLocationsOfDistrict,
  setWholeData,
  setAvailableCars,
} = selectRideSlice.actions;

export default selectRideSlice.reducer;
