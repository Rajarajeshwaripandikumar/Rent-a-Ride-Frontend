import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setVendorDeleteSuccess } from "../../../redux/vendor/vendorDashboardSlice";

const VendorDeleteVehicleModal = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicle_id = queryParams.get("vehicle_id");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // delete a vehicle
  const vendorHandleDelete = async () => {
    try {
      const res = await fetch(
        `/api/vendor/vendorDeleteVehicles/${vehicle_id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        console.log("something went wrong");
        return;
      }
      if (res.ok) {
        dispatch(setVendorDeleteSuccess(true));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-900/40
        backdrop-blur-sm
        px-4
      "
    >
      <div
        id="popup-modal"
        tabIndex="-1"
        className="w-full max-w-md"
      >
        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl">
          {/* Close button */}
          <button
            type="button"
            className="
              absolute top-3 right-3
              text-gray-400
              bg-white
              hover:bg-gray-100
              hover:text-gray-700
              rounded-full
              text-sm
              w-8 h-8
              flex justify-center items-center
              border border-gray-200
              transition
            "
            data-modal-hide="popup-modal"
            onClick={() => {
              navigate("/vendorDashboard/vendorAllVeihcles");
            }}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>

          {/* Content */}
          <div className="p-5 md:p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div
                className="
                  inline-flex items-center justify-center
                  w-12 h-12
                  rounded-full
                  bg-red-50
                  border border-red-100
                "
              >
                <svg
                  className="w-6 h-6 text-red-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete vehicle?
            </h3>
            <p className="mb-5 text-sm text-gray-500">
              Are you sure you want to delete this vehicle? This action cannot
              be undone.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                data-modal-hide="popup-modal"
                type="button"
                className="
                  inline-flex items-center justify-center
                  text-sm font-semibold
                  text-white
                  bg-red-600
                  hover:bg-red-700
                  focus:outline-none
                  focus:ring-2 focus:ring-red-300
                  rounded-full
                  px-5 py-2.5
                  transition
                "
                onClick={() => {
                  navigate("/vendorDashboard/vendorAllVeihcles");
                  vendorHandleDelete(vehicle_id);
                }}
              >
                Yes, I&apos;m sure
              </button>

              <button
                data-modal-hide="popup-modal"
                type="button"
                className="
                  inline-flex items-center justify-center
                  text-sm font-medium
                  text-gray-700
                  bg-white
                  border border-gray-300
                  hover:bg-gray-50
                  hover:text-gray-900
                  focus:outline-none
                  focus:ring-2 focus:ring-gray-200
                  rounded-full
                  px-5 py-2.5
                  transition
                "
                onClick={() =>
                  navigate("/vendorDashboard/vendorAllVeihcles")
                }
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDeleteVehicleModal;
