const AllVendors = () => {
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
          Vendors
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
          All Vendors
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage and monitor all vendors registered on the platform.
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
        <div className="text-gray-500 text-sm">
          Vendor list will appear here…
        </div>
      </div>
    </div>
  );
};

export default AllVendors;
