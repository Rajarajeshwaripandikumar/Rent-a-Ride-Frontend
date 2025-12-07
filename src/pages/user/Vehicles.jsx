// src/pages/user/Vehicles.jsx
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setVariants, showVehicles } from "../../redux/user/listAllVehicleSlice";
import { setData } from "../../redux/user/sortfilterSlice";
import { FaCarSide } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Filter from "../../components/Filter";
import Sort from "../../components/Sort";
import { signOut } from "../../redux/user/userSlice";
import Footers from "../../components/Footer";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { toast } from "sonner"; // ✅

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

// -------- VEHICLE DETAILS FETCH (for /vehicles/:id page) -------- //
export const onVehicleDetail = async (id, dispatch, navigate) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const res = await fetch(`${API_BASE_URL}/api/user/showVehicleDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    if (res.status === 401 || res.status === 403) {
      try {
        dispatch(signOut());
      } catch {}
      return;
    }

    const raw = await res.json().catch(() => null);
    const vehicle =
      (raw?.data && (Array.isArray(raw.data) ? raw.data[0] : raw.data)) ||
      raw?.vehicle ||
      raw;

    if (!vehicle) return;

    dispatch({ type: "userListVehicles/setVehicleDetail", payload: vehicle });
    dispatch(setVariants(null));
    dispatch(showVehicles([]));

    navigate(`/vehicles/${vehicle._id}`, { state: { vehicle } });
  } catch (error) {
    console.error("onVehicleDetail error:", error);
  }
};

// -------- SINGLE VEHICLE CARD -------- //
const VehicleCard = ({ cur, dispatch, navigate, bookingData }) => {
  const rawImage = Array.isArray(cur?.image)
    ? cur.image[0]
    : cur?.image ?? cur?.__raw?.image ?? cur?.__raw?.thumbnail;

  const src =
    typeof rawImage === "string" && rawImage.startsWith("http")
      ? rawImage
      : rawImage
      ? `/vehicles/${rawImage}`
      : "/placeholder-vehicle.png";

  const displayName = cur?.name ?? cur?.title ?? cur?.__raw?.name ?? "";
  const displayCompany = cur?.company ?? cur?.brand ?? cur?.__raw?.company ?? "";
  const displayPrice =
    cur?.price ??
    cur?.pricePerDay ??
    cur?.__raw?.price ??
    cur?.__raw?.pricePerDay ??
    0;
  const displaySeats =
    Number(cur?.seats ?? cur?.__raw?.seats ?? cur?.__raw?.seat ?? 0) || 0;
  const displayCarType = cur?.car_type ?? cur?.type ?? cur?.__raw?.car_type ?? "";
  const displayFuel = cur?.fuel_type ?? cur?.fuel ?? cur?.__raw?.fuel_type ?? "";

  // ✅ do we have proper booking data from search / booking flow?
  const hasBookingData =
    bookingData &&
    bookingData.pickup_district &&
    bookingData.pickup_location &&
    bookingData.dropoff_location &&
    bookingData.pickupDate &&
    bookingData.dropoffDate;

  const handleBookRide = () => {
    if (!hasBookingData) {
      // user came directly to /vehicles without completing search
      toast.error("Please choose pick-up & drop-off details first.");
      navigate("/", { state: { scrollToSearch: true } });
      return;
    }

    // ✅ go straight to Checkout page (route: /checkout)
    navigate("/checkout", {
      state: {
        vehicle: cur,
        bookingData,
      },
    });
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full h-48 overflow-hidden bg-[#F3F4F6]">
        <img
          src={src}
          alt={displayName || "vehicle"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder-vehicle.png";
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 capitalize">
              {displayName}
            </h3>
            <p className="text-[11px] text-gray-500">{displayCompany}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              ₹{displayPrice}
            </p>
            <p className="text-[10px] text-gray-500">Per Day</p>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-4 text-[12px] text-gray-700 font-mono space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCarSide className="text-blue-600" />
              <span>{displayCompany}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdAirlineSeatReclineNormal className="text-blue-600" />
              <span>{displaySeats} Seats</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCarSide className="text-blue-600" />
              <span className="capitalize">{displayCarType}</span>
            </div>
            <div className="flex items-center gap-2">
              <BsFillFuelPumpFill className="text-blue-600" />
              <span className="capitalize">{displayFuel}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={() => onVehicleDetail(cur._id, dispatch, navigate)}
            className="w-full rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Details
          </button>

          <button
            type="button"
            onClick={handleBookRide}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            Book Ride
          </button>
        </div>
      </div>
    </article>
  );
};

// -------- MAIN VEHICLES PAGE -------- //
const Vehicles = () => {
  const { userAllVehicles } =
    useSelector((state) => state.userListVehicles || {});
  const { filteredData } =
    useSelector((state) => state.sortfilterSlice || {});

  // ✅ correct slice name: bookingDataSlice
  const { selectedData } =
    useSelector((state) => state.bookingDataSlice || {});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const didFetchRef = useRef(false);

  useEffect(() => {
    dispatch(setVariants(null));

    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const res = await fetch(`${API_BASE_URL}/api/user/listAllVehicles`, {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
          credentials: "include",
        });

        const data = await res.json().catch(() => null);
        const payload = Array.isArray(data) ? data : data?.data ?? [];

        dispatch(showVehicles(payload));
        dispatch(setData(payload));
      } catch (error) {
        console.error("fetchData error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, navigate]);

  const isVisible = (cur) =>
    (!cur?.isDeleted || cur?.isDeleted === false) &&
    (cur?.isAdminApproved || cur?.isAdminApproved === true);

  const listToRender =
    Array.isArray(filteredData) && filteredData.length > 0
      ? filteredData
      : userAllVehicles || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <main className="flex-grow w-full px-4 sm:px-10 lg:px-20 xl:px-[120px] xl:pl-[100px] py-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Filters + Sort (one under another) */}
          <aside className="col-span-3 hidden lg:flex flex-col gap-6">
            {/* Filters card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md px-4 py-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Filters
              </h2>
              <Filter />
            </div>

            {/* Sort card directly under Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md px-4 py-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Sort
              </h2>
              <Sort />
            </div>
          </aside>

          {/* RIGHT: Available Vehicles heading + cars */}
          <section className="col-span-12 lg:col-span-9">
            {isLoading ? (
              <SkeletonLoader />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listToRender.map(
                  (cur) =>
                    isVisible(cur) && (
                      <VehicleCard
                        key={
                          cur._id ??
                          cur.id ??
                          cur?.__raw?._id ??
                          JSON.stringify(cur).slice(0, 8)
                        }
                        cur={cur}
                        dispatch={dispatch}
                        navigate={navigate}
                        bookingData={selectedData} // ✅ Pass booking data down
                      />
                    )
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footers />
    </div>
  );
};

export default Vehicles;
