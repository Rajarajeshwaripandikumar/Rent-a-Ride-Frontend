import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import { setEditData } from "../../../redux/adminSlices/actions";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast, { Toaster } from "react-hot-toast";
import { setadminEditVehicleSuccess } from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

export default function EditProductComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      registeration_number: "",
      company: "",
      name: "",
      model: "",
      title: "",
      base_package: "",
      price: "",
      year_made: "",
      fuelType: "",
      carType: "",
      Seats: "",
      transmitionType: "",
      vehicleLocation: "",
      vehicleDistrict: "",
      description: "",
      insurance_end_date: null,
      Registeration_end_date: null,
      polution_end_date: null,
    },
  });

  const { userAllVehicles } = useSelector(
    (state) => state.userListVehicles || {}
  );
  const {
    modelData = [],
    companyData = [],
    locationData = [],
    districtData = [],
  } = useSelector((state) => state.modelDataSlice || {});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicle_id = queryParams.get("vehicle_id");

  const updateingItem =
    Array.isArray(userAllVehicles) && vehicle_id
      ? userAllVehicles.find((cur) => cur._id === vehicle_id) || null
      : null;

  useEffect(() => {
    if (!updateingItem) return;

    const formatDate = (d) => (d ? dayjs(new Date(d)) : null);

    reset({
      registeration_number: updateingItem.registeration_number ?? "",
      company: updateingItem.company ?? "",
      name: updateingItem.name ?? "",
      model: updateingItem.model ?? "",
      title: updateingItem.car_title ?? "",
      base_package: updateingItem.base_package ?? "",
      price: updateingItem.price ?? "",
      year_made: updateingItem.year_made ?? "",
      fuelType: updateingItem.fuel_type ?? "",
      carType: updateingItem.car_type ?? "",
      Seats: updateingItem.seats ?? "",
      transmitionType: updateingItem.transmition ?? "",
      vehicleLocation: updateingItem.location ?? "",
      vehicleDistrict: updateingItem.district ?? "",
      description: updateingItem.car_description ?? "",
      insurance_end_date: formatDate(updateingItem.insurance_end),
      Registeration_end_date: formatDate(updateingItem.registeration_end),
      polution_end_date: formatDate(updateingItem.pollution_end),
    });
  }, [updateingItem, reset]);

  const onEditSubmit = async (editData) => {
    let toastID;
    try {
      if (!editData || !vehicle_id) return;

      setSaving(true);
      toastID = toast.loading("Saving...", { position: "bottom-center" });

      const formData = {
        ...editData,
        insurance_end_date: editData.insurance_end_date
          ? dayjs(editData.insurance_end_date).toISOString()
          : null,
        Registeration_end_date: editData.Registeration_end_date
          ? dayjs(editData.Registeration_end_date).toISOString()
          : null,
        polution_end_date: editData.polution_end_date
          ? dayjs(editData.polution_end_date).toISOString()
          : null,
      };

      dispatch(setEditData({ _id: vehicle_id, ...formData }));

      const res = await fetch(`/api/admin/editVehicle/${vehicle_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) {
        toast.dismiss(toastID);
        toast.error("Error saving vehicle");
        dispatch(setEditData(null));
        return;
      }

      toast.dismiss(toastID);
      toast.success("Saved");
      dispatch(setadminEditVehicleSuccess(true));
      dispatch(setEditData(null));
      reset();

      navigate("/adminDashboard/allProduct");
    } catch (error) {
      console.error("Edit submit error:", error);
      if (toastID) toast.dismiss(toastID);
      toast.error("Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    dispatch(setEditData(null));
    navigate("/adminDashboard/allProduct");
  };

  return (
    <>
      <Toaster position="bottom-center" />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
        <div className="relative w-full max-w-5xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={saving}
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
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition
            "
          >
            <IoMdClose fontSize={22} />
          </button>

          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                <div className="mb-1.5">
                  <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
                    Vehicle
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Edit Vehicle
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
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
                          borderColor: "#1D4ED8",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1D4ED8",
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
                      defaultValue=""
                    />

                    <Controller
                      control={control}
                      name="company"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="company"
                          select
                          label="Company"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                      defaultValue=""
                    />

                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="model"
                          select
                          label="Model"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                      defaultValue=""
                    />
                    <TextField
                      id="base_package"
                      label="Base Package"
                      {...register("base_package")}
                      defaultValue=""
                    />
                    <TextField
                      id="price"
                      type="number"
                      label="Price"
                      {...register("price")}
                      defaultValue=""
                    />

                    <TextField
                      required
                      id="year_made"
                      type="number"
                      label="Year Made"
                      {...register("year_made")}
                      defaultValue=""
                    />

                    <Controller
                      control={control}
                      name="fuelType"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="fuel_type"
                          select
                          label="Fuel Type"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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

                  {/* Config + Location */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    <Controller
                      name="carType"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="car_type"
                          select
                          label="Car Type"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="seats"
                          select
                          label="Seats"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                          required
                          id="transmittion_type"
                          select
                          label="Transmission"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="vehicleLocation"
                          select
                          label="Vehicle Location"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                          required
                          id="vehicleDistrict"
                          select
                          label="Vehicle District"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                      defaultValue=""
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
                            inputFormat="MM/DD/YYYY"
                            value={field.value ?? null}
                            onChange={(date) => field.onChange(date ?? null)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      control={control}
                      name="Registeration_end_date"
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Registration End Date"
                            inputFormat="MM/DD/YYYY"
                            value={field.value ?? null}
                            onChange={(date) => field.onChange(date ?? null)}
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
                            inputFormat="MM/DD/YYYY"
                            value={field.value ?? null}
                            onChange={(date) => field.onChange(date ?? null)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </div>

                  {/* File uploads */}
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      Update Documents & Images (optional)
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
                          className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8]"
                          id="insurance_image"
                          type="file"
                          multiple
                          {...register("insurance_image")}
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
                          className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8]"
                          id="rc_book_image"
                          type="file"
                          multiple
                          {...register("rc_book_image")}
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
                          className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8]"
                          id="polution_image"
                          type="file"
                          multiple
                          {...register("polution_image")}
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
                          className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8]"
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
                    disabled={saving}
                    className="
                      px-4 py-2 text-sm rounded-full 
                      border border-gray-300 
                      text-slate-700 bg-white 
                      hover:bg-slate-50 
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition
                    "
                  >
                    Cancel
                  </button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={saving}
                    sx={{
                      textTransform: "none",
                      borderRadius: "999px",
                      paddingX: 3,
                      paddingY: 0.8,
                      backgroundColor: "#0071DC",
                      "&:hover": {
                        backgroundColor: "#0654BA",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#93C5FD",
                        color: "#E5E7EB",
                      },
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
