import { useSelector, useDispatch } from "react-redux";
import UserProfileSidebar from "../../components/UserProfileSidebar";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Link, Route, Routes } from "react-router-dom";
import Orders from "./Orders";
import UserProfileContent from "../../components/UserProfileContent";
import Favorites from "./Favorites";
import { IoArrowBackCircleSharp, IoMenu } from "react-icons/io5";
import { showSidebarOrNot } from "../../redux/adminSlices/adminDashboardSlice/DashboardSlice";

function Profile() {
  const { isError } = useSelector((state) => state.user || {});
  const { activeMenu } = useSelector(
    (state) => state.adminDashboardSlice || {}
  );
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      {/* top-right back button */}
      <div className="fixed top-4 right-5 md:right-10 z-50">
        <TooltipComponent content={"Back to home"} position="BottomCenter">
          <Link to={"/"}>
            <div className="inline-flex items-center justify-center rounded-full bg-white shadow-md border border-[#E5E7EB] p-1 hover:bg-[#EFF5FF] transition-colors">
              <IoArrowBackCircleSharp
                style={{ fontSize: 34 }}
                className="text-[#2563EB]"
              />
            </div>
          </Link>
        </TooltipComponent>
      </div>

      {/* layout */}
      <div className="flex flex-1 relative">
        {/* Sidebar - fixed when active */}
        {activeMenu ? (
          <aside className="hidden sm:block w-72 bg-white fixed left-0 top-0 h-full border-r border-[#E5E7EB] shadow-md z-40">
            <UserProfileSidebar />
          </aside>
        ) : (
          <aside className="w-0">
            {/* keep markup for accessibility */}
            <UserProfileSidebar />
          </aside>
        )}

        {/* Mobile hamburger when sidebar hidden */}
        {!activeMenu && (
          <div className="fixed top-4 left-4 z-50 sm:hidden">
            <TooltipComponent content={"Menu"} position="BottomCenter">
              <button
                className="
                  text-xl
                  rounded-full
                  p-2.5
                  bg-white
                  shadow-md
                  border border-[#E5E7EB]
                  hover:bg-[#EFF5FF]
                  text-[#2563EB]
                  transition-colors
                "
                onClick={() => dispatch(showSidebarOrNot(true))}
              >
                <IoMenu />
              </button>
            </TooltipComponent>
          </div>
        )}

        {/* Main content area */}
        <main
          className={`flex-grow w-full transition-all duration-200 ${
            activeMenu ? "sm:ml-72" : ""
          }`}
        >
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* error banner */}
            {isError?.message && (
              <div className="mb-4">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {isError.message}
                </div>
              </div>
            )}

            {/* main card */}
            <div
              className="
                bg-white
                rounded-2xl
                border border-[#E5E7EB]
                shadow-md
                p-4 sm:p-6 lg:p-8
              "
            >
              <div className="main_section">
                <Routes>
                  <Route path="/" element={<UserProfileContent />} />
                  <Route path="/profiles" element={<UserProfileContent />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Routes>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* if you add Footers here later, it will sit nicely below */}
    </div>
  );
}

export default Profile;
