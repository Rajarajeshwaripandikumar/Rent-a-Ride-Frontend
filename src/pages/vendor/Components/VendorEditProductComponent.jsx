import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { setVendorEditSuccess } from "../../../redux/vendor/vendorDashboardSlice";

export default function VendorEditProductComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, control, reset } = useForm();
  const { vendorVehilces } = useSelector((state) => state.vendorDashboardSlice);
  const { modelData, companyData, locationData, districtData } = useSelector(
    (state) => state.modelDataSlice
  );

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicle_id = queryParams.get("vehicle_id");

  let updateingItem = "";
  vendorVehilces.forEach((cur) => {
    if (cur._id === vehicle_id) {
      updateingItem = cur;
    }
  });

  const insuranceDefaultDate = updateingItem.insurance_end
    ? dayjs(new Date(updateingItem.insurance_end))
    : null;
  const registerationDefaultDate = updateingItem.registeration_end
    ? dayjs(new Date(updateingItem.registeration_end))
    : null;
  const pollutionDefaultDate = updateingItem.pollution_end
    ? dayjs(new Date(updateingItem.pollution_end))
    : null;

  const onEditSubmit = async (editData) => {
    let tostID;
    try {
      if (editData && vehicle_id) {
        tostID = toast.loading("saving...", { position: "bottom-center" });
        const formData = editData;
        const res = await fetch(
          `/api/vendor/vendorEditVehicles/${vehicle_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ formData }),
          }
        );

        if (!res.ok) {
          toast.error("error");
          toast.dismiss(tostID);
        }

        if (res.ok) {
          toast.dismiss(tostID);
          dispatch(setVendorEditSuccess(true));
        }
      }
      reset();
    } catch (error) {
      console.log(error);
    }
    navigate("/vendorDashboard/vendorAddProduct");
  };

  const handleClose = () => {
    navigate("/vendorDashboard/vendorAddProduct");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
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
            border border-[#E5E7EB]
            shadow-md
            hover:bg-red-50
            hover:text-red-500
            transition
          "
        >
          <IoMdClose style={{ fontSize: "22px" }} />
        </button>

        <form onSubmit={handleSubmit(onEditSubmit)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Edit Vehicle
              </h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Update the details below and save your changes.
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
                {/* Basic details */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  <TextField
                    required
                    id="registeration_number"
                    label="Registration Number"
                    {...register("registeration_number")}
                    defaultValue={updateingItem?.registeration_number || ""}
                  />

                  <Controller
                    control={control}
                    name="company"
                    defaultValue={updateingItem?.company || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        id="company"
                        select
                        label="Company"
                        error={Boolean(field.value === "")}
                      >
                        {companyData.map((cur, idx) => (
                          <MenuItem value={cur} key={idx}>
                            {cur}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <TextField
                    required
                    id="name"
                    label="Name"
                    {...register("name")}
                    defaultValue={updateingItem?.name || ""}
                  />

                  <Controller
                    control={control}
                    name="model"
                    defaultValue={updateingItem?.model || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        id="model"
                        select
                        label="Model"
                        error={Boolean(field.value === "")}
                      >
                        {modelData.map((cur, idx) => (
                          <MenuItem value={cur} key={idx}>
                            {cur}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <TextField
                    id="title"
                    label="Title"
                    {...register("title")}
                    defaultValue={updateingItem?.car_title || ""}
                  />
                  <TextField
                    id="base_package"
                    label="Base Package"
                    {...register("base_package")}
                    defaultValue={updateingItem?.base_package || ""}
                  />
                  <TextField
                    id="price"
                    type="number"
                    label="Price"
                    {...register("price")}
                    defaultValue={updateingItem?.price || ""}
                  />

                  <TextField
                    required
                    id="year_made"
                    type="number"
                    label="Year Made"
                    {...register("year_made")}
                    defaultValue={updateingItem?.year_made || ""}
                  />

                  <Controller
                    control={control}
                    name="fuelType"
                    defaultValue={updateingItem?.fuel_type || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        id="fuel_type"
                        select
                        label="Fuel Type"
                        error={Boolean(field.value === "")}
                      >
                        <MenuItem value={"petrol"}>petrol</MenuItem>
                        <MenuItem value={"diesel"}>diesel</MenuItem>
                        <MenuItem value={"electirc"}>electric</MenuItem>
                        <MenuItem value={"hybrid"}>hybrid</MenuItem>
                      </TextField>
                    )}
                  />
                </div>

                {/* Config + location */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  <Controller
                    name="carType"
                    control={control}
                    defaultValue={updateingItem?.car_type || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        id="car_type"
                        select
                        label="Car Type"
                        error={Boolean(field.value === "")}
                      >
                        <MenuItem value="sedan">Sedan</MenuItem>
                        <MenuItem value="suv">SUV</MenuItem>
                        <MenuItem value="hatchback">Hatchback</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    control={control}
                    name="Seats"
                    defaultValue={updateingItem?.seats || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
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
                    defaultValue={updateingItem?.transmition || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        id="transmittion_type"
                        select
                        label="Transmission Type"
                        error={Boolean(field.value === "")}
                      >
                        <MenuItem value={"automatic"}>automatic</MenuItem>
                        <MenuItem value={"manual"}>manual</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    control={control}
                    name="vehicleLocation"
                    defaultValue={updateingItem?.location || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
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
                    defaultValue={updateingItem?.district || ""}
                    render={({ field }) => (
                      <TextField
                        {...field}
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
                    defaultValue={updateingItem?.car_description || ""}
                    multiline
                    rows={4}
                    sx={{
                      width: "100%",
                      "@media (min-width: 1280px)": {
                        minWidth: 565,
                      },
                    }}
                    {...register("description")}
                  />
                </div>

                {/* Dates */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Controller
                    name="insurance_end_date"
                    control={control}
                    defaultValue={insuranceDefaultDate}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label="Insurance End Date"
                          inputFormat="MM/dd/yyyy"
                          value={field.value || null}
                          onChange={(date) => field.onChange(date)}
                          textField={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    )}
                  />

                  <Controller
                    control={control}
                    name="Registeration_end_date"
                    defaultValue={registerationDefaultDate}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label="Registration End Date"
                          inputFormat="MM/dd/yyyy"
                          value={field.value || null}
                          onChange={(date) => field.onChange(date)}
                          textField={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    )}
                  />

                  <Controller
                    control={control}
                    name="polution_end_date"
                    defaultValue={pollutionDefaultDate}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label="Pollution End Date"
                          inputFormat="MM/dd/yyyy"
                          value={field.value || null}
                          onChange={(date) => field.onChange(date)}
                          textField={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </div>

                {/* File uploads */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Update Documents & Images (optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                      <label
                        className="block mb-2 text-xs font-medium text-gray-700"
                        htmlFor="insurance_image"
                      >
                        Upload Insurance Image
                      </label>
                      <input
                        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                        id="insurance_image"
                        type="file"
                        multiple
                        {...register("insurance_image")}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-2 text-xs font-medium text-gray-700"
                        htmlFor="rc_book_image"
                      >
                        Upload RC Book Image
                      </label>
                      <input
                        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                        id="rc_book_image"
                        type="file"
                        multiple
                        {...register("rc_book_image")}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-2 text-xs font-medium text-gray-700"
                        htmlFor="polution_image"
                      >
                        Upload Pollution Image
                      </label>
                      <input
                        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                        id="polution_image"
                        type="file"
                        multiple
                        {...register("polution_image")}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-2 text-xs font-medium text-gray-700"
                        htmlFor="image"
                      >
                        Upload Vehicle Image
                      </label>
                      <input
                        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                        id="image"
                        type="file"
                        multiple
                        {...register("image")}
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
                    text-gray-700 bg-white
                    hover:bg-gray-50
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
  );
}
