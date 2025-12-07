// src/components/UserOrderDetailsModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdCurrencyRupee } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { CiCalendarDate, CiLocationOn } from "react-icons/ci";
import { setIsOrderModalOpen, setSingleOrderDetails } from "../redux/user/userSlice";
import { toast } from "sonner";

/* defensive helpers */
function parseDateSafe(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
function formatDate(d) {
  const dt = parseDateSafe(d);
  if (!dt) return "—";
  return `${String(dt.getDate()).padStart(2, "0")}/${String(
    dt.getMonth() + 1
  ).padStart(2, "0")}/${dt.getFullYear()}`;
}
function formatTime(d) {
  const dt = parseDateSafe(d);
  if (!dt) return "--:--";
  return `${String(dt.getHours()).padStart(2, "0")}:${String(
    dt.getMinutes()
  ).padStart(2, "0")}`;
}
function resolveImageSrc(raw) {
  if (!raw) return "/placeholder-vehicle.png";
  if (Array.isArray(raw) && raw.length) raw = raw[0];
  if (typeof raw !== "string") return "/placeholder-vehicle.png";
  const s = raw.trim();
  if (!s) return "/placeholder-vehicle.png";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return s;
  return `/vehicles/${s}`;
}

export default function UserOrderDetailsModal() {
  const dispatch = useDispatch();
  const { isOrderModalOpen, singleOrderDetails: cur } = useSelector(
    (state) => state.user || {}
  );
  const [internalLoading, setInternalLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const dialogRef = useRef(null);

  // Lock body scroll while modal open
  useEffect(() => {
    if (isOrderModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
    return;
  }, [isOrderModalOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOrderModalOpen) {
        dispatch(setIsOrderModalOpen(false));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, isOrderModalOpen]);

  // Defensive: small grace period while Redux fills cur
  useEffect(() => {
    if (isOrderModalOpen && (!cur || Object.keys(cur).length === 0)) {
      setInternalLoading(true);
      const t = setTimeout(() => setInternalLoading(false), 800);
      return () => clearTimeout(t);
    }
    setInternalLoading(false);
    return;
  }, [isOrderModalOpen, cur]);

  const closeModal = () => {
    try {
      dispatch(setSingleOrderDetails({}));
    } catch (e) {}
    dispatch(setIsOrderModalOpen(false));
  };

  // Early return: don't render details until cur shape is ready
  const curIsObject = cur && typeof cur === "object";
  const bookingCandidateReady =
    curIsObject &&
    cur.bookingDetails &&
    Object.keys(cur.bookingDetails).length > 0;
  const originalReady =
    curIsObject && cur.original && Object.keys(cur.original).length > 0;
  const hasId = curIsObject && (cur._id || cur.id);
  const isFullyReady = bookingCandidateReady || originalReady || Boolean(hasId);

  if (!isOrderModalOpen) return null;

  if (internalLoading || !curIsObject || !isFullyReady) {
    return (
      <div
        className="fixed inset-0 z-[999] grid place-items-center bg-black/60 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-lg text-center">
          <div className="text-sm font-medium text-gray-700">
            Loading booking details…
          </div>
        </div>
      </div>
    );
  }

  // Normalize booking & vehicle (do not mutate cur)
  const booking =
    (cur &&
      cur.bookingDetails &&
      Object.keys(cur.bookingDetails).length > 0 && {
        ...cur.bookingDetails,
      }) ||
    (cur &&
      cur.original &&
      Object.keys(cur.original).length > 0 && {
        _id:
          cur.original._id ??
          cur.original.id ??
          cur.original.bookingId ??
          null,
        pickupDate:
          cur.original.pickupDate ??
          cur.original.pickUpDate ??
          cur.original.startDate ??
          null,
        dropOffDate:
          cur.original.dropOffDate ??
          cur.original.dropoffDate ??
          cur.original.endDate ??
          null,
        pickUpLocation:
          cur.original.pickUpLocation ??
          cur.original.pickup_location ??
          cur.original.from ??
          null,
        dropOffLocation:
          cur.original.dropOffLocation ??
          cur.original.dropoff_location ??
          cur.original.to ??
          null,
        totalPrice: cur.original.totalPrice ?? cur.original.price ?? null,
        createdAt: cur.original.createdAt ?? null,
        status: cur.original.status ?? null,
      }) ||
    (cur &&
    (cur._id || cur.pickupDate || cur.pickUpLocation || cur.totalPrice)
      ? {
          _id: cur._id ?? cur.id ?? null,
          pickupDate: cur.pickupDate ?? cur.pickUpDate ?? null,
          dropOffDate: cur.dropOffDate ?? cur.dropoffDate ?? null,
          pickUpLocation: cur.pickUpLocation ?? cur.pickup_location ?? null,
          dropOffLocation:
            cur.dropOffLocation ?? cur.dropoff_location ?? null,
          totalPrice: cur.totalPrice ?? cur.price ?? null,
          createdAt: cur.createdAt ?? null,
          status: cur.status ?? null,
        }
      : {});

  const vehicle =
    (cur &&
      cur.vehicleDetails &&
      Object.keys(cur.vehicleDetails).length > 0 && {
        ...cur.vehicleDetails,
      }) ||
    (cur &&
      cur.original &&
      (cur.original.vehicleSnapshot ||
        cur.original.vehicle ||
        cur.original.vehicleDetails)) ||
    {};

  const pickupDate = booking ? booking.pickupDate : null;
  const dropOffDate = booking ? booking.dropOffDate : null;
  const imageSrc = resolveImageSrc(
    vehicle?.image || vehicle?.img || vehicle?.filename
  );

  const handleDownloadInvoice = async () => {
    try {
      if (downloading) return;
      const id = booking._id || booking.id || cur?._id;
      if (!id) {
        toast?.error?.("Booking ID missing");
        console.error("[Invoice] booking id missing:", { booking, cur });
        return;
      }

      setDownloading(true);

      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`/api/invoice/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Invoice fetch failed:", res.status, txt);
        toast?.error?.(`Invoice request failed: ${res.status}`);
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast?.success?.("Invoice downloaded");
    } catch (err) {
      console.error("download invoice error:", err);
      toast?.error?.("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] grid place-items-center bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={closeModal}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Order Details
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close order details"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-6">
          <section className="bg-[#FBFCFD] border border-[#EEF4F8] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#0F172A] mb-3">
              Booking Information
            </h4>

            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Booking ID</span>
                <span className="text-[#0F172A] text-sm break-all">
                  {booking._id ||
                    booking.id ||
                    cur._id ||
                    "Not available"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Total Amount</span>
                <span className="text-[#0F172A] font-semibold flex items-center gap-1">
                  <MdCurrencyRupee />
                  {booking.totalPrice != null
                    ? Number(booking.totalPrice).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }
                      )
                    : booking.price != null
                    ? Number(booking.price)
                    : "—"}
                </span>
              </div>

              <hr className="my-2 border-[#EDF2F7]" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">
                    Pickup Location
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    {booking.pickUpLocation ||
                      booking.pickup_location ||
                      booking.from ||
                      "Not specified"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6B7280] mb-1">
                    Dropoff Location
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    {booking.dropOffLocation ||
                      booking.dropoff_location ||
                      booking.to ||
                      "Not specified"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6B7280] mb-1">
                    Pickup Date
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    {formatDate(pickupDate)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6B7280] mb-1">
                    Dropoff Date
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    {formatDate(dropOffDate)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6B7280] mb-1">
                    Pickup Time
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    {formatTime(pickupDate)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6B7280] mb-1">
                    Dropoff Time
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    {formatTime(dropOffDate)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-[#0F172A] mb-3">
              Vehicle Information
            </h4>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* 🔥 UPDATED IMAGE BLOCK */}
                <div className="flex items-center justify-center">
                  <div
                    className="relative rounded-lg overflow-hidden border border-[#EEF2F6] bg-[#FBFCFD]"
                    style={{
                      width: "7rem", // ~w-28
                      aspectRatio: "4 / 3", // same feel as Orders card
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={vehicle?.name || vehicle?.model || "vehicle"}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-vehicle.png";
                      }}
                    />
                  </div>
                </div>
                {/* -------------------------- */}

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#6B7280]">Name</div>
                      <div className="text-base font-semibold text-[#0F172A]">
                        {vehicle?.name ||
                          vehicle?.model ||
                          "Vehicle name not available"}
                      </div>
                    </div>
                    <div className="text-right text-sm text-[#6B7280]">
                      <div>Vehicle Number</div>
                      <div className="text-[#0F172A]">
                        {vehicle?.registeration_number ||
                          vehicle?.registration_number ||
                          vehicle?.regNo ||
                          "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-[#6B7280]">
                    <div>
                      <div>Model</div>
                      <div className="text-[#0F172A]">
                        {vehicle?.model || "—"}
                      </div>
                    </div>
                    <div>
                      <div>Company</div>
                      <div className="text-[#0F172A]">
                        {vehicle?.company || vehicle?.brand || "—"}
                      </div>
                    </div>
                    <div>
                      <div>Fuel Type</div>
                      <div className="text-[#0F172A]">
                        {vehicle?.fuel_type || "—"}
                      </div>
                    </div>
                    <div>
                      <div>Transmission</div>
                      <div className="text-[#0F172A]">
                        {vehicle?.transmition ||
                          vehicle?.transmission ||
                          "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white rounded-b-2xl flex justify-between items-center">
          <div className="text-xs text-[#6B7280]">
            Booked on:{" "}
            {formatDate(booking?.createdAt ?? cur?.original?.createdAt)}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
                downloading
                  ? "bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8]"
              }`}
            >
              {downloading ? "Downloading…" : "Download Invoice"}
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white border border-[#E5E7EB] text-[#0F172A] hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
