// src/pages/CheckoutPage.jsx
import { useDispatch, useSelector } from "react-redux";
import { MdCurrencyRupee } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { MdVerifiedUser } from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { displayRazorpay } from "./Razorpay";
import { setPageLoading } from "../../redux/user/userSlice";
import {
  setisPaymentDone,
  setLatestBooking,
} from "../../redux/user/LatestBookingsSlice";

import { toast, Toaster } from "sonner";

import { setVehicleDetail } from "../../redux/user/listAllVehicleSlice";

// 🔹 placeholder + helper for image src
const placeholder = "/placeholder-vehicle.png";

const resolveImageSrc = (raw) => {
  if (!raw) return placeholder;
  if (typeof raw === "string" && raw.startsWith("http")) return raw;
  // filename stored in Mongo -> local file in public/vehicles
  return `/vehicles/${raw}`;
};

// === Zod schema ===
const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
  phoneNumber: z
    .string()
    .min(8, { message: "phoneNumber required (min 8 digits)" })
    .refine((v) => /^\d+$/.test(v), { message: "Phone must be numeric" }),
  adress: z.string().min(4, { message: "address required" }),
  coupon: z.string().optional(),
});

export async function sendBookingDetailsEmail(
  toEmail,
  bookingDetails,
  dispatch
) {
  try {
    const res = await fetch("/api/user/sendBookingDetailsEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail, data: bookingDetails }),
    });

    if (!res.ok) {
      dispatch(setisPaymentDone(false));
      console.log("Something went wrong while sending email (fetch failed).");
      return { ok: false, message: "Failed to send email" };
    }

    const payload = await res.json().catch(() => ({}));
    return { ok: true, payload };
  } catch (error) {
    console.error("sendBookingDetailsEmail error:", error);
    dispatch(setisPaymentDone(false));
    return { ok: false, message: error?.message || "Network error" };
  }
}

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL || ""
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

function normalizeSingleVehicleResponse(raw) {
  if (!raw) return null;
  if (raw.data && Array.isArray(raw.data) && raw.data.length > 0)
    return raw.data[0];
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data))
    return raw.data;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  if (raw._id || raw.id) return raw;
  return null;
}

// helper: safely convert any of our stored shapes into a Date
const parseDateValue = (value) => {
  if (!value) return null;

  // ISO string or plain string
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  // { humanReadable: "2025-12-01T10:00:00Z", ... }
  if (value.humanReadable) {
    const d = new Date(value.humanReadable);
    return isNaN(d.getTime()) ? null : d;
  }

  // { year, month, day, hour, minute } shape
  if (
    typeof value === "object" &&
    (value.year || value.month || value.day || value.hour || value.minute)
  ) {
    const now = new Date();
    const year = value.year ?? now.getFullYear();
    const month = (value.month ?? now.getMonth() + 1) - 1; // JS month is 0-based
    const day = value.day ?? now.getDate();
    const hour = value.hour ?? 0;
    const minute = value.minute ?? 0;
    const d = new Date(year, month, day, hour, minute);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const CheckoutPage = () => {
  const {
    handleSubmit,
    formState: { errors },
    register,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { coupon: "", email: "", phoneNumber: "", adress: "" },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const locState = location.state || {};

  // 🔹 vehicle & ids coming from /checkout navigation
  const vehicleFromState = locState.vehicle || null;
  const vehicleIdFromState = locState.vehicleId || null;

  // ✅ booking data source (state from navigate + both slice variants)
  const bookingFromState = locState.bookingData || null;
  const bookingFromUpperSlice =
    useSelector((state) => state.BookingDataSlice?.selectedData) || null;
  const bookingFromLowerSlice =
    useSelector((state) => state.bookingDataSlice) || null;

  const booking =
    bookingFromUpperSlice ||
    bookingFromLowerSlice ||
    bookingFromState ||
    null;

  // derived booking fields
  const pickup_district = booking?.pickup_district;
  const pickup_location = booking?.pickup_location;
  const dropoff_location = booking?.dropoff_location;

  const pickupDateObj = parseDateValue(booking?.pickupDate);
  const dropoffDateObj = parseDateValue(booking?.dropoffDate);

  // protect this page: if no booking info, push back home
  useEffect(() => {
    if (
      !booking ||
      !pickup_district ||
      !pickup_location ||
      !dropoff_location ||
      !pickupDateObj ||
      !dropoffDateObj
    ) {
      toast.error("Please choose pick-up & drop-off details first.");
      navigate("/", { state: { scrollToSearch: true } });
    }
  }, [
    booking,
    pickup_district,
    pickup_location,
    dropoff_location,
    pickupDateObj,
    dropoffDateObj,
    navigate,
  ]);

  const { data, paymentDone } =
    useSelector((state) => state.latestBookings || {}) || {};
  const currentUser = useSelector((state) => state.user.currentUser) || {};
  const singleVehicleDetailFromRedux =
    useSelector((state) => state.userListVehicles.singleVehicleDetail) || null;

  const { isPageLoading } = useSelector((state) => state.user || {});

  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // 🔹 when we already have vehicle in location.state, store it in Redux
  useEffect(() => {
    if (vehicleFromState && vehicleFromState._id) {
      try {
        dispatch(setVehicleDetail(vehicleFromState));
      } catch (e) {
        console.warn("[CheckoutPage] setVehicleDetail from state failed:", e);
      }
    }
  }, [vehicleFromState, dispatch]);

  useEffect(() => {
    if (currentUser?.email) setValue("email", currentUser.email);
    if (currentUser?.phoneNumber)
      setValue("phoneNumber", currentUser.phoneNumber);
    if (currentUser?.adress) setValue("adress", currentUser.adress);
  }, [currentUser, setValue]);

  // 🔹 prefer vehicle from state, then Redux, then fallback default
  const singleVehicleDetail = vehicleFromState || singleVehicleDetailFromRedux || {
    price: 0,
    image: [""],
    model: "",
    base_package: "",
    fuel_type: "",
    transmition: "",
    registeration_number: "",
    _id: null,
  };

  const price = Number(singleVehicleDetail?.price ?? 0) || 0;
  const user_id = currentUser?._id;
  const vehicle_id =
    singleVehicleDetail?._id || vehicleIdFromState || params?.id || null;

  // --- fetch vehicle by id if necessary (for deep links / refresh) ---
  useEffect(() => {
    const routeId = params?.id || vehicleIdFromState;

    // if no id OR we already have vehicle in state, skip fetch
    if (!routeId || vehicleFromState) return;

    if (
      singleVehicleDetailFromRedux &&
      String(singleVehicleDetailFromRedux._id) === String(routeId)
    ) {
      setFetchError(null);
      setFetchingVehicle(false);
      return;
    }

    let mounted = true;
    (async () => {
      setFetchingVehicle(true);
      setFetchError(null);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = { "Content-Type": "application/json" };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_BASE_URL}/api/user/showVehicleDetails`, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({ id: routeId }),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.warn(
            "[CheckoutPage] showVehicleDetails failed:",
            res.status,
            txt
          );
          if (!mounted) return;
          setFetchError("Vehicle could not be loaded from server.");
          setFetchingVehicle(false);
          return;
        }

        const raw = await res.json().catch(() => null);
        const v = normalizeSingleVehicleResponse(raw);
        if (!v) {
          if (!mounted) return;
          setFetchError("Vehicle not found.");
          setFetchingVehicle(false);
          return;
        }

        try {
          dispatch(setVehicleDetail(v));
        } catch (e) {
          console.warn("[CheckoutPage] dispatch setVehicleDetail failed:", e);
        }

        if (!mounted) return;
        setFetchingVehicle(false);
        setFetchError(null);
      } catch (err) {
        console.error("[CheckoutPage] fetch error:", err);
        if (!mounted) return;
        setFetchError("Network error while loading vehicle.");
        setFetchingVehicle(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    params?.id,
    vehicleIdFromState,
    vehicleFromState,
    singleVehicleDetailFromRedux,
    dispatch,
  ]);

  // --- fetch first available vehicle if none, no id, and no vehicle in state ---
  useEffect(() => {
    const routeId = params?.id || vehicleIdFromState;

    if (routeId) return;
    if (vehicleFromState) return;
    if (singleVehicleDetailFromRedux && singleVehicleDetailFromRedux._id)
      return;

    if (!pickup_district || !pickup_location || !pickupDateObj || !dropoffDateObj) {
      return;
    }

    let mounted = true;
    (async () => {
      setFetchingVehicle(true);
      setFetchError(null);

      try {
        const body = {
          pickupDate: pickupDateObj.toISOString(),
          dropOffDate: dropoffDateObj.toISOString(),
          pickUpDistrict: pickup_district,
          pickUpLocation: pickup_location,
        };

        const res = await fetch(
          `${API_BASE_URL}/api/user/getVehiclesWithoutBooking`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.warn(
            "[CheckoutPage] getVehiclesWithoutBooking failed:",
            res.status,
            txt
          );
          if (!mounted) return;
          setFetchError("Failed to fetch available vehicles.");
          setFetchingVehicle(false);
          return;
        }

        const json = await res.json().catch(() => null);
        if (
          !json ||
          !json.success ||
          !Array.isArray(json.data) ||
          json.data.length === 0
        ) {
          if (!mounted) return;
          setFetchError("No vehicles available for selected date/location.");
          setFetchingVehicle(false);
          return;
        }

        const first = json.data[0];
        try {
          dispatch(setVehicleDetail(first));
        } catch (e) {
          console.warn(
            "[CheckoutPage] dispatch setVehicleDetail failed for availability:",
            e
          );
        }

        if (!mounted) return;
        setFetchingVehicle(false);
        setFetchError(null);
      } catch (err) {
        console.error(
          "[CheckoutPage] error fetching available vehicle:",
          err
        );
        if (!mounted) return;
        setFetchError("Network error while loading available vehicles.");
        setFetchingVehicle(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    pickup_district,
    pickup_location,
    pickupDateObj,
    dropoffDateObj,
    singleVehicleDetailFromRedux,
    vehicleFromState,
    vehicleIdFromState,
    params?.id,
    dispatch,
  ]);

  // Days calculation
  const start = pickupDateObj || new Date();
  const end =
    dropoffDateObj || new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const diffMilliseconds = Math.max(0, end - start);
  const Days = Math.max(1, Math.ceil(diffMilliseconds / (1000 * 3600 * 24)));

  // derived date/time parts for display
  const pickupDay = pickupDateObj ? pickupDateObj.getDate() : "--";
  const pickupMonth = pickupDateObj ? pickupDateObj.getMonth() + 1 : "--";
  const pickupYear = pickupDateObj ? pickupDateObj.getFullYear() : "--";
  const pickupHour = pickupDateObj ? pickupDateObj.getHours() : "--";
  const pickupMinute = pickupDateObj ? pickupDateObj.getMinutes() : "--";

  const dropoffDay = dropoffDateObj ? dropoffDateObj.getDate() : "--";
  const dropoffMonth = dropoffDateObj ? dropoffDateObj.getMonth() + 1 : "--";
  const dropoffYear = dropoffDateObj ? dropoffDateObj.getFullYear() : "--";
  const dropoffHour = dropoffDateObj ? dropoffDateObj.getHours() : "--";
  const dropoffMinute = dropoffDateObj ? dropoffDateObj.getMinutes() : "--";

  const [wrongCoupon, setWrongCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const couponValue = watch("coupon");

  const handleCoupon = (e) => {
    e?.preventDefault?.();
    setWrongCoupon(false);
    const code = (couponValue || "").trim().toUpperCase();
    if (code === "WELCOME50") {
      setDiscount(50);
      toast.success("Coupon applied: ₹50 off");
    } else {
      setDiscount(0);
      setWrongCoupon(true);
      toast.error("Invalid coupon");
    }
  };

  const shipping = 500;
  const totalPrice = Math.max(
    0,
    Math.round((price * Days + shipping - discount) * 100) / 100
  );

  const handlePlaceOrder = async (formData) => {
    if (!user_id || !vehicle_id) {
      toast.error("Missing user or vehicle information.");
      return;
    }

    const orderData = {
      user_id,
      vehicle_id,
      totalPrice,
      pickupDate: pickupDateObj
        ? pickupDateObj.toISOString()
        : new Date().toISOString(),
      dropoffDate: dropoffDateObj
        ? dropoffDateObj.toISOString()
        : new Date().toISOString(),
      pickup_district,
      pickup_location,
      dropoff_location,
      name: currentUser?.name || "",
      email: formData?.email || currentUser?.email || "",
      phoneNumber: formData?.phoneNumber || currentUser?.phoneNumber || "",
      adress: formData?.adress || currentUser?.adress || "",
    };

    try {
      dispatch(setPageLoading(true));
      const displayRazorpayResponse = await displayRazorpay(
        orderData,
        navigate,
        dispatch
      );

      if (!displayRazorpayResponse || !displayRazorpayResponse.ok) {
        toast.error(
          displayRazorpayResponse?.message || "Payment initialization failed"
        );
        return;
      }

      if (displayRazorpayResponse.booking) {
        try {
          dispatch(setLatestBooking(displayRazorpayResponse.booking));
        } catch (e) {
          console.warn("Failed to dispatch setLatestBooking", e);
        }
      }
    } catch (err) {
      console.error("handlePlaceOrder error:", err);
      toast.error("Something went wrong while initiating payment");
    } finally {
      dispatch(setPageLoading(false));
    }
  };

  useEffect(() => {
    if (!paymentDone) return;

    const sendEmail = async () => {
      let bookingPayload = data;
      if (!bookingPayload) {
        try {
          const raw = localStorage.getItem("latestBooking");
          if (raw) bookingPayload = JSON.parse(raw);
        } catch (e) {
          console.warn("Failed to read latestBooking from localStorage", e);
        }
      }

      if (!bookingPayload) {
        console.warn("Payment done but no booking data available to email");
        dispatch(setisPaymentDone(false));
        toast.error(
          "Payment completed but booking details missing. Contact support."
        );
        return;
      }

      const resp = await sendBookingDetailsEmail(
        currentUser?.email,
        bookingPayload,
        dispatch
      );
      if (resp?.ok) {
        toast.success("Booking details emailed to you");
        try {
          localStorage.removeItem("latestBooking");
        } catch (e) {}
      } else {
        toast.error("Failed to send booking email");
      }
      dispatch(setisPaymentDone(false));
    };

    sendEmail();
  }, [paymentDone, data, currentUser?.email, dispatch]);

  // if we already decided there is no valid booking, the redirect effect above will fire
  if (
    !booking ||
    !pickup_district ||
    !pickup_location ||
    !dropoff_location ||
    !pickupDateObj ||
    !dropoffDateObj
  ) {
    return (
      <>
        <Toaster />
        {/* nothing, user is being redirected back to home */}
      </>
    );
  }

  if (fetchingVehicle) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] px-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md px-6 py-8 text-center">
            <p className="text-sm text-[#6B7280]">Loading vehicle details…</p>
          </div>
        </div>
      </>
    );
  }

  if (
    fetchError &&
    (!singleVehicleDetailFromRedux || !singleVehicleDetailFromRedux._id) &&
    !vehicleFromState
  ) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] px-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md px-6 py-8 text-center max-w-md w-full">
            <p className="text-lg font-semibold text-[#0F172A] mb-2">
              Vehicle could not be loaded
            </p>
            <p className="text-sm text-[#6B7280] mb-4">{fetchError}</p>
            <button
              onClick={() => navigate("/availableVehicles")}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Back to search
            </button>
          </div>
        </div>
      </>
    );
  }

  // 🔹 use resolver so filenames -> /vehicles/<file>
  const rawImage =
    Array.isArray(singleVehicleDetail.image) &&
    singleVehicleDetail.image.length
      ? singleVehicleDetail.image[0]
      : singleVehicleDetail.image;
  const firstImage = resolveImageSrc(rawImage);

  return (
    <>
      <Toaster />
      <div className="min-h-screen w-full bg-[#F5F7FB] flex justify-center px-4 sm:px-6 lg:px-12 xl:px-20 py-10">
        <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-2">
          {/* LEFT: Order Summary */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
            <div>
              <p className="text-xl font-semibold text-[#0F172A]">
                Order Summary
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                Check your items and rental details.
              </p>
            </div>

            {/* Vehicle card */}
            <div className="flex flex-col sm:flex-row rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:p-4 gap-4">
              <img
                className="h-40 w-full sm:w-48 rounded-xl bg-white border border-[#E5E7EB] object-contain"
                src={firstImage}
                alt={singleVehicleDetail.model || "vehicle"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholder;
                }}
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <span className="font-semibold capitalize text-[#0F172A]">
                    {singleVehicleDetail.model || "Vehicle"}
                  </span>
                  <div className="mt-1 space-y-1 text-xs text-[#6B7280]">
                    <p>
                      Package:{" "}
                      {singleVehicleDetail.base_package || "Standard"}
                    </p>
                    <p>Fuel: {singleVehicleDetail.fuel_type}</p>
                    <p>
                      Transmission:{" "}
                      {singleVehicleDetail.transmition ||
                        singleVehicleDetail.transmission ||
                        "—"}
                    </p>
                    <p>Reg. No: {singleVehicleDetail.registeration_number}</p>
                  </div>
                </div>

                <p className="mt-3 text-lg font-bold flex items-center text-[#0F172A]">
                  <MdCurrencyRupee />
                  {price ?? 0}
                  <span className="text-[10px] ml-1 text-[#6B7280]">
                    / per day
                  </span>
                </p>
              </div>
            </div>

            {/* Pickup / Dropoff info */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Pickup */}
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#0F172A] underline underline-offset-4 mb-3">
                    Pick up
                  </div>
                  <p className="text-[13px] text-[#111827] capitalize">
                    {pickup_district || "Pickup District Not selected"}
                  </p>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    {pickup_location || "Pickup Location Not selected"}
                  </p>

                  <div className="mt-3 text-[13px] text-[#111827] space-y-2">
                    <div className="flex items-center gap-2">
                      <CiCalendarDate className="text-[#4B5563]" size={16} />
                      {pickupDateObj ? (
                        <>
                          <span>{pickupDay}/</span>
                          <span>{pickupMonth}/</span>
                          <span>{pickupYear}</span>
                        </>
                      ) : (
                        <span>No date</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <IoMdTime className="text-[#4B5563]" size={16} />
                      <span>{pickupHour}</span>:<span>{pickupMinute}</span>
                    </div>
                  </div>
                </div>

                {/* Dropoff */}
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#0F172A] underline underline-offset-4 mb-3">
                    Drop off
                  </div>
                  <p className="text-[13px] text-[#111827] capitalize">
                    {pickup_district || "Pickup District Not selected"}
                  </p>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    {dropoff_location || "Dropoff Location not selected"}
                  </p>

                  <div className="mt-3 text-[13px] text-[#111827] space-y-2">
                    <div className="flex items-center gap-2">
                      <CiCalendarDate className="text-[#4B5563]" size={16} />
                      {dropoffDateObj ? (
                        <>
                          <span>{dropoffDay}/</span>
                          <span>{dropoffMonth}/</span>
                          <span>{dropoffYear}</span>
                        </>
                      ) : (
                        <span>No date</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <IoMdTime className="text-[#4B5563]" size={16} />
                      <span>{dropoffHour}</span>:<span>{dropoffMinute}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy box */}
              <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 flex gap-3 items-start">
                <div>
                  <MdVerifiedUser
                    style={{ fontSize: 40 }}
                    className="text-[#22C55E]"
                  />
                </div>
                <div className="text-[12px] text-[#4B5563] text-left space-y-1">
                  <p>Down time charges as per policy.</p>
                  <p>
                    Policy excess charges waiver for denting and painting,
                    excluding major accident repairs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Details */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-xl font-semibold text-[#0F172A]">
              Payment Details
            </p>
            <p className="text-sm text-[#6B7280] mt-1">
              Complete your order by providing your details.
            </p>

            <form onSubmit={handleSubmit(handlePlaceOrder)} className="mt-6">
              <div className="flex flex-col gap-y-5">
                <div>
                  <TextField
                    id="email"
                    label="Email"
                    variant="outlined"
                    className="w-full"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <TextField
                    id="phoneNumber"
                    label="Phone"
                    type="tel"
                    variant="outlined"
                    className="w-full"
                    {...register("phoneNumber")}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <TextField
                    id="address"
                    label="Address"
                    multiline
                    rows={4}
                    {...register("adress")}
                    className="w-full"
                  />
                  {errors.adress && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.adress.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex gap-3">
                    <TextField
                      id="coupon"
                      label="Coupon"
                      placeholder="WELCOME50 is a valid coupon"
                      className="w-full"
                      {...register("coupon")}
                    />
                    <button
                      onClick={handleCoupon}
                      className="rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {wrongCoupon && (
                    <p className="text-red-500 text-[10px] mt-1">
                      Not a valid coupon
                    </p>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="mt-6 border-y border-[#E5E7EB] py-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-[#374151]">Rent</p>
                  <p className="font-semibold text-[#111827]">
                    ₹{price ?? 0}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-[#374151]">Days</p>
                  <p className="font-semibold text-[#111827]">{Days}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-[#374151]">Service Charge</p>
                  <p className="font-semibold text-[#111827]">
                    ₹{shipping.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-[#374151]">Coupon</p>
                  <p className="font-semibold text-[#111827]">
                    -₹{discount}.00
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-medium text-[#374151]">Total</p>
                <p className="text-2xl font-semibold text-[#0F172A] flex items-center gap-1">
                  <MdCurrencyRupee />
                  {totalPrice}
                </p>
              </div>

              {isPageLoading ? (
                <button
                  className="mt-5 mb-2 w-full rounded-full bg-[#E5E7EB] px-6 py-3 text-sm font-medium text-[#6B7280] cursor-not-allowed"
                  disabled
                >
                  Processing ...
                </button>
              ) : (
                <button
                  type="submit"
                  className="mt-5 mb-2 w-full rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
                >
                  Place Order
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
