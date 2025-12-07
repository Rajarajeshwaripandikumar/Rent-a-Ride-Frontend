import { MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { links } from "../data/SidebarContents.jsx";
import { CiLogout } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../../../redux/user/userSlice.jsx";
import { showSidebarOrNot } from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice.jsx";

const SideBar = () => {
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

  // hide Charts section + any Color Picker link
  const visibleSections = links
    .filter((section) => (section.title || "").toLowerCase() !== "charts")
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => {
        const normalized = (link.name || "")
          .toLowerCase()
          .replace(/[\s-]/g, "");
        return normalized !== "colorpicker";
      }),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <div className="h-full overflow-auto md:hover:overflow-auto pb-6">
      <aside className="h-full bg-white px-4 pt-4 pb-6 flex flex-col">
        {/* ----------- TOP BRAND ----------- */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/adminDashboard" className="block">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800 leading-tight">
                Rent a Ride
              </span>
            </div>
          </Link>

          <TooltipComponent content="Close menu" position="BottomCenter">
            <button
              aria-label="Close sidebar"
              className="text-xl p-2 rounded-full hover:bg-gray-100 transition md:hidden"
              onClick={() => dispatch(showSidebarOrNot(false))}
            >
              <MdOutlineCancel className="text-gray-700" />
            </button>
          </TooltipComponent>
        </div>

        {/* ----------- NAV LINKS ----------- */}
        <div className="mt-2 flex-1">
          {visibleSections.map((section, idx) => (
            <div key={idx} className="mb-3">
              {section.title && (
                <p className="px-3 text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-[0.16em]">
                  {section.title}
                </p>
              )}

              {section.links.map((link) => (
                <NavLink
                  to={`/adminDashboard/${link.name}`}
                  key={link.name}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    if (screenSize <= 900 && activeMenu) {
                      dispatch(showSidebarOrNot(false));
                    }
                  }}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="capitalize">{link.name}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {/* ----------- FOOTER SIGNOUT ----------- */}
          <div className="mt-6 pt-4 border-t border-gray-200 px-2 flex flex-col gap-3">
            <button
              onClick={handleSignout}
              aria-label="Sign out"
              className="
                flex items-center gap-2
                text-sm
                text-red-500
                font-medium
                hover:text-red-600
                hover:bg-red-50
                rounded-lg
                px-3 py-2
                transition
              "
            >
              <CiLogout className="text-lg" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
