import { MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { links } from "../data/vendorSidebarContents.jsx";
import { CiLogout } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../../../redux/user/userSlice.jsx";
import { showSidebarOrNot } from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice.jsx";

const VendorSidebar = () => {
  const { activeMenu, screenSize } = useSelector(
    (state) => state.adminDashboardSlice
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activeLink =
    "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] m-2 shadow-sm";

  const normalLink =
    "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 m-2 transition";

  const handleSignout = async () => {
    const res = await fetch("/api/admin/signout", { method: "GET" });
    const data = await res.json();
    if (data) {
      dispatch(signOut());
      navigate("/signin");
    }
  };

  if (!activeMenu) return null;

  return (
    <div className="ml-2 md:ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-6">
      <aside
        className="
          h-full bg-white rounded-2xl shadow-md border border-gray-200
          px-4 pt-4 pb-6 flex flex-col
        "
      >
        {/* ----------- TEXT-ONLY HEADER (NO LOGO / NO ICON) ----------- */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/vendorDashboard"
            className="group flex flex-col gap-0.5"
          >
            
            <span className="text-[18px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Vendor Dashboard
            </span>
            <span className="h-0.5 w-8 mt-1 rounded-full bg-blue-500 group-hover:w-12 transition-all duration-200" />
          </Link>

          <TooltipComponent content="Close menu" position="BottomCenter">
            <button
              className="text-xl p-2 rounded-full hover:bg-gray-100 md:hidden"
              onClick={() => dispatch(showSidebarOrNot(false))}
            >
              <MdOutlineCancel className="text-gray-700" />
            </button>
          </TooltipComponent>
        </div>

        

        {/* ----------- NAV LINKS ----------- */}
        <div className="mt-2 flex-1">
          {links.map((cur, idx) => (
            <div key={idx} className="mb-3">
              {cur.title && (
                <p className="px-3 text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-[0.16em]">
                  {cur.title}
                </p>
              )}

              {cur.links.map((link) => (
                <NavLink
                  to={`/vendorDashboard/${link.name}`}
                  key={link.name}
                  onClick={() => {
                    if (screenSize <= 900 && activeMenu) {
                      dispatch(showSidebarOrNot(false));
                    }
                  }}
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

          {/* ----------- SIGN OUT ----------- */}
          <div className="mt-6 pt-4 border-t border-gray-200 px-2 flex flex-col gap-3">
            <button
              type="button"
              className="
                flex items-center gap-2
                text-sm text-red-500 font-medium
                hover:text-red-600 hover:bg-red-50
                rounded-lg px-3 py-2 transition
              "
              onClick={handleSignout}
            >
              <CiLogout className="text-lg" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default VendorSidebar;
