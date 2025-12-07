import PropTypes from "prop-types";
import { addVehicleClicked } from "../../../redux/adminSlices/actions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Header = ({ category, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddVehicle = () => {
    dispatch(addVehicleClicked(true));
    navigate("/adminDashboard/addProducts");
  };

  return (
    <div className="mb-10 flex items-center justify-between select-none">
      {/* LEFT TEXT */}
      <div>
        {category && (
          <span
            className="
              inline-block 
              px-2 py-[3px]
              text-[11px] font-semibold uppercase tracking-wide
              text-[#1D4ED8]
              bg-[#EFF6FF]
              border border-[#BFDBFE]
              rounded-md
            "
          >
            {category}
          </span>
        )}

        <p className="text-slate-900 text-2xl md:text-3xl font-bold leading-tight mt-2">
          {title}
        </p>
      </div>

      {/* ADD BUTTON — Walmart × Cinema Styled */}
      <button
        onClick={handleAddVehicle}
        className="
          inline-flex items-center gap-2
          px-5 py-2.5
          bg-[#0071DC]
          text-white text-sm font-semibold
          rounded-xl
          border border-[#0654BA]
          shadow-sm
          hover:bg-[#0654BA]
          hover:shadow-md
          active:scale-[0.98]
          transition-all duration-200
        "
      >
        <span className="text-lg font-bold leading-none">+</span>
        Add
      </button>
    </div>
  );
};

Header.propTypes = {
  category: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default Header;
