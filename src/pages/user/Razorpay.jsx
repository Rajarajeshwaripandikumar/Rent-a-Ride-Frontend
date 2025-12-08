// src/pages/user/Razorpay.jsx
import { toast } from "sonner";
import {
  setLatestBooking,
  setisPaymentDone,
} from "../../redux/user/LatestBookingsSlice";
import { setIsSweetAlert, setPageLoading } from "../../redux/user/userSlice";
import { api } from "../../../api"; // ✅ use central API helper

/* ------------------  LOAD SCRIPT  ------------------ */
export function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ------------------  FETCH LATEST BOOKING  ------------------ */
export const fetchLatestBooking = async (user_id, dispatch) => {
  try {
    const data = await api.post("/api/user/latestbookings", { user_id });

    if (!data) return null;

    dispatch(setLatestBooking(data));
    dispatch(setisPaymentDone(true));
    return data;
  } catch (err) {
    // optional: console.error("fetchLatestBooking error", err);
    return null;
  }
};

/* ------------------  MAIN PAYMENT FUNCTION  ------------------ */
export async function displayRazorpay(values = {}, navigate, dispatch) {
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!RAZORPAY_KEY_ID) {
    toast.error("Payment gateway missing. Contact support.");
    return { ok: false };
  }

  try {
    dispatch(setPageLoading(true));

    const sdkLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!sdkLoaded) {
      dispatch(setPageLoading(false));
      toast.error("Failed to load payment gateway.");
      return { ok: false };
    }

    // ✅ Use shared api helper instead of manual fetch
    let data = null;
    try {
      data = await api.post("/api/user/razorpay", values);
    } catch (err) {
      dispatch(setPageLoading(false));
      toast.error("Failed to initiate payment.");
      return { ok: false };
    }

    if (!data || !data.ok) {
      dispatch(setPageLoading(false));
      toast.error("Payment creation error.");
      return { ok: false };
    }

    const { amount, id: orderId, currency } = data;

    /* ------------------  Razorpay Checkout Options  ------------------ */
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: String(amount),
      currency: currency || "INR",
      name: "Rent a Ride",
      description: "Booking Payment",
      order_id: orderId,

      /* Cinema-style color theme */
      theme: {
        color: "#3B82F6", // soft cinema blue
      },

      /* Prefill user details */
      prefill: {
        name: values.name || "",
        email: values.email || "",
        contact: values.phoneNumber || "",
      },

      /* Payment Success Handler */
      handler: async function (response) {
        try {
          const paymentPayload = {
            ...values,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          // ✅ Use api helper for booking call
          try {
            await api.post("/api/user/bookCar", paymentPayload);
          } catch (err) {
            dispatch(setPageLoading(false));
            toast.error("Payment succeeded but booking failed.");
            return;
          }

          dispatch(setIsSweetAlert(true));
          await fetchLatestBooking(values.user_id, dispatch);

          if (navigate) navigate("/");

          dispatch(setPageLoading(false));
          toast.success("Payment successful!");
        } catch (err) {
          dispatch(setPageLoading(false));
          toast.error("Error completing payment.");
        }
      },

      /* User closed payment popup */
      modal: {
        ondismiss: () => {
          dispatch(setPageLoading(false));
          toast.error("Payment cancelled.");
        },
      },
    };

    /* ------------------  Open Razorpay Widget  ------------------ */
    const paymentObject = new window.Razorpay(options);

    paymentObject.on?.("payment.failed", () => {
      dispatch(setPageLoading(false));
      toast.error("Payment failed. Try again.");
    });

    paymentObject.open();
    return { ok: true };
  } catch (error) {
    dispatch(setPageLoading(false));
    toast.error("Payment error occurred.");
    return { ok: false };
  }
}

/* ------------------  Placeholder Component (UI ONLY)  ------------------ */
const Razorpay = () => {
  return (
    <div className="w-full flex justify-center py-20 text-[#6B7280] text-sm">
      Initializing payment gateway...
    </div>
  );
};

export default Razorpay;
