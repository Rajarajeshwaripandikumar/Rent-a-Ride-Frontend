import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setScreenSize,
  showSidebarOrNot,
} from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { screenSize } = useSelector(
    (state) => state.adminDashboardSlice
  );

  // Track screen size
  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth));
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // Show / hide sidebar based on screen size
  useEffect(() => {
    if (screenSize <= 900) {
      dispatch(showSidebarOrNot(false));
    } else {
      dispatch(showSidebarOrNot(true));
    }
  }, [screenSize, dispatch]);

};

export default Navbar;
