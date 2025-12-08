// src/pages/user/Orders.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MdCurrencyRupee } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { CiCalendarDate, CiLocationOn } from "react-icons/ci";
import { toast } from "sonner";
import UserOrderDetailsModal from "../../components/UserOrderDetailsModal";
import {
  setIsOrderModalOpen,
  setSingleOrderDetails,
} from "../../redux/user/userSlice";
import Footers from "../../components/Footer";

/* -----------------------------------------
   Helper: resolve vehicle image filenames to public path
------------------------------------------*/
function resolveVehicleImage(src) {
  const FALLBACK = "/vehicles/home.webp";
  if (!src) return FALLBACK;

  let value = src;

  if (typeof value === "object") {
    const maybe =
      value.url ||
      value.path ||
      value.filename ||
      value.fileName ||
      value.name ||
      (Array.isArray(value) ? value[0] : null);
    value = maybe || "";
  }

  if (typeof value !== "string") return FALLBACK;

  const trimmed = value.trim();
  if (!trimmed) return FALLBACK;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/vehicles/")) {
    return trimmed;
  }

  let fileName = trimmed.split(/[/\\]/).pop() || trimmed;
  fileName = fileName.replace(/^\/?vehicles\//, "");

  if (!fileName.includes(".")) {
    fileName = `${fileName}.jpg`;
  }

  return `/vehicles/${fileName}`;
}

/* -----------------------------------------
   ImageWithFallback
------------------------------------------*/
function ImageWithFallback({
  src,
  alt = "",
  className = "",
  size = 200,
  fallback = "/vehicles/home.webp",
}) {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const newSrc = src || fallback;
    if (newSrc !== currentSrc) {
      setErrored(false);
      setLoaded(false);
      setCurrentSrc(newSrc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fallback]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        width: "100%",
        maxWidth: size,
        aspectRatio: "4 / 3",
      }}
    >
      {!errored && currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (currentSrc !== fallback) setCurrentSrc(fallback);
            else setErrored(true);
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 220ms ease-in-out",
          }}
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] border border-[#E5E7EB]">
          <svg viewBox="0 0 24 24" className="w-12 h-12 opacity-50" fill="none">
            <path
              d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3 17l4-4 4 4 4-5 6 6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------
   normalizeBooking (non-mutating)
------------------------------------------*/
const normalizeBooking = (raw) => {
  if (!raw || typeof raw !== "object") {
    return { bookingDetails: {}, vehicleDetails: {}, status: null, id: null };
  }

  const bookingCandidate =
    raw.bookingDetails ??
    raw.booking_details ??
    raw.booking ??
    raw.bookingInfo ??
    raw.data ??
    raw;

  const bookingObj =
    bookingCandidate && typeof bookingCandidate === "object"
      ? { ...bookingCandidate }
      : {};

  const vehicleCandidate =
    raw.vehicleDetails ??
    raw.vehicle_details ??
    raw.vehicle ??
    bookingObj.vehicle ??
    bookingObj.vehicleDetails ??
    raw.car ??
    {};

  const vehicleObj =
    vehicleCandidate && typeof vehicleCandidate === "object"
      ? { ...vehicleCandidate }
      : {};

  const status = raw.status ?? bookingObj.status ?? null;
  const id =
    bookingObj._id ??
    bookingObj.id ??
    raw._id ??
    raw.id ??
    raw.bookingId ??
    bookingObj.booking_id ??
    null;

  const rawPrice =
    bookingObj.totalPrice ??
    bookingObj.total_price ??
    bookingObj.price ??
    bookingObj.total ??
    raw.totalPrice ??
    raw.total_price ??
    raw.price ??
    null;

  const totalPrice =
    rawPrice == null
      ? null
      : Number(String(rawPrice).replace(/[^\d.-]/g, "")) || null;

  const bookingDetails = { ...bookingObj, totalPrice };
  const vehicleDetails = { ...vehicleObj };

  return { bookingDetails, vehicleDetails, status, id };
};

/* -----------------------------------------
   Orders component
------------------------------------------*/
export default function Orders() {
  const currentUser = useSelector((state) => state.user.currentUser || {});
  const _id = currentUser?._id;
  const isOrderModalOpen = useSelector((s) => s.user.isOrderModalOpen);
  const dispatch = useDispatch();

  const [bookings, setBookings] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  console.log("[Orders] currentUser:", currentUser, "id:", _id);

  /* -----------------------------------------
     Fetch bookings
  ------------------------------------------*/
  const fetchBookings = async () => {
    if (!_id) {
      console.warn("[Orders] No user _id found, not fetching bookings");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch("/api/user/findBookingsOfUser", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ userId: _id }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("[Orders] fetchBookings failed:", res.status, txt);
        setErrorMsg("Failed to fetch bookings.");
        setBookings([]);
        return;
      }

      const raw = await res.json().catch(() => null);
      console.log("[Orders] raw response from API:", raw);

      let list = [];

      if (!raw) {
        list = [];
      } else if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray(raw.data)) {
        list = raw.data;
      } else if (Array.isArray(raw.bookings)) {
        list = raw.bookings;
      } else if (Array.isArray(raw.booking)) {
        list = raw.booking;
      } else if (
        raw.data &&
        (Array.isArray(raw.data.bookings) || Array.isArray(raw.data.booking))
      ) {
        list = Array.isArray(raw.data.bookings)
          ? raw.data.bookings
          : raw.data.booking;
      } else if (raw._id || raw.id || raw.bookingId) {
        list = [raw];
      } else {
        const firstArrayProp = Object.values(raw).find((v) => Array.isArray(v));
        if (firstArrayProp) {
          list = firstArrayProp;
        } else {
          const possible = Object.values(raw).filter(
            (v) =>
              v &&
              typeof v === "object" &&
              (v._id || v.bookingDetails || v.pickupDate || v.vehicleDetails)
          );
          list = possible.length ? possible : [];
        }
      }

      console.log("[Orders] parsed bookings list:", list);
      setBookings(list);
      setErrorMsg(null);
    } catch (error) {
      console.error("[Orders] fetch error:", error);
      setErrorMsg("Error fetching bookings.");
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  const handleDetailsModal = (rawBooking) => {
    if (!rawBooking) {
      console.warn("[Orders] handleDetailsModal called with empty booking");
      return;
    }

    const { bookingDetails, vehicleDetails, status, id } =
      normalizeBooking(rawBooking);

    const combined = {
      original: rawBooking,
      _id:
        bookingDetails._id ||
        id ||
        rawBooking._id ||
        rawBooking.id ||
        null,
      bookingDetails: bookingDetails || {},
      vehicleDetails: vehicleDetails || {},
      status: status || rawBooking.status || null,
    };

    dispatch(setSingleOrderDetails(combined));
    setTimeout(() => dispatch(setIsOrderModalOpen(true)), 0);
  };

  /* -----------------------------------------
     Download invoice for given booking
  ------------------------------------------*/
  const handleDownloadInvoice = async (bookingDetails, id, cur) => {
    try {
      const bookingId =
        bookingDetails?._id || id || cur?._id || cur?.id || null;

      if (!bookingId) {
        toast.error("Booking ID not found.");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const headers = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      // use relative /api path so Netlify proxy / Render works
      const res = await fetch(`/api/user/invoice/${bookingId}`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Failed to download invoice.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("handleDownloadInvoice error:", err);
      toast.error("Error downloading invoice.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date) => {
    if (!date) return "--:--";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "--:--";
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <main className="flex-grow w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        {isOrderModalOpen && <UserOrderDetailsModal />}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Your Bookings
            </h1>
            <div className="text-sm text-[#6B7280] mt-1">
              {bookings.length === 0 ? (
                <div className="mt-6">
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md px-6 py-10 text-center">
                    <p className="font-semibold text-[#0F172A] mb-1">
                      {errorMsg
                        ? "Unable to load bookings"
                        : "No bookings yet"}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {errorMsg
                        ? errorMsg
                        : "Once you book a vehicle, your trips will appear here."}
                    </p>
                  </div>
                </div>
              ) : (
                "Review your previous and upcoming bookings."
              )}
            </div>
          </div>

          {/* Bookings list */}
          {bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((cur, idx) => {
                const { bookingDetails, vehicleDetails, status, id } =
                  normalizeBooking(cur);

                const pickupDateRaw =
                  bookingDetails.pickupDate ??
                  bookingDetails.pickUpDate ??
                  bookingDetails.pickup_date ??
                  bookingDetails.startDate ??
                  bookingDetails.from ??
                  bookingDetails.fromDate ??
                  bookingDetails.start_date ??
                  bookingDetails.pick_up_date ??
                  null;

                const dropoffDateRaw =
                  bookingDetails.dropOffDate ??
                  bookingDetails.dropoffDate ??
                  bookingDetails.drop_off_date ??
                  bookingDetails.endDate ??
                  bookingDetails.to ??
                  bookingDetails.toDate ??
                  bookingDetails.end_date ??
                  bookingDetails.return_date ??
                  null;

                const pickupDate = pickupDateRaw
                  ? new Date(pickupDateRaw)
                  : null;
                const dropoffDate = dropoffDateRaw
                  ? new Date(dropoffDateRaw)
                  : null;

                let imageUrl = null;
                if (vehicleDetails) {
                  if (
                    Array.isArray(vehicleDetails.image) &&
                    vehicleDetails.image.length
                  ) {
                    imageUrl = resolveVehicleImage(vehicleDetails.image[0]);
                  } else if (
                    Array.isArray(vehicleDetails.images) &&
                    vehicleDetails.images.length
                  ) {
                    imageUrl = resolveVehicleImage(vehicleDetails.images[0]);
                  } else if (
                    typeof vehicleDetails.image === "string" &&
                    vehicleDetails.image
                  ) {
                    imageUrl = resolveVehicleImage(vehicleDetails.image);
                  } else if (vehicleDetails.img) {
                    imageUrl = resolveVehicleImage(vehicleDetails.img);
                  } else if (vehicleDetails.photo) {
                    imageUrl = resolveVehicleImage(vehicleDetails.photo);
                  }
                }

                const displayBookingId =
                  bookingDetails._id ||
                  bookingDetails.id ||
                  id ||
                  cur._id ||
                  cur.id ||
                  "Not available";

                const displayPrice =
                  bookingDetails.totalPrice != null
                    ? Number(bookingDetails.totalPrice)
                    : bookingDetails.price != null
                    ? Number(bookingDetails.price)
                    : null;

                return (
                  <div
                    key={id || cur._id || idx}
                    className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-4 md:px-6 md:py-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
                      {/* Vehicle image */}
                      <div className="flex items-center justify-center">
                        <ImageWithFallback
                          src={imageUrl}
                          alt={
                            vehicleDetails?.name ||
                            vehicleDetails?.model ||
                            "vehicle"
                          }
                          size={200}
                          fallback={"/vehicles/home.webp"}
                          className="bg-[#F9FAFB] border border-[#E5E7EB]"
                        />
                      </div>

                      {/* Details */}
                      <div className="md:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-[#0F172A] mb-1 break-words">
                              {vehicleDetails?.name ||
                                vehicleDetails?.model ||
                                "Vehicle name not available"}
                            </h3>
                            <p className="text-sm text-[#6B7280] mb-1">
                              <span className="font-medium">Booking ID:</span>{" "}
                              {displayBookingId}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-[#0F172A] mb-1 flex items-center justify-end gap-1">
                              <MdCurrencyRupee />
                              {displayPrice != null
                                ? Number(displayPrice).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : "—"}
                            </p>
                            <div className="text-xs font-medium text-[#6B7280]">
                              {status && (
                                <span className="px-2 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] capitalize">
                                  {status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pickup / Dropoff */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Pickup */}
                          <div>
                            <div className="text-sm font-medium text-[#0F172A] underline underline-offset-4 mb-2">
                              Pick up
                            </div>
                            <p className="text-sm text-[#111827] flex items-center gap-2">
                              <CiLocationOn className="text-[#4B5563]" />
                              {bookingDetails.pickUpLocation ||
                                bookingDetails.pickup_location ||
                                bookingDetails.fromLocation ||
                                bookingDetails.from_location ||
                                "Not specified"}
                            </p>
                            <div className="text-[13px] text-[#111827] flex flex-col gap-2 mt-2">
                              <div className="flex gap-2 items-center">
                                <CiCalendarDate
                                  style={{ fontSize: 15 }}
                                  className="text-[#4B5563]"
                                />
                                <span>{formatDate(pickupDate)}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <IoMdTime
                                  style={{ fontSize: 16 }}
                                  className="text-[#4B5563]"
                                />
                                <span>{formatTime(pickupDate)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Dropoff */}
                          <div>
                            <div className="text-sm font-medium text-[#0F172A] underline underline-offset-4 mb-2">
                              Drop off
                            </div>
                            <p className="text-sm text-[#111827] flex items-center gap-2">
                              <CiLocationOn className="text-[#4B5563]" />
                              {bookingDetails.dropOffLocation ||
                                bookingDetails.dropoff_location ||
                                bookingDetails.toLocation ||
                                bookingDetails.to_location ||
                                "Not specified"}
                            </p>
                            <div className="text-[13px] text-[#111827] flex flex-col gap-2 mt-2">
                              <div className="flex gap-2 items-center">
                                <CiCalendarDate
                                  style={{ fontSize: 15 }}
                                  className="text-[#4B5563]"
                                />
                                <span>{formatDate(dropoffDate)}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <IoMdTime
                                  style={{ fontSize: 16 }}
                                  className="text-[#4B5563]"
                                />
                                <span>{formatTime(dropoffDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
                            onClick={() => handleDetailsModal(cur)}
                          >
                            Details
                          </button>

                          <button
                            className="inline-flex items-center justify-center rounded-full bg-white border border-[#2563EB] px-5 py-2.5 text-sm font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                            onClick={() =>
                              handleDownloadInvoice(bookingDetails, id, cur)
                            }
                          >
                            Download Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footers />
    </div>
  );
}
