import PropTypes from "prop-types";
import { addVehicleClicked } from "../../../redux/adminSlices/actions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const VendorHeader = ({ category, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Vendor add Vehicle
  const handleAddVehicle = () => {
    dispatch(addVehicleClicked(true));
    navigate("/vendorDashboard/vendorAddProduct");
  };

  return (
    <div className="mb-10 flex justify-between items-center select-none">
      {/* LEFT TEXT */}
      <div>
        {category && (
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            {category}
          </p>
        )}

        <p className="text-slate-900 text-3xl font-bold leading-tight mt-1">
          {title}
        </p>
      </div>

      {/* ADD BUTTON — same vibe as admin Header */}
      <button
        onClick={handleAddVehicle}
        className="
          inline-flex items-center gap-2
          px-5 py-2.5
          bg-[#2563EB]
          text-white text-sm font-semibold
          rounded-xl
          border border-[#1E40AF]
          shadow-sm
          hover:bg-[#1D4ED8]
          hover:shadow-md
          active:scale-[0.98]
          transition-all duration-200
        "
      >
        <span className="text-base font-bold">+</span>
        Add
      </button>
    </div>
  );
};

VendorHeader.propTypes = {
  category: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default VendorHeader;
