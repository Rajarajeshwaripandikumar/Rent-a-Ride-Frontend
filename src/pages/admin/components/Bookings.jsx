import BookingsTable from "./BookingsTable";

const Bookings = () => {
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
          Bookings
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
          User Bookings
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          View and manage all customer booking details.
        </p>
      </div>

      {/* CARD WRAPPER */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-4 sm:p-6 lg:p-8
        "
      >
        <BookingsTable />
      </div>
    </div>
  );
};

export default Bookings;
