// src/redux/bookingDataSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pickup_district: "",
  pickup_location: "",
  dropoff_location: "",
  // pickupDate and dropoffDate are always objects of the form:
  // { humanReadable: ISOString, day, month, year, hour, minute }
  pickupDate: {},
  dropoffDate: {},
  selectedVehicle: "",
};

function ensureDateObject(input) {
  // Accept either a Date object, an ISO string, or a timestamp number.
  if (!input) return null;

  let date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "string") {
    // try parse string
    const parsed = new Date(input);
    if (isNaN(parsed)) return null;
    date = parsed;
  } else if (typeof input === "number") {
    date = new Date(input);
  } else {
    return null;
  }

  return {
    humanReadable: date.toISOString(), // parseable by new Date(...) later
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

const bookingDataSlice = createSlice({
  name: "bookingData",
  initialState,
  reducers: {
    // Generic setter for selection (accepts Date objects or ISO strings)
    setSelectedData: (state, action) => {
      const {
        pickup_district,
        pickup_location,
        dropoff_location,
        // either pass dates as `pickupDate`/`dropoffDate` (Date or ISO string)
        // or pass pickuptime/dropofftime as Date/ISO (legacy)
        pickupDate,
        dropoffDate,
        pickuptime,
        dropofftime,
        selectedVehicle,
      } = action.payload;

      if (pickup_district !== undefined) state.pickup_district = pickup_district;
      if (pickup_location !== undefined) state.pickup_location = pickup_location;
      if (dropoff_location !== undefined) state.dropoff_location = dropoff_location;
      if (selectedVehicle !== undefined) state.selectedVehicle = selectedVehicle;

      // Prefer pickupDate if provided; fallback to pickuptime
      const pDateObj = ensureDateObject(pickupDate) || ensureDateObject(pickuptime);
      if (pDateObj) state.pickupDate = pDateObj;

      const dDateObj = ensureDateObject(dropoffDate) || ensureDateObject(dropofftime);
      if (dDateObj) state.dropoffDate = dDateObj;
    },

    // Convenience setters:
    setPickupDate: (state, action) => {
      const obj = ensureDateObject(action.payload);
      if (obj) state.pickupDate = obj;
    },
    setDropoffDate: (state, action) => {
      const obj = ensureDateObject(action.payload);
      if (obj) state.dropoffDate = obj;
    },

    // reset booking data (optional)
    resetBookingData: (state) => {
      state.pickup_district = "";
      state.pickup_location = "";
      state.dropoff_location = "";
      state.pickupDate = {};
      state.dropoffDate = {};
      state.selectedVehicle = "";
    },
  },
});

export const {
  setSelectedData,
  setPickupDate,
  setDropoffDate,
  resetBookingData,
} = bookingDataSlice.actions;

export default bookingDataSlice.reducer;
