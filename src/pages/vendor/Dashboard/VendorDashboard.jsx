import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import VendorHomeMain from "../pages/VendorHomeMain";
import VendorAllVehicles from "../pages/VendorAllVehicles";
import VendorSidebar from "../Components/VendorSidebar";
import VendorBookings from "../Components/VendorBookings";

// ⭐ vendor profile edit modal
import ProfileEditVendor from "../pages/ProfileEditVendor";

function VendorDashboard() {
  const { activeMenu } = useSelector((state) => state.adminDashboardSlice || {});
  const { currentUser } = useSelector((state) => state.user || {});

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex relative">
      {/* Floating Settings FAB */}
      <div className="fixed right-6 bottom-6 z-[1000]">
        <TooltipComponent content="Settings" position="Top">
          <button
            type="button"
            className="
              shadow-md
              flex items-center justify-center
              text-2xl
              p-3
              rounded-full
              bg-[#0071DC]
              text-white
              hover:shadow-lg
              hover:scale-105
              active:scale-100
              transition-transform
              duration-150
            "
          >
            <FiSettings />
          </button>
        </TooltipComponent>
      </div>

      {/* Sidebar */}
      {activeMenu ? (
        <div className="w-72 fixed inset-y-0 left-0 z-40">
          <div className="h-full bg-white border-r border-slate-200 shadow-md">
            <VendorSidebar />
          </div>
        </div>
      ) : (
        <div className="w-0">
          <VendorSidebar />
        </div>
      )}

      {/* Main Layout */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          activeMenu ? "md:ml-72" : "ml-0"
        }`}
      >
        {/* Main Content Shell */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-10 md:pt-8">
          <div className="border border-slate-200 rounded-2xl bg-white shadow-md overflow-hidden">
            {/* Header strip */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold uppercase tracking-wide border border-yellow-300 rounded-md bg-[#FFEFB5] text-slate-800">
                  Vendor Panel
                </span>
              </div>

              {/* ⭐ RIGHT SIDE: vendor info + edit button */}
              {currentUser && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-800">
                      {currentUser.username || "Vendor"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {currentUser.email}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Role: <span className="font-semibold text-slate-700">Vendor</span>
                    </span>
                  </div>

                  {currentUser.profilePicture && (
                    <img
                      src={currentUser.profilePicture}
                      alt="Vendor avatar"
                      className="h-9 w-9 rounded-full object-cover border border-gray-200"
                    />
                  )}

                  {/* ✏️ opens ProfileEditVendor modal */}
                  <ProfileEditVendor />
                </div>
              )}
            </div>

            {/* Inner page area where routes render */}
            <div className="bg-[#F5F7FB]">
              <div className="px-4 md:px-6 py-4 md:py-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-6">
                  <div></div>
                  <div className="flex flex-wrap items-center gap-2"></div>
                </div>

                <div className="border border-slate-200 rounded-xl bg-white p-3 md:p-4 min-h-[320px] shadow-sm">
                  <Routes>
                    <Route path="/" element={<VendorHomeMain />} />
                    <Route path="/adminHome" element={<VendorHomeMain />} />
                    <Route
                      path="/vendorAllVeihcles"
                      element={<VendorAllVehicles />}
                    />
                    <Route path="/bookings" element={<VendorBookings />} />
                  </Routes>
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-[11px] md:text-xs text-slate-500">
              <span>© {new Date().getFullYear()} Tejasvi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;
