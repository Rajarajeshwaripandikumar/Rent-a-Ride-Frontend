import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOut,
} from "../redux/user/userSlice";

import { links } from "./UserSidebarContent";
import { CiLogout } from "react-icons/ci";
import SidebarHeader from "./SidebarHeader";

const UserProfileSidebar = () => {
  const { currentUser, isLoading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------- ACTIVE & NORMAL LINK STYLES ---------- */
  const activeLink =
    "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] m-2 shadow-sm";

  const normalLink =
    "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 m-2 transition";

  /* ---------- SAFE JSON PARSER ---------- */
  const parseResponseSafely = async (res) => {
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return await res.json();
      const t = await res.text();
      try {
        return JSON.parse(t);
      } catch {
        return t || null;
      }
    } catch {
      return null;
    }
  };

  /* ---------- SIGNOUT ---------- */
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/admin/signout", {
        method: "GET",
        credentials: "include",
      });

      const data = await parseResponseSafely(res);

      if (!res.ok) {
        console.error("Signout failed:", data);
        return;
      }

      dispatch(signOut());
      navigate("/signin");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  /* ---------- DELETE ACCOUNT ---------- */
  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await parseResponseSafely(res);

      if (!res.ok) {
        dispatch(deleteUserFailure(data));
        return;
      }

      dispatch(deleteUserSuccess(data));
      dispatch(signOut());
      navigate("/signin");
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };

  /* ==================================================================== */

  return (
    <div className="ml-2 md:ml-3 h-screen overflow-auto pb-6">
      {/* ----------- SIDEBAR BOX (always visible) ----------- */}
      <div
        className="
          h-full bg-white rounded-2xl shadow-md border border-gray-200
          px-4 pt-4 pb-6 flex flex-col
        "
      >
        {/* ----------- BRAND HEADER (NO X BUTTON) ----------- */}
        <div className="flex justify-start items-center mb-6">
          <SidebarHeader />
        </div>

        {/* ----------- SECTION TITLE ----------- */}
        <div className="px-2 mb-2">
          <span className="text-[11px] uppercase tracking-wide text-gray-500">
            Profile Menu
          </span>
        </div>

        {/* ----------- NAV LINKS ----------- */}
        <div className="mt-2 flex-1">
          {links.map((section, idx) => (
            <div key={idx} className="mb-1">
              {section.links.map((link) => (
                <NavLink
                  to={`/profile/${link.name}`}
                  key={link.name}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="capitalize">{link.name}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {/* ----------- SIGN OUT + DELETE ACCOUNT ----------- */}
          <div className="mt-8 pt-4 border-t border-gray-200 px-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSignout}
              className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600"
            >
              <CiLogout className="text-lg" /> Sign Out
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="text-red-500 text-sm font-medium hover:text-red-600"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSidebar;
