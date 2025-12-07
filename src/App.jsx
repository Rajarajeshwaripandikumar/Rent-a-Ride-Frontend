// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

// user pages
import Home from "./pages/user/Home";
import SignUp from "./pages/user/SignUp";
import SignIn from "./pages/user/SignIn";
import Vehicles from "./pages/user/Vehicles";
import Profile from "./pages/user/Profile";
import Enterprise from "./pages/user/Enterprise";
import Contact from "./pages/user/Contact";
import VehicleDetails from "./pages/user/VehicleDetails";
import Orders from "./pages/user/Orders";
import AvailableVehicles from "./pages/user/AvailableVehiclesAfterSearch";
import CheckoutPage from "./pages/user/CheckoutPage";
import Razorpay from "./pages/user/Razorpay";
import AllVehiclesofSameModel from "./pages/user/AllVehiclesofSameModel";
import CarNotFound from "./pages/user/CarNotFound";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";

// layout
import With_nav from "./components/Layout/WithNav";

// auth / route guards
import PrivateRoute, { PrivateSignin } from "./components/PrivateRoute";
import AdminPrivateRoutes from "./components/AdminPrivateRoutes";
import VendorPrivateRoute from "./components/VendorPrivateRoute";

// vendor
import VendorSignin from "./pages/vendor/pages/VendorSignin";
import VendorSignup from "./pages/vendor/pages/VendorSignup";
import VendorDashboard from "./pages/vendor/Dashboard/VendorDashboard";
import VendorEditProductComponent from "./pages/vendor/Components/VendorEditProductComponent";
import VendorDeleteVehicleModal from "./pages/vendor/Components/VendorDeleteVehicleModal";
import VendorAddProductModal from "./pages/vendor/Components/VendorAddVehilceModal";

// admin
import Layout from "./pages/admin/layouts/Layout";
import AdminDashNew from "./pages/admin/dashboard/AdminDashNew";
import EditProductComponent from "./pages/admin/components/EditProductComponent";
import AddProductModal from "./pages/admin/components/AddProductModal";
import AdminSignin from "./pages/admin/AdminSignin"; // 👈 import this
import Employees from "./components/Employees";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with Navbar */}
        <Route element={<With_nav />}>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/contact" element={<Contact />} />
          
        </Route>

        {/* Public reset password routes */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password/:token/:id" element={<ResetPassword />} />

        {/* Auth routes (no navbar, blocked if already logged in) */}
        <Route element={<PrivateSignin />}>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/vendorSignin" element={<VendorSignin />} />
          <Route path="/vendorSignup" element={<VendorSignup />} />

          {/* 🔥 Admin login is PUBLIC auth route, not private admin route */}
          <Route path="/adminSignin" element={<AdminSignin />} />
        </Route>

        {/* User private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile/*" element={<Profile />} />
          <Route path="/allVariants" element={<AllVehiclesofSameModel />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/checkoutPage" element={<CheckoutPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/availableVehicles" element={<AvailableVehicles />} />
          <Route path="/razorpay" element={<Razorpay />} />
        </Route>

        {/* Vendor private routes */}
        <Route element={<VendorPrivateRoute />}>
          <Route path="/vendorDashboard/*" element={<VendorDashboard />} />
          <Route
            path="/vendorDashboard/vendorEditProductComponent"
            element={<VendorEditProductComponent />}
          />
          <Route
            path="/vendorDashboard/vendorDeleteVehicleModal"
            element={<VendorDeleteVehicleModal />}
          />
          <Route
            path="/vendorDashboard/vendorAddProduct"
            element={<VendorAddProductModal />}
          />
        </Route>

        {/* Admin private routes */}
        <Route element={<AdminPrivateRoutes />}>
          <Route element={<Layout />}>
            <Route path="/adminDashboard/*" element={<AdminDashNew />} />
            <Route path="employees" element={<Employees />} /> 
            <Route
              path="/adminDashboard/editProducts"
              element={<EditProductComponent />}
            />
            <Route
              path="/adminDashboard/addProducts"
              element={<AddProductModal />}
            />
          </Route>
        </Route>

        {/* 404 fallback — keep LAST */}
        <Route path="*" element={<CarNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
