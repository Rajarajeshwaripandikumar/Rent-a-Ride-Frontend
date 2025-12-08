// src/pages/VendorDashboard/Components/VendorBookingsTable.jsx
import { useEffect, useState } from "react";
import { MdCurrencyRupee } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { useDispatch } from "react-redux";
import VendorBookingDetailModal from "./VendorBookingModal";
import {
  setVendorOrderModalOpen,
  setVendorSingleOrderDetails,
} from "../../../redux/vendor/vendorBookingSlice";

// ✅ use your centralized API wrapper
import { api } from "../../../api"; // <-- path assumes src/api.js

const VendorBookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const optionsValue = [
    "notBooked",
    "booked",
    "onTrip",
    "notPicked",
    "canceled",
    "overDue",
    "tripCompleted",
  ];

  // ===== FETCH BOOKINGS FOR THIS VENDOR (via src/api.js) =====
  const fetchBookings = async () => {
    try {
      // vendor ID is read from JWT on backend, so empty body is fine
      const data = await api.post("/api/vendor/vendorBookings", {});

      if (data?.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("fetchBookings error:", err);
      setBookings([]);
      // optional: handle 401/403 (e.g. force logout)
      // if (err.status === 401 || err.status === 403) { ... }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDetailsModal = (cur) => {
    dispatch(setVendorOrderModalOpen(true));
    dispatch(setVendorSingleOrderDetails(cur));
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "booked":
      case "onTrip":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "canceled":
      case "overDue":
        return "bg-red-50 text-red-600 border-red-200";
      case "tripCompleted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <>
      <VendorBookingDetailModal />

      <div className="max-w-5xl mx-auto pb-16">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center min-h-[260px] text-sm font-medium text-slate-500">
            Loading bookings...
          </div>
        ) : bookings.length > 0 ? (
          <p className="text-sm text-slate-600">
            Check out all bookings related to your vehicles.
          </p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center min-h-[260px] text-sm font-medium text-slate-500">
            No bookings yet.
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((cur, idx) => {
              const pickupDate = new Date(cur.pickupDate);
              const dropoffDate = new Date(cur.dropOffDate);

              // Construct image path from public/vehicles
              const vehicleImage = cur?.vehicleId?.image?.[0]
                ? `/vehicles/${cur.vehicleId.image[0]}`
                : "/vehicles/placeholder.png";

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 md:p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Vehicle Image */}
                    <div className="w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        alt={cur.vehicleId?.name || "Vehicle"}
                        className="w-full h-auto"
                        src={vehicleImage}
                        style={{ aspectRatio: "4/3", objectFit: "contain" }}
                      />
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Booking #{cur._id}
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">
                          ID: {cur._id}
                        </p>
                        <p className="text-lg font-semibold mb-4 flex items-center text-slate-900">
                          <MdCurrencyRupee className="mr-1" /> {cur.totalPrice}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Pick up
                          </div>
                          <p className="text-sm text-slate-800 flex items-center gap-2 capitalize">
                            <CiLocationOn className="text-base" />{" "}
                            {cur.pickUpLocation}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {pickupDate.getDate()}/
                            {pickupDate.getMonth() + 1}/
                            {pickupDate.getFullYear()} -{" "}
                            {pickupDate
                              .getHours()
                              .toString()
                              .padStart(2, "0")}
                            :
                            {pickupDate
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}
                          </p>
                        </div>

                        <div className="flex-1">
                          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Drop off
                          </div>
                          <p className="text-sm text-slate-800 flex items-center gap-2 capitalize">
                            <CiLocationOn className="text-base" />{" "}
                            {cur.dropOffLocation}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {dropoffDate.getDate()}/
                            {dropoffDate.getMonth() + 1}/
                            {dropoffDate.getFullYear()} -{" "}
                            {dropoffDate
                              .getHours()
                              .toString()
                              .padStart(2, "0")}
                            :
                            {dropoffDate
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-3 items-center">
                          <button
                            className="inline-flex items-center justify-center text-xs md:text-sm text-white bg-black hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 px-5 py-2 font-medium rounded-lg transition"
                            onClick={() => handleDetailsModal(cur)}
                          >
                            Details
                          </button>
                          <div
                            className={`inline-flex items-center justify-center px-4 py-1.5 text-[11px] md:text-xs font-semibold capitalize rounded-full border ${getStatusClasses(
                              cur.status
                            )}`}
                          >
                            {cur.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default VendorBookingsTable;
