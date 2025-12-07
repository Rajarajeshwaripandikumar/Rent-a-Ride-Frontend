import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import { addVehicleClicked } from "../../../redux/adminSlices/actions";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import {
  setModelData,
  setCompanyData,
  setLocationData,
  setDistrictData,
} from "../../../redux/adminSlices/adminDashboardSlice/CarModelDataSlice";
import { MenuItem } from "@mui/material";
import { setWholeData } from "../../../redux/user/selectRideSlice";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { IoMdClose } from "react-icons/io";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  setLoading,
  setadminAddVehicleSuccess,
  setadminCrudError,
} from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

// Helper to fetch model/location/district data
export const fetchModelData = async (dispatch) => {
  try {
    const res = await fetch("/api/admin/getVehicleModels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();

      // models
      const models = data
        .filter((cur) => cur.type === "car")
        .map((cur) => cur.model);
      dispatch(setModelData(models));

      // brands
      const brand = data
        .filter((cur) => cur.type === "car")
        .map((cur) => cur.brand);
      const uniqueBrand = brand.filter((cur, index) => brand.indexOf(cur) === index);
      dispatch(setCompanyData(uniqueBrand));

      // locations
      const locations = data
        .filter((cur) => cur.type === "location")
        .map((cur) => cur.location);
      dispatch(setLocationData(locations));

      // districts
      const districts = data
        .filter((cur) => cur.type === "location")
        .map((cur) => cur.district);
      const uniqueDistricts = districts.filter(
        (cur, idx) => districts.indexOf(cur) === idx
      );
      dispatch(setDistrictData(uniqueDistricts));

      // whole location data
      const wholeData = data.filter((cur) => cur.type === "location");
      dispatch(setWholeData(wholeData));
    } else {
      return "no data found";
    }
  } catch (error) {
    console.log(error);
  }
};

const AddProductModal = () => {
  const { register, handleSubmit, control, reset } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);
  const { modelData, companyData, locationData, districtData } = useSelector(
    (state) => state.modelDataSlice
  );
  const { loading } = useSelector((state) => state.statusSlice);

  useEffect(() => {
    fetchModelData(dispatch);
    dispatch(addVehicleClicked(true));
  }, [dispatch]);

  const onSubmit = async (addData) => {
    try {
      const img = [];
      for (let i = 0; i < (addData.image?.length || 0); i++) {
        img.push(addData.image[i]);
      }

      const formData = new FormData();
      formData.append("registeration_number", addData.registeration_number);
      formData.append("company", addData.company);
      img.forEach((file) => {
        formData.append("image", file);
      });
      formData.append("name", addData.name);
      formData.append("model", addData.model);
      formData.append("title", addData.title);
      formData.append("base_package", addData.base_package);
      formData.append("price", addData.price);
      formData.append("description", addData.description);
      formData.append("year_made", addData.year_made);
      formData.append("fuel_type", addData.fuelType);
      formData.append("seat", addData.Seats);
      formData.append("transmition_type", addData.transmitionType);

      if (addData.insurance_end_date?.$d) {
        formData.append("insurance_end_date", addData.insurance_end_date.$d);
      }
      if (addData.Registeration_end_date?.$d) {
        formData.append("registeration_end_date", addData.Registeration_end_date.$d);
      }
      if (addData.polution_end_date?.$d) {
        formData.append("polution_end_date", addData.polution_end_date.$d);
      }

      formData.append("car_type", addData.carType);
      formData.append("location", addData.vehicleLocation);
      formData.append("district", addData.vehicleDistrict);

      let tostID;
      if (formData) {
        tostID = toast.loading("Saving...", { position: "bottom-center" });
        dispatch(setLoading(true));
      }

      const res = await fetch("/api/admin/addProduct", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Error while saving");
        toast.dismiss(tostID);
        dispatch(setLoading(false));
      } else {
        dispatch(setadminAddVehicleSuccess(true));
        toast.dismiss(tostID);
        toast.success("Vehicle added");
        dispatch(setLoading(false));
      }

      reset();
    } catch (error) {
      dispatch(setadminCrudError(true));
      console.log(error);
    }

    dispatch(addVehicleClicked(false));
    navigate("/adminDashboard/allProduct");
  };

  const handleClose = () => {
    dispatch(addVehicleClicked(false));
    navigate("/adminDashboard/allProduct");
  };

  return (
    <>
      {/* Toast container mounted once */}
      <Toaster position="bottom-center" />

      {isAddVehicleClicked && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          {/* Modal card wrapper */}
          <div className="relative w-full max-w-5xl">
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={loading}
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
                disabled:opacity-60 disabled:cursor-not-allowed
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
                      Vehicle
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Add New Vehicle
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Fill in the details below to add a new vehicle to your fleet.
                  </p>
                </div>

                {/* Form content */}
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
                            required
                            id="fuel_type"
                            select
                            label="Fuel Type"
                            error={Boolean(field.value === "")}
                          >
                            <MenuItem value={"petrol"}>Petrol</MenuItem>
                            <MenuItem value={"diesel"}>Diesel</MenuItem>
                            <MenuItem value={"electirc"}>Electric</MenuItem>
                            <MenuItem value={"hybrid"}>Hybrid</MenuItem>
                          </TextField>
                        )}
                      />
                    </div>

                    {/* Car config */}
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
                              inputFormat="MM/dd/yyyy"
                              value={field.value || null}
                              onChange={(date) => field.onChange(date)}
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
                              inputFormat="MM/dd/yyyy"
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
                              inputFormat="MM/dd/yyyy"
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
                            className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 focus:border-[#1D4ED8]"
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
                            className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 focus:border-[#1D4ED8]"
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
                            className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 focus:border-[#1D4ED8]"
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
                            className="block w-full p-2 text-sm text-slate-900 border border-gray-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 focus:border-[#1D4ED8]"
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
                      disabled={loading}
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
                      disabled={loading}
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
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductModal;
