import VendorBookingsTable from "./VendorBookingTable";

const VendorBookings = () => {
  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
          Vendor Bookings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          View all bookings for your vehicles and track customer rentals.
        </p>
      </div>

      {/* Card Wrapper */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-[#E5E7EB]
          shadow-md
          p-4 sm:p-6 lg:p-8
        "
      >
        <VendorBookingsTable />
      </div>
    </div>
  );
};

export default VendorBookings;
