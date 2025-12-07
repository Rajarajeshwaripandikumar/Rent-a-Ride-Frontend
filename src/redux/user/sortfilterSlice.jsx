// redux/user/sortfilterSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Normalized vehicle shape used internally:
 * {
 *   id,
 *   title,
 *   brand,
 *   price: number,
 *   year_made: number,
 *   fuel,
 *   seats,
 *   thumbnail,
 *   car_type,
 *   transmission,
 *   __raw
 * }
 */

const initialState = {
  data: [],          // original normalized list (source)
  filteredData: [],  // shown list after sort/filter
  variantMode: false,
};

const normalizeStr = (v) => (v === null || v === undefined ? "" : String(v).trim());

const sortfilterSlice = createSlice({
  name: "sortfilterSlice",
  initialState,
  reducers: {
    // payload: array of raw vehicle objects (from API/other slice)
    setData: (state, action) => {
      const raw = Array.isArray(action.payload) ? action.payload : [];

      // Normalize into canonical shape (do not mutate incoming objects)
      const normalized = raw.map((v, idx) => {
        const price =
          Number(v?.pricePerDay ?? v?.price ?? v?.dailyPrice ?? v?.cost ?? 0) || 0;

        const year_made =
          Number(v?.year ?? v?.year_made ?? v?.manufacturedYear ?? 0) || 0;

        // canonical car_type / transmission fields
        const car_type = normalizeStr(v?.car_type ?? v?.type ?? v?.carType ?? v?.__raw?.car_type);
        const transmission = normalizeStr(v?.transmission ?? v?.transmition ?? v?.transmission_type ?? v?.__raw?.transmission);

        return {
          id: v?.id ?? v?._id ?? `${idx}`,
          title: v?.title ?? v?.name ?? "",
          brand: v?.brand ?? v?.make ?? v?.company ?? "",
          price,
          year_made,
          fuel: v?.fuel ?? v?.fuel_type ?? v?.fuelType ?? "",
          seats: Number(v?.seats ?? v?.seat ?? 0) || 0,
          thumbnail: v?.thumbnail ?? v?.image ?? v?.img ?? "",
          car_type,
          transmission,
          __raw: v,
        };
      });

      state.data = normalized;
      state.filteredData = [...normalized];
    },

    // pure sort helpers operate on a copy of filteredData
    setPriceLowtoHigh: (state) => {
      state.filteredData = [...state.filteredData].sort((a, b) => a.price - b.price);
    },
    setPriceHightoLow: (state) => {
      state.filteredData = [...state.filteredData].sort((a, b) => b.price - a.price);
    },
    setYearAscending: (state) => {
      state.filteredData = [...state.filteredData].sort(
        (a, b) => a.year_made - b.year_made
      );
    },
    setYearDecending: (state) => {
      state.filteredData = [...state.filteredData].sort(
        (a, b) => b.year_made - a.year_made
      );
    },

    // direct replace (used by component when computing multi-criteria)
    setFilteredData: (state, action) => {
      state.filteredData = Array.isArray(action.payload) ? action.payload : [];
    },

    // client-side filter: accepts { car_type?: string[], transmission?: string[] }
    applyFilters: (state, action) => {
      const filters = action.payload || {};
      const { car_type, transmission } = filters;

      // If no filters provided, reset to original data
      if ((!Array.isArray(car_type) || car_type.length === 0) &&
          (!Array.isArray(transmission) || transmission.length === 0)) {
        state.filteredData = [...state.data];
        return;
      }

      // normalize filter values to lower-case trimmed strings
      const carTypeSet = Array.isArray(car_type)
        ? new Set(car_type.map((s) => String(s).trim().toLowerCase()))
        : null;
      const transSet = Array.isArray(transmission)
        ? new Set(transmission.map((s) => String(s).trim().toLowerCase()))
        : null;

      state.filteredData = state.data.filter((item) => {
        let ok = true;
        if (carTypeSet && carTypeSet.size) {
          const val = String(item?.car_type ?? "").trim().toLowerCase();
          ok = ok && carTypeSet.has(val);
        }
        if (transSet && transSet.size) {
          const val = String(item?.transmission ?? "").trim().toLowerCase();
          ok = ok && transSet.has(val);
        }
        return ok;
      });
    },

    setVariantModeOrNot: (state, action) => {
      state.variantMode = Boolean(action.payload);
    },

    // optional: reset filters back to original
    resetFilters: (state) => {
      state.filteredData = [...state.data];
    },
  },
});

export const {
  setPriceLowtoHigh,
  setPriceHightoLow,
  setYearAscending,
  setYearDecending,
  setData,
  setFilteredData,
  applyFilters,
  setVariantModeOrNot,
  resetFilters,
} = sortfilterSlice.actions;

export default sortfilterSlice.reducer;

// selector helpers
export const selectFilteredVehicles = (state) =>
  state.sortfilterSlice?.filteredData ?? [];
export const selectAllVehicles = (state) => state.sortfilterSlice?.data ?? [];
