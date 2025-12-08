// src/pages/admin/pages/Kanban.jsx
import { useEffect, useState, useMemo } from "react";
import { api } from "../../../api"; // ✅ central API helper

const ALL_BOOKINGS_URL = "/api/admin/allBookings";
const CHANGE_STATUS_URL = "/api/admin/changeStatus";

// Status lanes definition
const STATUS_LANES = [
  { key: "notBooked", label: "Not Booked" },
  { key: "booked", label: "Booked" },
  { key: "onTrip", label: "On Trip" },
  { key: "notPicked", label: "Not Picked" },
  { key: "overDue", label: "Overdue" },
  { key: "tripCompleted", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];

const Kanban = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // ✅ goes through src/api.js (handles base URL + cookies + tokens)
      const raw = await api.get(ALL_BOOKINGS_URL);

      let list = [];

      if (Array.isArray(raw)) list = raw;
      else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) list = raw.data;
        else if (Array.isArray(raw.bookings)) list = raw.bookings;
        else if (Array.isArray(raw.allBookings)) list = raw.allBookings;
        else {
          const firstArrayProp = Object.values(raw).find((v) =>
            Array.isArray(v)
          );
          list = firstArrayProp || [];
        }
      }

      setBookings(list);
    } catch (err) {
      console.error("[Kanban] fetch error:", err);
      setBookings([]);
      setErrorMsg("Error while fetching bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Group bookings by status
  const lanes = useMemo(() => {
    const map = {};
    STATUS_LANES.forEach((lane) => {
      map[lane.key] = [];
    });

    bookings.forEach((b) => {
      const status = b.status || "notBooked";
      if (!map[status]) map[status] = [];
      map[status].push(b);
    });

    return map;
  }, [bookings]);

  // Handle drag start
  const handleDragStart = (e, bookingId, fromStatus) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ bookingId, fromStatus })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over for droppable columns
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop into a new lane
  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();

    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }

    const { bookingId, fromStatus } = data;
    if (!bookingId || !fromStatus || fromStatus === targetStatus) return;

    // ✅ Optimistic update in UI
    setBookings((prev) =>
      prev.map((b) =>
        String(b._id) === String(bookingId)
          ? { ...b, status: targetStatus }
          : b
      )
    );

    setUpdatingId(bookingId);
    setErrorMsg("");

    try {
      await api.post(CHANGE_STATUS_URL, {
        id: bookingId,
        status: targetStatus,
      });
      // if success, keep optimistic state
    } catch (err) {
      console.warn("[Kanban] changeStatus failed:", err?.status, err?.message);

      // ❌ revert on error
      setBookings((prev) =>
        prev.map((b) =>
          String(b._id) === String(bookingId)
            ? { ...b, status: fromStatus }
            : b
        )
      );
      setErrorMsg(
        err?.status === 401 || err?.status === 403
          ? "Session expired or unauthorized."
          : "Failed to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const laneTotal = (statusKey) => lanes[statusKey]?.length || 0;

  const formatPickup = (b) => {
    const d =
      b.pickupDate ||
      b.pickUpDate ||
      b.startDate ||
      b.fromDate ||
      b.start_date ||
      b.pick_up_date ||
      b.createdAt;

    const date = d ? new Date(d) : null;
    if (!date || isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <span
          className="
            inline-flex items-center px-2 py-[2px]
            text-[11px] font-semibold uppercase tracking-[0.16em]
            text-[#1D4ED8] bg-[#EFF6FF]
            border border-[#BFDBFE]
            rounded-md
          "
        >
          Kanban
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
          Task Board
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage bookings visually by dragging them across status lanes.
        </p>

        {errorMsg && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 inline-block">
            {errorMsg}
          </p>
        )}
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          bg-white rounded-2xl border border-gray-200
          shadow-sm p-4 sm:p-5 lg:p-6
        "
      >
        {loading ? (
          <div className="text-gray-500 text-sm">Loading bookings…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Scrollable Kanban row */}
            <div className="flex gap-4 overflow-x-auto pb-1">
              {STATUS_LANES.map((lane) => (
                <div
                  key={lane.key}
                  className="
                    flex-shrink-0 w-64
                    bg-slate-50
                    border border-slate-200
                    rounded-2xl
                    flex flex-col
                    max-h-[520px]
                  "
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, lane.key)}
                >
                  {/* Lane header */}
                  <div className="px-3 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {lane.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {laneTotal(lane.key)}{" "}
                        {laneTotal(lane.key) === 1 ? "booking" : "bookings"}
                      </p>
                    </div>
                  </div>

                  {/* Lane body */}
                  <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
                    {(lanes[lane.key] || []).map((b) => {
                      const id = b._id || b.id;
                      const isUpdating =
                        updatingId && String(updatingId) === String(id);

                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, id, b.status || "notBooked")
                          }
                          className={`
                            bg-white border border-slate-200 rounded-xl px-3 py-2.5
                            text-xs shadow-[0_1px_2px_rgba(15,23,42,0.04)]
                            cursor-grab active:cursor-grabbing
                            transition-transform
                            hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(15,23,42,0.08)]
                            ${
                              isUpdating
                                ? "opacity-60 pointer-events-none"
                                : ""
                            }
                          `}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-slate-800 truncate">
                              {b?.vehicleDetails?.name ||
                                b?.vehicleDetails?.model ||
                                "Vehicle"}
                            </p>
                            <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-slate-100 text-slate-500">
                              ₹
                              {Number(
                                b.totalPrice ||
                                  b.total_price ||
                                  b.price ||
                                  0
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 truncate">
                            {b.userName || b.user || "Customer"} •{" "}
                            {b.pickUpLocation ||
                              b.pickupLocation ||
                              b.pickup_location ||
                              b.fromLocation ||
                              b.from_location ||
                              "Location"}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-1">
                            Pickup: {formatPickup(b)}
                          </p>
                        </div>
                      );
                    })}

                    {laneTotal(lane.key) === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-6">
                        No bookings in this lane.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Tip: Drag bookings between lanes to update their status. Changes
              are saved automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban;
