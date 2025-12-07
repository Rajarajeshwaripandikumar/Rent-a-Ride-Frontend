import { useDispatch } from "react-redux";
import { toggleNavbarPage } from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";

const CartHead = () => {
  const dispatch = useDispatch();

  return (
    <div
      className="
        absolute top-0 right-0
        w-[260px]
        bg-white
        rounded-2xl
        border border-gray-200
        shadow-lg
        p-5
        select-none
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-[#1D4ED8] font-semibold">
            Cart Items
          </span>

          <p className="font-semibold text-slate-800 text-sm leading-tight">
            Cart
          </p>
        </div>

        <button
          onClick={() => dispatch(toggleNavbarPage("cart"))}
          className="
            h-7 w-7 
            flex items-center justify-center
            rounded-full
            text-gray-500
            hover:bg-gray-100 
            hover:text-red-500
            transition-all
          "
        >
          ×
        </button>
      </div>

      {/* CART ITEMS */}
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-slate-800">Toyota</div>
        <div className="text-sm font-medium text-slate-800">Toyota</div>
        <div className="text-sm font-medium text-slate-800">Toyota</div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          className="
            w-full text-left text-[13px]
            text-blue-600 font-medium
            hover:text-blue-700 hover:bg-blue-50
            rounded-lg px-2 py-2 transition
          "
        >
          View full cart
        </button>
      </div>
    </div>
  );
};

export default CartHead;
