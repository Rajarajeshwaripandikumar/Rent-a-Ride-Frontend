// src/pages/user/Razorpay.jsx
import { toast } from "sonner";
import {
  setLatestBooking,
  setisPaymentDone,
} from "../../redux/user/LatestBookingsSlice";
import { setIsSweetAlert, setPageLoading } from "../../redux/user/userSlice";

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
    const API_BASE_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_URL || ""
        : import.meta.env.VITE_API_URL || "";

    const res = await fetch(`${API_BASE_URL}/api/user/latestbookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json().catch(() => null);
    if (!data) return null;

    dispatch(setLatestBooking(data));
    dispatch(setisPaymentDone(true));
    return data;
  } catch {
    return null;
  }
};

/* ------------------  MAIN PAYMENT FUNCTION  ------------------ */
export async function displayRazorpay(values = {}, navigate, dispatch) {
  const API_BASE_URL =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_URL || ""
      : import.meta.env.VITE_API_URL || "";

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!RAZORPAY_KEY_ID) {
    toast.error("Payment gateway missing. Contact support.");
    return { ok: false };
  }

  try {
    dispatch(setPageLoading(true));

    const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!sdkLoaded) {
      dispatch(setPageLoading(false));
      toast.error("Failed to load payment gateway.");
      return { ok: false };
    }

    const accessToken = localStorage.getItem("accessToken");

    const result = await fetch(`${API_BASE_URL}/api/user/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    if (!result.ok) {
      dispatch(setPageLoading(false));
      toast.error("Failed to initiate payment.");
      return { ok: false };
    }

    const data = await result.json().catch(() => null);
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

          const bookRes = await fetch(`${API_BASE_URL}/api/user/bookCar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify(paymentPayload),
          });

          if (!bookRes.ok) {
            dispatch(setPageLoading(false));
            toast.error("Payment succeeded but booking failed.");
            return;
          }

          const success = await bookRes.json().catch(() => null);

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
