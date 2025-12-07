import { useEffect, useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const BOOKINGS_URL = "/api/admin/allBookings";

// helper: get date key like "2025-12-06"
const getDateKey = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Calender = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getDateKey(new Date())
  );

  // 1) Fetch bookings once
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(BOOKINGS_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          console.warn("[Calendar] allBookings failed", res.status);
          setBookings([]);
          setLoading(false);
          return;
        }

        const raw = await res.json().catch(() => null);
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
        console.error("[Calendar] fetch error:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // 2) Normalize bookings into map keyed by pickup date (or createdAt)
  const bookingsByDay = useMemo(() => {
    const map = {};

    bookings.forEach((b) => {
      const pickup =
        b.pickupDate ||
        b.pickUpDate ||
        b.startDate ||
        b.fromDate ||
        b.start_date ||
        b.pick_up_date ||
        b.createdAt;

      if (!pickup) return;

      const d = new Date(pickup);
      if (isNaN(d.getTime())) return;

      const key = getDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });

    return map;
  }, [bookings]);

  // 3) Build calendar grid for currentMonth
  const calendarDays = useMemo(() => {
    const days = [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // first day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)

    // number of days in current month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // previous month days to fill first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // build 6x7 = 42 cells
    let dayCounter = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < 42; i++) {
      let dateObj;
      let isCurrentMonth = false;

      if (i < startDay) {
        // previous month
        const day = prevMonthLastDay - (startDay - 1 - i);
        dateObj = new Date(year, month - 1, day);
      } else if (dayCounter <= daysInMonth) {
        // current month
        dateObj = new Date(year, month, dayCounter);
        isCurrentMonth = true;
        dayCounter++;
      } else {
        // next month
        dateObj = new Date(year, month + 1, nextMonthDay);
        nextMonthDay++;
      }

      const key = getDateKey(dateObj);
      const todayKey = getDateKey(new Date());
      const isToday = key === todayKey;
      const dayBookings = bookingsByDay[key] || [];

      days.push({
        date: dateObj,
        key,
        isCurrentMonth,
        isToday,
        bookingsCount: dayBookings.length,
      });
    }

    return days;
  }, [currentMonth, bookingsByDay]);

  // bookings for selected date
  const selectedBookings = bookingsByDay[selectedDateKey] || [];
  const selectedDateObj = new Date(selectedDateKey);

  const monthFormatter = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          Calendar
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
          Booking Calendar
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Visualize bookings by date. Click a day to view all bookings for that
          date.
        </p>
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-5 sm:p-6 lg:p-8
        "
      >
        {/* TOP: month selector */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="
                inline-flex items-center justify-center
                w-8 h-8 rounded-full border border-gray-200
                text-gray-600 hover:bg-gray-50 hover:text-gray-900
              "
            >
              <MdChevronLeft size={18} />
            </button>

            <div className="text-lg font-semibold text-gray-900">
              {monthFormatter.format(currentMonth)}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="
                inline-flex items-center justify-center
                w-8 h-8 rounded-full border border-gray-200
                text-gray-600 hover:bg-gray-50 hover:text-gray-900
              "
            >
              <MdChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/40" />
              <span>Day with bookings</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#EEF2FF] border border-[#4F46E5]" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* CALENDAR + SIDE PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CALENDAR GRID */}
          <div className="lg:col-span-2">
            {/* Weekday header */}
            <div className="grid grid-cols-7 text-[11px] font-semibold text-gray-400 mb-1">
              {weekdayLabels.map((day) => (
                <div key={day} className="text-center py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-sm">
              {calendarDays.map((day) => {
                const isSelected = day.key === selectedDateKey;
                const hasBookings = day.bookingsCount > 0;

                let baseClasses =
                  "relative flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition";

                let borderColor = "border-transparent";
                let bgColor = "bg-white";
                let textColor = day.isCurrentMonth
                  ? "text-gray-900"
                  : "text-gray-300";

                if (day.isToday) {
                  bgColor = "bg-[#EEF2FF]";
                  borderColor = "border-[#4F46E5]";
                  textColor = "text-gray-900";
                }

                if (isSelected) {
                  bgColor = "bg-[#2563EB]";
                  borderColor = "border-[#2563EB]";
                  textColor = "text-white";
                }

                if (!day.isCurrentMonth) {
                  bgColor = "bg-gray-50";
                }

                return (
                  <button
                    key={day.key + day.date.getTime()}
                    type="button"
                    onClick={() => setSelectedDateKey(day.key)}
                    className={`${baseClasses} ${bgColor} ${borderColor} ${textColor}`}
                  >
                    <span className="font-medium">
                      {day.date.getDate()}
                    </span>

                    {hasBookings && (
                      <span
                        className={`
                          mt-1 inline-flex items-center justify-center
                          px-1.5 py-[1px] rounded-full text-[10px] font-medium
                          ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#DBEAFE] text-[#1D4ED8]"
                          }
                        `}
                      >
                        {day.bookingsCount}{" "}
                        <span className="hidden sm:inline ml-1">bookings</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: list of bookings for selected date */}
          <div className="lg:col-span-1 border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Bookings on{" "}
                <span className="font-bold text-[#2563EB]">
                  {isNaN(selectedDateObj.getTime())
                    ? "—"
                    : selectedDateObj.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                </span>
              </h3>
              {loading && (
                <span className="text-[11px] text-gray-400">Loading…</span>
              )}
            </div>

            {selectedBookings.length === 0 && !loading && (
              <p className="text-xs text-gray-500 mt-2">
                No bookings on this date.
              </p>
            )}

            <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedBookings.map((b) => {
                const pickup =
                  b.pickupDate ||
                  b.pickUpDate ||
                  b.startDate ||
                  b.fromDate ||
                  b.start_date ||
                  b.pick_up_date;
                const time = pickup ? new Date(pickup) : null;

                return (
                  <div
                    key={b._id || b.id}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-800 truncate">
                        {b?.vehicleDetails?.name ||
                          b?.vehicleDetails?.model ||
                          "Vehicle"}
                      </span>
                      <span className="px-2 py-[2px] rounded-full bg-[#EFF6FF] text-[#2563EB] font-medium text-[10px] capitalize">
                        {b.status || "booked"}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500 flex justify-between gap-2">
                      <span>
                        {time && !isNaN(time.getTime())
                          ? time.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </span>
                      <span className="truncate max-w-[120px]">
                        {b.pickUpLocation ||
                          b.pickupLocation ||
                          b.pickup_location ||
                          b.fromLocation ||
                          b.from_location ||
                          "Location"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calender;
