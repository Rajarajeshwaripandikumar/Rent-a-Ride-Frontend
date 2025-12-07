import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import { FaStar, FaCarAlt, FaBuilding, FaCarSide } from "react-icons/fa";
import { CiCalendarDate } from "react-icons/ci";
import { GiGearStickPattern } from "react-icons/gi";
import { MdAirlineSeatReclineExtra } from "react-icons/md";
import { BsFillFuelPumpFill, BsCurrencyRupee } from "react-icons/bs";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { GrSecure } from "react-icons/gr";
import { toast } from "sonner"; // ✅ NEW

import {
  showVehicles,
  setVehicleDetail,
} from "../../redux/user/listAllVehicleSlice";
import { signOut } from "../../redux/user/userSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const placeholder = "/placeholder-vehicle.png";
const styles = { iconFlex: "flex items-center justify-between" };

// 🔹 Helper to convert whatever is in DB into a usable img src
const resolveImageSrc = (raw) => {
  if (!raw) return placeholder;
  if (typeof raw === "string" && raw.startsWith("http")) return raw;
  // filename from Mongo -> local static file in public/vehicles
  return `/vehicles/${raw}`;
};

const VehicleDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();

  const { singleVehicleDetail, allVariants } = useSelector(
    (state) => state.userListVehicles || {}
  );
  const { availableCars } = useSelector((s) => s.selectRideSlice || {});
  const { selectedData } = useSelector(
    (s) => s.BookingDataSlice || {}
  ); // ✅ booking info from CarSearch

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const didFetchRef = useRef(false);
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  // Helper to read field with fallbacks
  const getField = (...keys) => {
    const v = vehicle || singleVehicleDetail || {};
    for (const k of keys) {
      if (v && v[k] !== undefined && v[k] !== null && v[k] !== "") return v[k];
    }
    return "—";
  };

  const buildHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
  };

  useEffect(() => {
    let canceled = false;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const applyVehicle = (v) => {
      if (!v || canceled) return;
      setVehicle(v);
      const raw = Array.isArray(v.image) ? v.image[0] : v.image;
      setMainImage(resolveImageSrc(raw));
      setLoading(false);
    };

    const setFromLocationOrRedux = () => {
      if (location?.state?.vehicle) {
        applyVehicle(location.state.vehicle);
        return true;
      }

      if (
        singleVehicleDetail &&
        String(singleVehicleDetail._id) === String(routeId)
      ) {
        applyVehicle(singleVehicleDetail);
        return true;
      }

      if (Array.isArray(allVariants) && allVariants.length) {
        const found = allVariants.find(
          (v) => String(v._id) === String(routeId)
        );
        if (found) {
          applyVehicle(found);
          return true;
        }
      }

      if (Array.isArray(availableCars) && availableCars.length) {
        const found = availableCars.find(
          (v) => String(v._id) === String(routeId)
        );
        if (found) {
          applyVehicle(found);
          return true;
        }
      }

      return false;
    };

    const resolvedLocal = setFromLocationOrRedux();
    if (resolvedLocal) return;

    const fetchSingle = async () => {
      if (!routeId) {
        setLoading(false);
        setErrorMsg("No vehicle id provided in route.");
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`${API_URL}/api/vehicles/${routeId}`, {
          method: "GET",
          headers: buildHeaders(),
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          dispatch(signOut());
          if (!canceled) setErrorMsg("Unauthorized");
          setLoading(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          const v = data?._id ? data : data?.vehicle;
          if (v && !canceled) {
            dispatch(setVehicleDetail(v));
            applyVehicle(v);
            return;
          }
        }
      } catch (err) {
        console.error("[VehicleDetails] GET /api/vehicles/:id failed:", err);
      }

      try {
        const res2 = await fetch(`${API_URL}/api/user/showVehicleDetails`, {
          method: "POST",
          headers: buildHeaders(),
          credentials: "include",
          body: JSON.stringify({ id: routeId }),
        });

        if (res2.status === 401 || res2.status === 403) {
          dispatch(signOut());
          if (!canceled) setErrorMsg("Unauthorized");
          setLoading(false);
          return;
        }

        if (res2.ok) {
          const data2 = await res2.json();
          const v2 = data2?._id ? data2 : data2?.vehicle;
          if (v2 && !canceled) {
            dispatch(setVehicleDetail(v2));
            applyVehicle(v2);
            return;
          }
        }
      } catch (err) {
        console.error(
          "[VehicleDetails] POST /api/user/showVehicleDetails failed:",
          err
        );
      }

      try {
        const listRes = await fetch(`${API_URL}/api/user/listAllVehicles`, {
          method: "GET",
          headers: buildHeaders(),
          credentials: "include",
        });

        if (listRes.ok) {
          const listData = await listRes.json();
          const arr = Array.isArray(listData)
            ? listData
            : listData?.data ?? listData?.vehicles ?? [];
          if (arr.length) {
            dispatch(showVehicles(arr));
            const found = arr.find(
              (v) => String(v._id) === String(routeId)
            );
            if (found && !canceled) {
              dispatch(setVehicleDetail(found));
              applyVehicle(found);
              return;
            }
          }
        }
      } catch (err) {
        console.error("[VehicleDetails] list fetch error:", err);
      }

      if (!canceled) {
        setErrorMsg("Vehicle not found in backend.");
        setLoading(false);
      }
    };

    fetchSingle();

    return () => {
      canceled = true;
    };
  }, [
    routeId,
    location,
    singleVehicleDetail,
    allVariants,
    availableCars,
    dispatch,
  ]);

  // If for some reason mainImage wasn't set but vehicle exists, derive it once
  useEffect(() => {
    if (!mainImage && (vehicle || singleVehicleDetail)) {
      const v = vehicle || singleVehicleDetail;
      const raw = Array.isArray(v?.image) ? v.image[0] : v?.image;
      setMainImage(resolveImageSrc(raw));
    }
  }, [vehicle, singleVehicleDetail, mainImage]);

  // ✅ Book button: require booking data (location + time)
  const handleBook = () => {
    const chosen = vehicle || singleVehicleDetail;
    const id = chosen?._id || routeId;

    if (!id) {
      console.warn("[VehicleDetails] No vehicle id available to book", {
        chosen,
        routeId,
      });
      return;
    }

    const booking = selectedData;

    const hasBookingData =
      booking &&
      booking.pickup_district &&
      booking.pickup_location &&
      booking.dropoff_location &&
      booking.pickupDate &&
      booking.dropoffDate;

    if (!hasBookingData) {
      // user never used the Book a Car form
      toast.error("Please choose pick-up & drop-off details first.");
      navigate("/", { state: { scrollToSearch: true } });
      return;
    }

    try {
      dispatch(setVehicleDetail(chosen || {}));
    } catch (e) {
      console.warn("[VehicleDetails] setVehicleDetail failed:", e);
    }

    // 👉 send booking data to checkout
    navigate(`/checkout/${id}`, {
      state: {
        vehicle: chosen,
        bookingData: booking,
      },
    });
  };

  // Derived values
  const registration = getField(
    "registration_number",
    "registeration_number",
    "regNo",
    "regNumber"
  );
  const priceRaw = getField("price");
  const price = priceRaw === "—" ? "—" : priceRaw;

  // raw filenames/urls from DB
  const rawImages =
    Array.isArray(vehicle?.image) && vehicle.image.length
      ? vehicle.image
      : [null];

  // resolved URLs to actually render
  const images = rawImages.map((r) => resolveImageSrc(r));

  // ================== LOADING STATE ==================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-8 py-6 text-sm text-gray-600">
          Loading vehicle details…
        </div>
      </div>
    );
  }

  // ================== ERROR STATE ==================
  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-8 py-6 text-center max-w-md">
          <p className="text-lg font-semibold text-gray-900 mb-1">
            Vehicle error
          </p>
          <p className="text-sm text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => navigate("/vehicles")}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  // ================== NOT FOUND STATE ==================
  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-8 py-6 text-center max-w-md">
          <p className="text-lg font-semibold text-gray-900 mb-1">
            Vehicle not found
          </p>
          <p className="text-sm text-gray-600 mb-4">
            The vehicle you’re looking for couldn’t be loaded.
          </p>
          <button
            onClick={() => navigate("/vehicles")}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  // ================== MAIN UI ==================
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <main className="flex-grow w-full px-4 sm:px-10 lg:px-20 py-10">
        <section className="max-w-[1200px] mx-auto">
          {/* GRID: LEFT IMAGES - RIGHT DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT: IMAGES */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative">
                {/* Back button */}
                <div className="absolute top-4 left-4 z-20">
                  <TooltipComponent content={"back"} position="BottomCenter">
                    <button
                      onClick={() => navigate(-1)}
                      className="text-3xl text-gray-600 hover:text-blue-600 transition rounded-full"
                      aria-label="Go back"
                    >
                      <IoArrowBackCircleSharp />
                    </button>
                  </TooltipComponent>
                </div>

                {/* Main image */}
                <div className="w-full flex justify-center items-center bg-white p-6 border-b border-gray-100">
                  <img
                    src={mainImage || placeholder}
                    alt={getField("model", "name")}
                    className="max-h-[400px] w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholder;
                    }}
                  />
                </div>

                {/* Thumbnails */}
                <div className="p-4 flex gap-3 overflow-x-auto bg-[#F9FAFB]">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 transition"
                      onClick={() => setMainImage(src)}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <img
                        src={src}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholder;
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-md border border-gray-200 bg-white p-6">
                {/* Title */}
                <h1 className="text-3xl font-semibold text-gray-900 capitalize">
                  {getField("name", "model")}
                </h1>

                {/* Specs */}
                <div className="mt-6 space-y-3">
                  {[
                    {
                      icon: <FaCarAlt />,
                      label: "Model",
                      value: getField("model", "name"),
                    },
                    {
                      icon: <FaBuilding />,
                      label: "Company",
                      value: getField("company", "manufacturer"),
                    },
                    {
                      icon: <CiCalendarDate />,
                      label: "Year",
                      value: getField("year_made", "year", "manufacture_year"),
                    },
                    {
                      icon: <GiGearStickPattern />,
                      label: "Transmission",
                      value: getField("transmission", "transmition"),
                    },
                    {
                      icon: <FaCarSide />,
                      label: "Type",
                      value: getField("car_type", "type"),
                    },
                    {
                      icon: <MdAirlineSeatReclineExtra />,
                      label: "Seats",
                      value: getField("seats"),
                    },
                    {
                      icon: <BsFillFuelPumpFill />,
                      label: "Fuel",
                      value: getField("fuel_type", "fuel"),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 border border-gray-200"
                    >
                      <span className="flex items-center gap-3 text-gray-700">
                        <span className="text-blue-600">{item.icon}</span>
                        {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}

                  {/* Rating */}
                  <div className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 border border-gray-200">
                    <span className="flex items-center gap-3 text-gray-700">
                      <FaStar className="text-yellow-500" />
                      Rating
                    </span>
                    <span className="font-medium">
                      {getField("rating", "ratting")}/5
                    </span>
                  </div>

                  {/* Reg Number */}
                  <div className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 border border-gray-200">
                    <span className="text-gray-700">Reg. Number</span>
                    <span className="font-medium">{registration}</span>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-end gap-1">
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center">
                      <BsCurrencyRupee className="mr-1" />
                      {price}
                    </p>
                    <span className="text-gray-500 text-sm">/day</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBook}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    <GrSecure className="mr-2" />
                    Book Ride
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="bg-white border border-gray-200 shadow-md rounded-2xl mt-10 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Vehicle Description
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {getField("car_description", "description") ||
                "No description available."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VehicleDetails;
