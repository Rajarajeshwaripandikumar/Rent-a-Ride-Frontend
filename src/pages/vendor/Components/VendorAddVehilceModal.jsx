// VendorAddProductModal.jsx
import { useDispatch, useSelector } from "react-redux";
import { addVehicleClicked } from "../../../redux/adminSlices/actions";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { MenuItem } from "@mui/material";
import { fetchModelData } from "../../admin/components/AddProductModal";
import { useEffect } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { IoMdClose } from "react-icons/io";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

/* ✅ Seeded car types (value used in backend, label shown in UI) */
const CAR_TYPE_OPTIONS = [
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "muv", label: "MUV" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Convertible" },
  { value: "pickup", label: "Pickup" },
  { value: "van", label: "Van" },
  { value: "mini", label: "Mini" },
  { value: "luxury", label: "Luxury" },
];

const VendorAddProductModal = () => {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      registeration_number: "",
      company: "",
      name: "",
      model: "",
      title: "",
      base_package: "",
      price: "",
      description: "",
      year_made: "",
      fuelType: "",
      carType: "",
      Seats: "",
      transmitionType: "",
      vehicleLocation: "",
      vehicleDistrict: "",
      insurance_end_date: null,
      registeration_end_date: null,
      polution_end_date: null,
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    modelData = [],
    companyData = [], // still fetched, but no longer used as dropdown
    locationData = [],
    districtData = [],
  } = useSelector((state) => state.modelDataSlice || {});
  const currentUser = useSelector((state) => state.user.currentUser);
  const _id = currentUser?._id; // ✅ safe

  useEffect(() => {
    fetchModelData(dispatch);
  }, [dispatch]);

  // helper to append files from FileList
  const appendFiles = (fileList, fieldName, formData) => {
    if (!fileList) return;
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f && f.size) formData.append(fieldName, f);
    }
  };

  const onSubmit = async (addData) => {
    try {
      const formData = new FormData();

      // IMPORTANT: use lowercase keys exactly as backend expects
      formData.append(
        "registeration_number",
        addData.registeration_number || ""
      );
      formData.append("company", addData.company || "");
      formData.append("name", addData.name || "");
      formData.append("model", addData.model || "");
      formData.append("title", addData.title || "");
      formData.append("base_package", addData.base_package || "");
      formData.append("price", addData.price || "");
      formData.append("description", addData.description || "");
      formData.append("year_made", addData.year_made || "");
      formData.append("fuel_type", addData.fuelType || "");
      formData.append("seat", addData.Seats || "");
      formData.append("transmition_type", addData.transmitionType || "");
      formData.append(
        "registeration_end_date",
        addData.registeration_end_date?.$d?.toISOString?.() || ""
      );
      formData.append(
        "insurance_end_date",
        addData.insurance_end_date?.$d?.toISOString?.() || ""
      );
      formData.append(
        "polution_end_date",
        addData.polution_end_date?.$d?.toISOString?.() || ""
      );
      formData.append("car_type", addData.carType || "");
      formData.append("location", addData.vehicleLocation || "");
      formData.append("district", addData.vehicleDistrict || "");
      formData.append("addedBy", _id || "");

      // append files (match field names expected by server)
      appendFiles(addData.image, "image", formData);
      appendFiles(addData.insurance_image, "insurance_image", formData);
      appendFiles(addData.rc_book_image, "rc_book_image", formData);
      appendFiles(addData.polution_image, "polution_image", formData);

      // DEBUG: print FormData contents
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            "FormData:",
            pair[0],
            "=> File(",
            pair[1].name,
            ",",
            pair[1].size,
            ")"
          );
        } else {
          console.log("FormData:", pair[0], "=>", pair[1]);
        }
      }

      const toastId = toast.loading("saving...", {
        position: "bottom-center",
      });

      const BACKEND =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${BACKEND}/api/vendor/vendorAddVehicle`, {
        method: "POST",
        body: formData,
        credentials: "include", // include cookies for JWT verification
      });

      let responseBody = null;
      try {
        responseBody = await res.json();
      } catch (e) {
        responseBody = await res.text();
      }
      console.log("server response:", res.status, responseBody);

      if (!res.ok) {
        toast.error(
          `Error: ${
            responseBody?.message || res.statusText || "server error"
          }`
        );
        toast.dismiss(toastId);
      } else {
        toast.success("Request sent to admin");
        toast.dismiss(toastId);
        reset();
      }
    } catch (error) {
      console.error("onSubmit client error:", error);
      toast.error("Client error (see console)");
    } finally {
      navigate("/vendorDashboard/vendorAllVeihcles");
      dispatch(addVehicleClicked(false));
    }
  };

  const handleClose = () => {
    navigate("/vendorDashboard/vendorAllVeihcles");
  };

  return (
    <>
      <Toaster position="bottom-center" />

      {/* Overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
        <div className="relative w-full max-w-5xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="
              absolute -top-4 -right-4
              flex items-center justify-center
              h-9 w-9
              rounded-full
              bg-white
              border border-gray-200
              shadow-md
              hover:bg-red-50
              hover:text-red-500
              transition
            "
          >
            <IoMdClose style={{ fontSize: "22px" }} />
          </button>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                <div className="mb-1.5">
                  <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
                    Vendor
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Submit Vehicle for Approval
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Fill in the details below to send your vehicle for admin
                  review.
                </p>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 lg:p-8 max-h-[80vh] overflow-y-auto">
                <Box
                  sx={{
                    "& .MuiTextField-root": {
                      m: 1.5,
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#E5E7EB",
                        },
                        "&:hover fieldset": {
                          borderColor: "#2563EB",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#2563EB",
                        },
                      },
                    },
                  }}
                  noValidate
                  autoComplete="off"
                >
                  {/* Row 1 & 2: main details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    <TextField
                      required
                      id="registeration_number"
                      label="Registration Number"
                      {...register("registeration_number")}
                    />

                    {/* ✅ Company: simple text field (no dropdown) */}
                    <Controller
                      control={control}
                      name="company"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="company"
                          label="Company"
                        />
                      )}
                    />

                    <TextField
                      required
                      id="name"
                      label="Name"
                      {...register("name")}
                    />

                    {/* ✅ Model: simple text field (no dropdown) */}
                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="model"
                          label="Model"
                        />
                      )}
                    />

                    <TextField
                      id="title"
                      label="Title"
                      {...register("title")}
                    />
                    <TextField
                      id="base_package"
                      label="Base Package"
                      {...register("base_package")}
                    />
                    <TextField
                      id="price"
                      type="number"
                      label="Price"
                      {...register("price")}
                    />

                    <TextField
                      required
                      id="year_made"
                      type="number"
                      label="Year Made"
                      {...register("year_made")}
                    />

                    <Controller
                      control={control}
                      name="fuelType"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="fuel_type"
                          select
                          label="Fuel Type"
                          error={Boolean(field.value === "")}
                        >
                          <MenuItem value={"petrol"}>Petrol</MenuItem>
                          <MenuItem value={"diesel"}>Diesel</MenuItem>
                          <MenuItem value={"electric"}>Electric</MenuItem>
                          <MenuItem value={"hybrid"}>Hybrid</MenuItem>
                        </TextField>
                      )}
                    />
                  </div>

                  {/* Config + Location */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {/* ✅ Car Type: seeded dropdown */}
                    <Controller
                      name="carType"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="car_type"
                          select
                          label="Car Type"
                          error={Boolean(field.value === "")}
                        >
                          {CAR_TYPE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="Seats"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="seats"
                          select
                          label="Seats"
                          error={Boolean(field.value === "")}
                        >
                          <MenuItem value={"5"}>5</MenuItem>
                          <MenuItem value={"7"}>7</MenuItem>
                          <MenuItem value={"8"}>8</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="transmitionType"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="transmittion_type"
                          select
                          label="Transmission Type"
                          error={Boolean(field.value === "")}
                        >
                          <MenuItem value={"automatic"}>Automatic</MenuItem>
                          <MenuItem value={"manual"}>Manual</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleLocation"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="vehicleLocation"
                          select
                          label="Vehicle Location"
                          error={Boolean(field.value === "")}
                        >
                          {locationData.map((cur, idx) => (
                            <MenuItem value={cur} key={idx}>
                              {cur}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleDistrict"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || ""}
                          required
                          id="vehicleDistrict"
                          select
                          label="Vehicle District"
                          error={Boolean(field.value === "")}
                        >
                          {districtData.map((cur, idx) => (
                            <MenuItem value={cur} key={idx}>
                              {cur}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <TextField
                      id="description"
                      label="Description"
                      multiline
                      rows={4}
                      sx={{
                        width: "100%",
                      }}
                      {...register("description")}
                    />
                  </div>

                  {/* Dates */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Controller
                      name="insurance_end_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Insurance End Date"
                            value={field.value || null}
                            onChange={(date) => field.onChange(date)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      control={control}
                      name="registeration_end_date"
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Registration End Date"
                            value={field.value || null}
                            onChange={(date) => field.onChange(date)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      control={control}
                      name="polution_end_date"
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Pollution End Date"
                            value={field.value || null}
                            onChange={(date) => field.onChange(date)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </div>

                  {/* File uploads */}
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      Upload Documents & Images
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div>
                        <label
                          className="block mb-2 text-xs font-medium text-slate-700"
                          htmlFor="insurance_image"
                        >
                          Upload Insurance Image
                        </label>
                        <input
                          id="insurance_image"
                          type="file"
                          multiple
                          {...register("insurance_image")}
                          className="block w-full text-xs text-slate-900 border border-gray-300 rounded-lg cursor-pointer bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#EFF6FF] file:text-[#1D4ED8] hover:file:bg-[#DBEAFE]"
                        />
                      </div>

                      <div>
                        <label
                          className="block mb-2 text-xs font-medium text-slate-700"
                          htmlFor="rc_book_image"
                        >
                          Upload RC Book Image
                        </label>
                        <input
                          id="rc_book_image"
                          type="file"
                          multiple
                          {...register("rc_book_image")}
                          className="block w-full text-xs text-slate-900 border border-gray-300 rounded-lg cursor-pointer bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#EFF6FF] file:text-[#1D4ED8] hover:file:bg-[#DBEAFE]"
                        />
                      </div>

                      <div>
                        <label
                          className="block mb-2 text-xs font-medium text-slate-700"
                          htmlFor="polution_image"
                        >
                          Upload Pollution Image
                        </label>
                        <input
                          id="polution_image"
                          type="file"
                          multiple
                          {...register("polution_image")}
                          className="block w-full text-xs text-slate-900 border border-gray-300 rounded-lg cursor-pointer bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#EFF6FF] file:text-[#1D4ED8] hover:file:bg-[#DBEAFE]"
                        />
                      </div>

                      <div>
                        <label
                          className="block mb-2 text-xs font-medium text-slate-700"
                          htmlFor="image"
                        >
                          Upload Vehicle Image
                        </label>
                        <input
                          id="image"
                          type="file"
                          multiple
                          {...register("image")}
                          className="block w-full text-xs text-slate-900 border border-gray-300 rounded-lg cursor-pointer bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#EFF6FF] file:text-[#1D4ED8] hover:file:bg-[#DBEAFE]"
                        />
                      </div>
                    </div>
                  </div>
                </Box>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      px-4 py-2 text-sm rounded-full
                      border border-gray-300
                      text-slate-700 bg-white
                      hover:bg-slate-50
                      transition
                    "
                  >
                    Cancel
                  </button>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{
                      textTransform: "none",
                      borderRadius: "999px",
                      paddingX: 3,
                      paddingY: 0.8,
                      backgroundColor: "#2563EB",
                      "&:hover": {
                        backgroundColor: "#1D4ED8",
                      },
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default VendorAddProductModal;
