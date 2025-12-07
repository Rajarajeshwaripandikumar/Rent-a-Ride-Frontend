// src/pages/contact/Contact.jsx
import Footers from "../../components/Footer";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { useState } from "react";
import { MdPhone, MdEmail } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";

/* Optional: API helper - adjust endpoint to your backend */
async function sendContactMessage(payload) {
  try {
    const res = await fetch("/api/contact/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => null);
      return { ok: false, message: text || "Failed to send message" };
    }
    const json = await res.json().catch(() => ({}));
    return { ok: true, payload: json };
  } catch (err) {
    console.error("sendContactMessage error:", err);
    return { ok: false, message: err?.message || "Network error" };
  }
}

const schema = z.object({
  name: z.string().min(2, { message: "Name required" }),
  email: z
    .string()
    .min(1, { message: "Email required" })
    .refine((v) => /\S+@\S+\.\S+/.test(v), { message: "Invalid email" }),
  phone: z
    .string()
    .min(8, { message: "Phone required (min 8 digits)" })
    .refine((v) => /^\d+$/.test(v), { message: "Phone must be numeric" }),
  message: z.string().min(5, { message: "Please enter a message" }),
});

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const payload = {
      ...values,
      createdAt: new Date().toISOString(),
    };
    const resp = await sendContactMessage(payload);
    if (resp.ok) {
      toast.success("Message sent — we'll contact you shortly.");
      reset();
    } else {
      toast.error(resp.message || "Failed to send message");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        {/* Main content */}
        <main className="flex-grow w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-16">
          {/* Header */}
          <div className="w-full flex flex-col items-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3 text-center">
              Contact Us
            </h1>

            <p className="max-w-2xl text-center text-[#6B7280] text-sm sm:text-base">
              Have questions? Want to rent a vehicle? Need help with your booking?
              We're always here to assist you.
            </p>
          </div>

          {/* Content grid */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT FORM */}
            <div
              className="
                pt-6
                rounded-2xl
                border border-[#E5E7EB]
                shadow-md
                px-4 py-6 sm:px-6
                bg-white
                flex flex-col
              "
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-1">
                Send a Message
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mb-4">
                We'll get back to you within 24 hours.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div>
                  <TextField
                    id="name"
                    label="Your Name"
                    variant="outlined"
                    fullWidth
                    {...register("name")}
                    defaultValue=""
                    size="small"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <TextField
                    id="email"
                    label="Email Address"
                    variant="outlined"
                    fullWidth
                    {...register("email")}
                    defaultValue=""
                    size="small"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <TextField
                    id="phone"
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    {...register("phone")}
                    defaultValue=""
                    size="small"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <TextField
                    id="message"
                    label="Message"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    {...register("message")}
                    defaultValue=""
                  />
                  {errors.message && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-3 mb-2 w-full rounded-full px-6 py-3 text-sm sm:text-base font-medium transition-colors ${
                      isSubmitting
                        ? "bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                        : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                    }`}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT INFO */}
            <div
              className="
                pt-6
                rounded-2xl
                border border-[#E5E7EB]
                shadow-md
                px-4 py-6 sm:px-6
                bg-white
                flex flex-col
              "
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-1">
                Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mb-4">
                Reach out using phone, email, or visit us.
              </p>

              <ul className="text-[#374151] space-y-3 text-sm sm:text-base">
                <li className="flex items-center gap-2">
                  <MdPhone className="text-[#2563EB] text-lg" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-1 text-[#4B5563]">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <MdEmail className="text-[#2563EB] text-lg" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-1 text-[#4B5563]">
                    support@rentaride.com
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CiLocationOn className="text-[#2563EB] text-xl" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-1 text-[#4B5563]">
                    Chennai, Tamil Nadu, India
                  </span>
                </li>
              </ul>

              <iframe
                className="w-full h-56 rounded-2xl mt-6 border border-[#E5E7EB]"
                src="https://maps.google.com/maps?q=chennai&t=&z=13&ie=UTF8&iwloc=&output=embed"
                title="Chennai map"
              ></iframe>
            </div>
          </div>
        </main>

        {/* Footer placed after main so it flows naturally */}
        <Footers />
      </div>
    </>
  );
}

export default Contact;
