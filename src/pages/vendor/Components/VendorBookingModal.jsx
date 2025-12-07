import { useDispatch, useSelector } from "react-redux";
import { setVendorOrderModalOpen } from "../../../redux/vendor/vendorBookingSlice";

const VendorBookingDetailModal = () => {
  const { isVendorOderModalOpen, vendorSingleOrderDetails: cur } = useSelector(state => state.vendorBookingSlice);
  const dispatch = useDispatch();

  if (!cur) return null;

  const pickupDate = new Date(cur.pickupDate);
  const dropOffDate = new Date(cur.dropOffDate);
  const vehicle = cur.vehicleId;

  const closeModal = () => dispatch(setVendorOrderModalOpen(false));

  return (
    <>
      {isVendorOderModalOpen && cur && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4" onClick={closeModal}>
          <div className="relative w-full max-w-lg md:max-w-xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">Booking Details</p>
                <p className="text-sm text-slate-600 mt-1">Overview of this rental booking and vehicle information.</p>
              </div>
              <button onClick={closeModal} className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 text-slate-500 bg-white hover:bg-slate-100 hover:text-red-500 transition">×</button>
            </div>

            {/* Content */}
            <div className="p-5 md:p-6 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-900 mb-2">Booking Details</h3>
              <hr className="border-gray-200 mb-3" />
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Booking ID</span><span className="font-medium text-slate-900">{cur._id}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Amount</span><span className="font-semibold text-slate-900">{cur.totalPrice}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pickup</span><span className="font-medium text-slate-900">{cur.pickUpLocation} ({pickupDate.getDate()}/{pickupDate.getMonth()+1}/{pickupDate.getFullYear()} {pickupDate.getHours().toString().padStart(2,'0')}:{pickupDate.getMinutes().toString().padStart(2,'0')})</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Dropoff</span><span className="font-medium text-slate-900">{cur.dropOffLocation} ({dropOffDate.getDate()}/{dropOffDate.getMonth()+1}/{dropOffDate.getFullYear()} {dropOffDate.getHours().toString().padStart(2,'0')}:{dropOffDate.getMinutes().toString().padStart(2,'0')})</span></div>
              </div>

              <h3 className="font-semibold text-slate-900 mb-2 mt-4">Vehicle Details</h3>
              <hr className="border-gray-200 mb-3" />
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Vehicle Number</span><span className="font-medium text-slate-900">{vehicle.registeration_number}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="font-medium text-slate-900">{vehicle.model}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Company</span><span className="font-medium text-slate-900">{vehicle.company}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium text-slate-900">{vehicle.car_type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Seats</span><span className="font-medium text-slate-900">{vehicle.seats}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Fuel</span><span className="font-medium text-slate-900">{vehicle.fuel_type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Transmission</span><span className="font-medium text-slate-900">{vehicle.transmission}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Year</span><span className="font-medium text-slate-900">{vehicle.year}</span></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 pb-4 pt-2 border-t border-gray-100 bg-slate-50">
              <button onClick={closeModal} className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-[#0071DC] text-white border border-[#1D4ED8] shadow-sm hover:bg-[#0654BA] active:scale-[0.98] transition">
                Ok, got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorBookingDetailModal;
