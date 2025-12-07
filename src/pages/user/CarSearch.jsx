// src/pages/user/CarSearch.jsx
// --- UI Restyled + LOGIC CONNECTED TO getVehiclesWithoutBooking ---

import { IconCalendarEvent, IconMapPinFilled } from "@tabler/icons-react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";

import {
  setAvailableCars,
  setLocationsOfDistrict,
  setSelectedDistrict,
} from "../../redux/user/selectRideSlice";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { setSelectedData } from "../../redux/user/BookingDataSlice";
import dayjs from "dayjs";
import useFetchLocationsLov from "../../hooks/useFetchLocationsLov";

// ---------------- Schema ---------------- //
const schema = z.object({
  dropoff_location: z.string().min(1, "Drop-off location is required"),
  pickup_district: z.string().min(1, "Pick-up district is required"),
  pickup_location: z.string().min(1, "Pick-up location is required"),
  pickuptime: z.any(),
  dropofftime: z.any(),
});

const STORAGE_KEY = "lastSearch_v1";

const CarSearch = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_district: "",
      pickup_location: "",
      dropoff_location: "",
      pickuptime: null,
      dropofftime: null,
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { districtData } = useSelector((state) => state.modelDataSlice || {});
  const { selectedDistrict, wholeData, locationsOfDistrict } = useSelector(
    (state) => state.selectRideSlice || {}
  );

  const { fetchLov } = useFetchLocationsLov();

  const uniqueDistrict = [...new Set(districtData || [])];
  const [pickup, setPickup] = useState(null);
  const [error, setError] = useState(null);

  // Load locations LOV on mount
  useEffect(() => {
    fetchLov();
  }, [fetchLov]);

  // Update locations for selected district
  useEffect(() => {
    if (selectedDistrict) {
      const showLocationInDistrict = (wholeData || [])
        .filter((cur) => cur.district === selectedDistrict)
        .map((cur) => cur.location);

      dispatch(setLocationsOfDistrict(showLocationInDistrict));
    } else {
      dispatch(setLocationsOfDistrict([]));
    }
  }, [selectedDistrict, wholeData, dispatch]);

  const oneDayGap = pickup && pickup.add(1, "day");

  // ------------ SUBMIT HANDLER (CORE LOGIC) ------------
  const handleData = async (data) => {
    try {
      setError(null);

      const pickupNative = data?.pickuptime?.$d;
      const dropoffNative = data?.dropofftime?.$d;

      if (!pickupNative) return setError("Invalid pickup date.");
      if (!dropoffNative) return setError("Invalid dropoff date.");
      if (dropoffNative <= pickupNative)
        return setError("Drop-off must be after pickup.");

      const pickupISO = pickupNative.toISOString();
      const dropOffISO = dropoffNative.toISOString();

      // Save booking data in Redux
      const bookingPayload = {
        pickup_district: data.pickup_district,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
        pickupDate: pickupISO,
        dropoffDate: dropOffISO,
      };

      dispatch(setSelectedData(bookingPayload));

      // Persist search for refresh
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pickupISO,
          dropoffISO: dropOffISO,
          pickUpDistrict: data.pickup_district,
          pickUpLocation: data.pickup_location,
        })
      );

      // 🔥 Call backend: POST /api/user/getVehiclesWithoutBooking
      const res = await fetch("/api/user/getVehiclesWithoutBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // MUST MATCH controller: { pickUpDistrict, pickUpLocation, pickupDate, dropOffDate }
          pickUpDistrict: data.pickup_district,
          pickUpLocation: data.pickup_location,
          pickupDate: pickupISO,
          dropOffDate: dropOffISO,
        }),
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text || "null");
      } catch (e) {
        console.error(
          "[CarSearch] JSON parse error for getVehiclesWithoutBooking:",
          e,
          text.slice(0, 200)
        );
        return setError("Server response is invalid.");
      }

      console.log("[CarSearch] /getVehiclesWithoutBooking result:", result);

      // ✅ Handle { availableVehicles: [...] } (your backend shape)
      let vehicles = [];
      if (Array.isArray(result?.availableVehicles)) {
        vehicles = result.availableVehicles;
      } else if (Array.isArray(result)) {
        vehicles = result;
      } else if (Array.isArray(result?.data)) {
        vehicles = result.data;
      } else if (Array.isArray(result?.vehicles)) {
        vehicles = result.vehicles;
      }

      console.log("[CarSearch] resolved vehicles length:", vehicles.length);

      dispatch(setAvailableCars(vehicles));

      // Navigate to available vehicles page
      navigate("/availableVehicles", {
        state: {
          pickupISO,
          dropoffISO: dropOffISO,
          pickUpDistrict: data.pickup_district,
          pickUpLocation: data.pickup_location,
        },
      });

      reset({ pickuptime: null, dropofftime: null });
    } catch (err) {
      console.error(err);
      setError("Something went wrong, try again.");
    }
  };

  // ------------ RENDER ------------
  return (
    <>
      <section className="w-full flex justify-center px-4 md:px-10 mt-10">
        <div
          className="
            w-full max-w-[1100px]
            bg-white
            rounded-2xl
            shadow-md
            border border-[#E5E7EB]
            p-6 md:p-10
          "
        >
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-1">
            Book a Car
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Fill in the details below to find available vehicles.
          </p>

          <form
            onSubmit={handleSubmit(handleData)}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* PICKUP DISTRICT */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#374151] flex items-center gap-1">
                <IconMapPinFilled /> Pick-up District{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="pickup_district"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      dispatch(setSelectedDistrict(e.target.value));
                    }}
                    error={Boolean(errors.pickup_district)}
                  >
                    <MenuItem value="">Select a District</MenuItem>
                    {uniqueDistrict.map((cur, idx) => (
                      <MenuItem value={cur} key={idx}>
                        {cur}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {errors.pickup_district && (
                <p className="text-red-500 text-xs">
                  {errors.pickup_district.message}
                </p>
              )}
            </div>

            {/* PICKUP LOCATION */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#374151] flex items-center gap-1">
                <IconMapPinFilled /> Pick-up Location{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="pickup_location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    error={Boolean(errors.pickup_location)}
                  >
                    <MenuItem value="">Select a Location</MenuItem>
                    {(locationsOfDistrict || []).map((loc, idx) => (
                      <MenuItem key={idx} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {errors.pickup_location && (
                <p className="text-red-500 text-xs">
                  {errors.pickup_location.message}
                </p>
              )}
            </div>

            {/* DROPOFF LOCATION */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#374151] flex items-center gap-1">
                <IconMapPinFilled /> Drop-off Location{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="dropoff_location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    error={Boolean(errors.dropoff_location)}
                  >
                    <MenuItem value="">Select a Location</MenuItem>
                    {(locationsOfDistrict || []).map((loc, idx) => (
                      <MenuItem key={idx} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {errors.dropoff_location && (
                <p className="text-red-500 text-xs">
                  {errors.dropoff_location.message}
                </p>
              )}
            </div>

            {/* PICKUP DATE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#374151] flex items-center">
                <IconCalendarEvent /> Pick-up Date{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="pickuptime"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DateTimePicker"]}>
                      <DateTimePicker
                        label="Pickup"
                        value={field.value}
                        minDate={dayjs()}
                        onChange={(newValue) => {
                          field.onChange(newValue);
                          setPickup(newValue);
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                )}
              />

              {errors.pickuptime && (
                <p className="text-red-500 text-xs">
                  {errors.pickuptime.message}
                </p>
              )}
            </div>

            {/* DROPOFF DATE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#374151] flex items-center">
                <IconCalendarEvent /> Drop-off Date{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="dropofftime"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DateTimePicker"]}>
                      <DateTimePicker
                        label="Dropoff"
                        value={field.value}
                        minDate={pickup ? oneDayGap : dayjs()}
                        onChange={(newValue) => field.onChange(newValue)}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                )}
              />

              {errors.dropofftime && (
                <p className="text-red-500 text-xs">
                  {errors.dropofftime.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs md:col-span-2">{error}</p>
            )}

            {/* BUTTON */}
            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                className="
                  w-full
                  rounded-full
                  bg-[#2563EB]
                  text-white
                  font-semibold
                  py-3
                  hover:bg-[#1D4ED8]
                  transition
                  shadow-sm
                "
              >
                Search Vehicles
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default CarSearch;
