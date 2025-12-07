const AllUsers = () => {
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
          Users
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
          All Registered Users
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          View, manage, and monitor all users of the Rent-a-Ride platform.
        </p>
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-5 sm:p-6
        "
      >
        <div className="text-slate-500 text-sm">
          User table will appear here…
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
