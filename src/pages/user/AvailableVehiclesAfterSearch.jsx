// src/pages/user/AvailableVehiclesAfterSearch.jsx
// UI-only Restyled Version (with safe re-fetch logic + image fix)

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCarSide } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

import CarNotFound from "./CarNotFound";
import { setVariants } from "../../redux/user/listAllVehicleSlice";
import { setFilteredData } from "../../redux/user/sortfilterSlice";
import { setAvailableCars } from "../../redux/user/selectRideSlice";

import noCars from "../../assets/My team1.png";

const STORAGE_KEY = "lastSearch_v1";

// 🔹 Helper: try all reasonable keys + fallback
const extractVehiclesFromResponse = (raw) => {
  if (!raw) return [];

  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.vehicles)) return raw.vehicles;
  if (Array.isArray(raw.availableVehicles)) return raw.availableVehicles;
  if (Array.isArray(raw.variants)) return raw.variants;
  if (Array.isArray(raw.cars)) return raw.cars;

  const firstArray = Object.values(raw).find((v) => Array.isArray(v));
  return firstArray || [];
};

// 🔹 Helper: build correct image URL for vehicles
const buildVehicleImageSrc = (vehicle) => {
  // 1. find "raw" image value
  let raw = null;

  if (Array.isArray(vehicle?.image) && vehicle.image.length > 0) {
    raw = vehicle.image[0];
  } else if (typeof vehicle?.image === "string" && vehicle.image.trim() !== "") {
    raw = vehicle.image.trim();
  } else if (
    typeof vehicle?.imageUrl === "string" &&
    vehicle.imageUrl.trim() !== ""
  ) {
    raw = vehicle.imageUrl.trim();
  } else if (
    typeof vehicle?.photo === "string" &&
    vehicle.photo.trim() !== ""
  ) {
    raw = vehicle.photo.trim();
  }

  // Nothing found → fallback
  if (!raw) return noCars;

  // 2. If already a full URL or a /vehicles path, use as-is
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/vehicles/")
  ) {
    return raw;
  }

  // 3. Otherwise treat it as a filename stored in public/vehicles
  return `/vehicles/${raw}`;
};

const AvailableVehiclesAfterSearch = () => {
  const { availableCars } = useSelector((state) => state.selectRideSlice || {});
  const {
    pickup_district,
    pickup_location,
    pickupDate: reduxPickup,
    dropoffDate: reduxDropoff,
  } = useSelector((state) => state.bookingDataSlice || {});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  const [pickupISO, setPickupISO] = useState(null);
  const [dropoffISO, setDropoffISO] = useState(null);
  const [searchMeta, setSearchMeta] = useState({
    district: null,
    location: null,
  });

  const visibleCars = (Array.isArray(availableCars) ? availableCars : []).filter(
    (cur) => !(cur?.isDeleted === true || cur?.isDeleted === "true")
  );

  useEffect(() => {
    console.debug("[AvailableVehiclesAfterSearch] availableCars:", availableCars);
  }, [availableCars]);

  const safeToISO = (val) => {
    try {
      if (val === null || val === undefined) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
      return null;
    }
  };

  // 🔹 Rebuild pickup/dropoff ISO + district/location from Redux, router state, or sessionStorage
  useEffect(() => {
    const fromReduxPickupISO = safeToISO(reduxPickup);
    const fromReduxDropISO = safeToISO(reduxDropoff);

    const locState = location?.state || {};
    const fromLocPickupISO = safeToISO(
      locState?.pickupISO || locState?.pickupDate
    );
    const fromLocDropISO = safeToISO(
      locState?.dropoffISO || locState?.dropoffDate
    );

    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    } catch {}

    const fromStorePickup = safeToISO(stored?.pickupISO);
    const fromStoreDrop = safeToISO(stored?.dropoffISO);

    const finalPickup =
      fromReduxPickupISO || fromLocPickupISO || fromStorePickup || null;

    const finalDrop =
      fromReduxDropISO || fromLocDropISO || fromStoreDrop || null;

    const finalDistrict =
      pickup_district ||
      locState?.pickUpDistrict ||
      stored?.pickUpDistrict ||
      null;

    const finalLocation =
      pickup_location ||
      locState?.pickUpLocation ||
      stored?.pickUpLocation ||
      null;

    setPickupISO(finalPickup);
    setDropoffISO(finalDrop);
    setSearchMeta({
      district: finalDistrict,
      location: finalLocation,
    });

    if (!finalPickup || !finalDrop || !finalDistrict || !finalLocation) {
      setTimeout(() => navigate("/search", { replace: true }), 100);
    }
  }, [
    reduxPickup,
    reduxDropoff,
    pickup_district,
    pickup_location,
    location?.state,
    navigate,
  ]);

  const persistLastSearch = useCallback(
    (pickup, dropoff, district, locationId) => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            pickupISO: pickup,
            dropoffISO: dropoff,
            pickUpDistrict: district,
            pickUpLocation: locationId,
          })
        );
      } catch {}
    },
    []
  );

  // 🔹 If page is loaded/refreshed and Redux has no cars, fetch them again using last search
  useEffect(() => {
    const shouldFetch =
      (!Array.isArray(availableCars) || availableCars.length === 0) &&
      pickupISO &&
      dropoffISO &&
      searchMeta.district &&
      searchMeta.location;

    if (!shouldFetch) return;

    const fetchAgain = async () => {
      try {
        console.debug("[AvailableVehiclesAfterSearch] refetching cars with:", {
          pickupISO,
          dropoffISO,
          district: searchMeta.district,
          location: searchMeta.location,
        });

        const payload = {
          pickUpDistrict: searchMeta.district,
          pickUpLocation: searchMeta.location,
          pickupDate: pickupISO,
          dropOffDate: dropoffISO,
        };

        const res = await fetch("/api/user/getVehiclesWithoutBooking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error(
            "[AvailableVehiclesAfterSearch] refetch failed status:",
            res.status
          );
          return;
        }

        const raw = await res.json();
        console.debug("[AvailableVehiclesAfterSearch] refetch raw:", raw);

        const data = extractVehiclesFromResponse(raw);

        persistLastSearch(
          pickupISO,
          dropoffISO,
          searchMeta.district,
          searchMeta.location
        );

        dispatch(setAvailableCars(data));
      } catch (err) {
        console.error("[AvailableVehiclesAfterSearch] refetch failed:", err);
      }
    };

    fetchAgain();
  }, [
    availableCars,
    pickupISO,
    dropoffISO,
    searchMeta.district,
    searchMeta.location,
    dispatch,
    persistLastSearch,
  ]);

  // 🔹 Navigate to Checkout page when a car is selected
  const handleGoToCheckout = (vehicle) => {
    const pISO = pickupISO || safeToISO(reduxPickup);
    const dISO = dropoffISO || safeToISO(reduxDropoff);

    const district = searchMeta.district || pickup_district;
    const locationId = searchMeta.location || pickup_location;

    navigate("/checkout", {
      state: {
        vehicleId: vehicle._id,
        vehicle,
        pickupISO: pISO,
        dropoffISO: dISO,
        pickUpDistrict: district,
        pickUpLocation: locationId,
      },
    });
  };

  // 🔹 Keep showVarients (if needed elsewhere), but it's no longer used by the Select button
  const showVarients = async (modelInput) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const modelValue =
        modelInput?.model || modelInput?.name || modelInput || "";

      const pISO = pickupISO || safeToISO(reduxPickup);
      const dISO = safeToISO(reduxDropoff) || dropoffISO;

      if (!pISO || !dISO) {
        dispatch(setVariants([]));
        dispatch(setFilteredData([]));
        setIsLoading(false);
        return;
      }

      const payload = {
        pickUpDistrict: searchMeta.district || pickup_district,
        pickUpLocation: searchMeta.location || pickup_location,
        pickupDate: pISO,
        dropOffDate: dISO,
        model: modelValue,
      };

      const res = await fetch("/api/user/getVehiclesWithoutBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(
          "[AvailableVehiclesAfterSearch] showVarients status:",
          res.status
        );
        dispatch(setVariants([]));
        dispatch(setFilteredData([]));
        return;
      }

      let raw = null;
      try {
        raw = await res.json();
      } catch {
        raw = [];
      }

      console.debug("[AvailableVehiclesAfterSearch] showVarients raw:", raw);

      const data = extractVehiclesFromResponse(raw);

      if (!data.length) {
        dispatch(setVariants([]));
        dispatch(setFilteredData([]));
        setIsLoading(false);
        return;
      }

      dispatch(setVariants(data));
      dispatch(setFilteredData(data));
      navigate("/allVariants", {
        state: { variants: data, pickupISO: pISO, dropoffISO: dISO },
      });
    } catch (err) {
      console.error("[AvailableVehiclesAfterSearch] showVarients error:", err);
      dispatch(setVariants([]));
      dispatch(setFilteredData([]));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-6 lg:px-10 mt-10 bg-[#F5F7FB] pb-10">
      {/* Title */}
      {visibleCars.length > 0 && (
        <div className="text-center max-w-[640px] mx-auto">
          <h2 className="text-[20px] lg:text-[24px] font-semibold text-[#0F172A]">
            Available Vehicles
          </h2>
          <p className="mt-2 text-[12px] lg:text-[13px] text-[#6B7280]">
            Choose from our modern, high-quality vehicles.
          </p>
        </div>
      )}

      {/* Cars Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1100px]">
        {visibleCars.map((cur, idx) => {
          const imgSrc = buildVehicleImageSrc(cur);

          return (
            <div
              key={cur?._id || idx}
              className="
                bg-white
                rounded-2xl
                border border-[#E5E7EB]
                shadow-md
                flex flex-col
                overflow-hidden
                hover:shadow-lg
                hover:-translate-y-1
                transition-all duration-150
              "
            >
              {/* Image */}
              <div className="p-3 bg-[#F9FAFB] flex justify-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-dashed border-[#E5E7EB] bg-white">
                  <img
                    src={imgSrc}
                    alt={cur.model || cur.name || "vehicle"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = noCars;
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-4 flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#0F172A]">
                      {cur.model || cur.name}
                    </h3>
                    <p className="text-[12px] text-[#6B7280]">{cur.company}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[16px] font-bold text-[#0F172A]">
                      ₹{cur.price}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">
                      Per day
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="mt-4 text-[12px] text-[#374151] space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <FaCarSide className="text-[#2563EB]" /> {cur.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MdAirlineSeatReclineNormal className="text-[#2563EB]" />
                      {cur.seats} Seats
                    </span>
                  </div>
                </div>

                <hr className="my-3 border-[#E5E7EB]" />

                <div className="flex justify-end">
                  <button
                    onClick={() => handleGoToCheckout(cur)}
                    className="
                      rounded-full
                      bg-[#2563EB]
                      text-white
                      text-[12px]
                      font-medium
                      px-4 py-2
                      shadow-sm
                      hover:bg-[#1D4ED8]
                      transition-colors
                    "
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCars.length === 0 && (
        <div className="mt-10 w-full max-w-[600px]">
          <CarNotFound />
        </div>
      )}
    </div>
  );
};

export default AvailableVehiclesAfterSearch;
