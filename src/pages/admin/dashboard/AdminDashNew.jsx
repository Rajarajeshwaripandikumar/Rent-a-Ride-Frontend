// src/layout/AdminDashNew.jsx
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

import { Navbar, SideBar } from "../components";

import {
  AllVehicles,
  AllUsers,
  AllVendors,
  Calender,
  Customers,
  Editor,
  VenderVehicleRequests,
  Employees,
  Kanban,
} from "../pages";

import AdminHomeMain from "../pages/AdminHomeMain";
import Bookings from "../components/Bookings";

// ⭐ ADMIN ONLY PROFILE EDIT
// if your file is at src/pages/admin/pages/ProfileEditAdmin.jsx:
import ProfileEditAdmin from "../pages/ProfileEditAdmin";

function AdminDashNew() {
  const { activeMenu } =
    useSelector((state) => state.adminDashboardSlice || {}) || {};

  // logged-in admin only
  const { currentUser } = useSelector((state) => state.user || {});
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/signin");
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <div className="flex flex-1">
        {activeMenu && (
          <aside className="w-72 bg-white border-r border-gray-200 shadow-sm hidden md:block">
            <SideBar />
          </aside>
        )}

        <div className="flex flex-col flex-1 min-h-full">
          {/* ⭐ ADMIN HEADER WITH RIGHT-ALIGNED PROFILE */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
              {/* LEFT: navbar takes full width */}
              <div className="flex-1">
                <Navbar />
              </div>

              {/* RIGHT: ADMIN INFO + EDIT BUTTON */}
              {currentUser && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-[#111827]">
                      {currentUser.username || "Admin"}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {currentUser.email}
                    </span>
                  </div>

                  {currentUser.profilePicture && (
                    <img
                      src={currentUser.profilePicture}
                      alt="Admin avatar"
                      className="h-9 w-9 rounded-full object-cover border border-gray-200 hidden sm:block"
                    />
                  )}

                  {/* ✏️ Edit Profile Modal trigger */}
                  <ProfileEditAdmin />
                </div>
              )}
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 md:p-6 min-h-[360px]">
                <Routes>
                  <Route index element={<AdminHomeMain />} />
                  <Route path="adminHome" element={<AdminHomeMain />} />
                  <Route path="allProduct" element={<AllVehicles />} />
                  <Route path="allUsers" element={<AllUsers />} />
                  <Route path="allVendors" element={<AllVendors />} />
                  <Route path="calendar" element={<Calender />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="editor" element={<Editor />} />
                  <Route
                    path="vendorVehicleRequests"
                    element={<VenderVehicleRequests />}
                  />
                  <Route path="orders" element={<Bookings />} />
                  <Route path="kanban" element={<Kanban />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>

      <footer className="bg-slate-50 border-t border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto text-[11px] md:text-xs text-slate-500 text-right">
          © {new Date().getFullYear()} Tejasvi
        </div>
      </footer>
    </div>
  );
}

export default AdminDashNew;
