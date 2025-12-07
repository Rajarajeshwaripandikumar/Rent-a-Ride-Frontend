// src/pages/user/AllVehiclesofSameModel.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCarSide } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

import CarNotFound from "./CarNotFound";
import Header from "../../components/Header";
import { setVariantModeOrNot } from "../../redux/user/sortfilterSlice";

const AllVehiclesofSameModel = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxAllVariants = useSelector(
    (state) => state.userListVehicles?.allVariants
  );
  const passedVariants = location?.state?.variants ?? null;

  // Source of variants: location.state first, then redux fallback
  const allVariants = Array.isArray(passedVariants)
    ? passedVariants
    : Array.isArray(reduxAllVariants)
    ? reduxAllVariants
    : [];

  // We’re no longer filtering/sorting here, just show all variants
  const activeList = Array.isArray(allVariants) ? allVariants : [];

  // Let global state know we are in "variant mode" or not
  useEffect(() => {
    if (Array.isArray(allVariants) && allVariants.length > 0) {
      dispatch(setVariantModeOrNot(true));
    } else {
      dispatch(setVariantModeOrNot(false));
    }
  }, [allVariants, dispatch]);

  const handleVehicleDetail = (vehicleId, vehicleObj) => {
    navigate(`/vehicles/${vehicleId}`, { state: { vehicle: vehicleObj } });
  };

  const showCarNotFound =
    !Array.isArray(activeList) || activeList.length === 0;

  // --- Image helper: handles public/vehicles, full URLs, etc. ---
  const getVehicleImageSrc = (vehicle) => {
    if (!vehicle) return "";

    const raw = Array.isArray(vehicle.image)
      ? vehicle.image[0]
      : vehicle.image;

    if (!raw || typeof raw !== "string") return "";

    // Already a full URL
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    // Already an absolute path
    if (raw.startsWith("/")) {
      return raw;
    }

    // Strip leading "public/" if it was stored like that
    let cleaned = raw.replace(/^public\//, "");

    // If it already starts with "vehicles/", just prefix with root
    if (cleaned.startsWith("vehicles/")) {
      return `/${cleaned}`;
    }

    // Default: file is inside public/vehicles
    return `/vehicles/${cleaned}`;
  };

  useEffect(() => {
    console.debug("[AllVehiclesofSameModel] debug:", {
      passedVariantsLength: Array.isArray(passedVariants)
        ? passedVariants.length
        : 0,
      reduxAllVariantsLength: Array.isArray(reduxAllVariants)
        ? reduxAllVariants.length
        : 0,
      activeListLength: Array.isArray(activeList) ? activeList.length : 0,
    });
  }, [passedVariants, reduxAllVariants, activeList]);

  return (
    <>
      <Header />

      <div className="w-full min-h-screen bg-[#F5F7FB] flex justify-center px-4 md:px-6 lg:px-10 pb-10 pt-6 md:pt-10">
        <div className="w-full max-w-[1200px]">
          {/* Vehicles list */}
          {Array.isArray(activeList) && activeList.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeList.map(
                (cur) =>
                  cur &&
                  !cur.isDeleted && (
                    <div
                      key={cur._id}
                      className="
                        bg-white
                        rounded-2xl
                        border border-[#E5E7EB]
                        shadow-md
                        flex flex-col
                        overflow-hidden
                        hover:shadow-lg
                        hover:-translate-y-1
                        transition-all duration-150
                      "
                    >
                      {/* Image */}
                      <div className="bg-[#F9FAFB] px-3 pt-3 pb-2 flex items-center justify-center">
                        <div className="aspect-[4/3] w-full max-h-52 overflow-hidden rounded-xl border border-dashed border-[#E5E7EB] bg-white flex items-center justify-center">
                          <img
                            src={getVehicleImageSrc(cur)}
                            alt={cur.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                        {/* Title + price */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="text-[14px] md:text-[15px] capitalize font-semibold tracking-tight text-[#0F172A]">
                              {cur.name}
                            </h2>
                            <p className="text-[11px] text-[#6B7280]">
                              {cur.company}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[15px] font-bold text-[#0F172A]">
                              ₹{cur.price}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF]">
                              Per Day
                            </p>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="mt-4 mb-3 text-[12px] text-[#111827] space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="flex items-center gap-1">
                              <FaCarSide className="text-[#2563EB]" />
                              <span>{cur.company}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <MdAirlineSeatReclineNormal className="text-[#2563EB]" />
                              <span>{cur.seats} Seats</span>
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="flex items-center gap-1">
                              <FaCarSide className="text-[#2563EB]" />
                              <span className="capitalize">
                                {cur.car_type}
                              </span>
                            </p>
                            <p className="flex items-center gap-1">
                              <BsFillFuelPumpFill className="text-[#2563EB]" />
                              <span className="capitalize">
                                {cur.fuel_type}
                              </span>
                            </p>
                          </div>
                        </div>

                        <hr className="border-[#E5E7EB]" />

                        {/* Actions */}
                        <div className="mt-3 flex justify-center items-center gap-3">
                          <button
                            onClick={() => handleVehicleDetail(cur._id, cur)}
                            className="
                              w-[110px]
                              inline-flex items-center justify-center
                              rounded-full
                              border border-transparent
                              bg-[#2563EB]
                              text-white
                              text-[12px]
                              font-semibold
                              px-3 py-2
                              hover:bg-[#1D4ED8]
                              transition-colors
                            "
                          >
                            Book Ride
                          </button>

                          <button
                            onClick={() => handleVehicleDetail(cur._id, cur)}
                            className="
                              w-[110px]
                              inline-flex items-center justify-center
                              rounded-full
                              border border-[#2563EB]
                              bg-white
                              text-[#2563EB]
                              text-[12px]
                              font-semibold
                              px-3 py-2
                              hover:bg-[#EFF5FF]
                              transition-colors
                            "
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          ) : (
            // No vehicles UI
            <div className="mt-10 flex flex-col items-center justify-center gap-4">
              <div className="w-52 max-w-full">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 240 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-2xl border border-[#E5E7EB] shadow-sm bg-white"
                >
                  <rect
                    x="0"
                    y="0"
                    width="240"
                    height="160"
                    rx="12"
                    fill="#F9FAFB"
                  />
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#9CA3AF"
                  >
                    No cars
                  </text>
                </svg>
              </div>
              <p className="text-sm md:text-base font-semibold text-[#0F172A]">
                No cars found for this model.
              </p>
            </div>
          )}

          {/* Existing CarNotFound component (as per your logic) */}
          {showCarNotFound && <CarNotFound />}
        </div>
      </div>
    </>
  );
};

export default AllVehiclesofSameModel;
