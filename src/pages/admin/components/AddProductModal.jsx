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

// ⭐ Use central API wrapper
import { api } from "../../../api";

// ============================================================
// FETCH ALL MODEL / BRAND / LOCATION / DISTRICT DATA
// ============================================================
export const fetchModelData = async (dispatch) => {
  try {
    const data = await api.get("/api/admin/getVehicleModels");

    const models = data.filter(c => c.type === "car").map(c => c.model);
    const brands = data.filter(c => c.type === "car").map(c => c.brand);
    const uniqueBrands = [...new Set(brands)];

    const locations = data.filter(c => c.type === "location").map(c => c.location);
    const districts = data.filter(c => c.type === "location").map(c => c.district);
    const uniqueDistricts = [...new Set(districts)];

    dispatch(setModelData(models));
    dispatch(setCompanyData(uniqueBrands));
    dispatch(setLocationData(locations));
    dispatch(setDistrictData(uniqueDistricts));
    dispatch(setWholeData(data.filter(c => c.type === "location")));
  } catch (err) {
    console.error("Vehicle model fetch failed:", err);
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

  // ============================================================
  // SUBMIT VEHICLE FORM (NOW USING api.post WITH FORMDATA)
  // ============================================================
  const onSubmit = async (form) => {
    try {
      const fd = new FormData();

      // Basic fields
      fd.append("registeration_number", form.registeration_number);
      fd.append("company", form.company);
      fd.append("name", form.name);
      fd.append("model", form.model);
      fd.append("title", form.title || "");
      fd.append("base_package", form.base_package || "");
      fd.append("price", form.price || "");
      fd.append("description", form.description || "");
      fd.append("year_made", form.year_made);
      fd.append("fuel_type", form.fuelType);
      fd.append("seat", form.Seats);
      fd.append("transmition_type", form.transmitionType);
      fd.append("car_type", form.carType);
      fd.append("location", form.vehicleLocation);
      fd.append("district", form.vehicleDistrict);

      // Dates
      if (form.insurance_end_date?.$d)
        fd.append("insurance_end_date", form.insurance_end_date.$d);
      if (form.Registeration_end_date?.$d)
        fd.append("registeration_end_date", form.Registeration_end_date.$d);
      if (form.polution_end_date?.$d)
        fd.append("polution_end_date", form.polution_end_date.$d);

      // Images
      const pushFiles = (arr, key) => {
        if (!arr?.length) return;
        [...arr].forEach((file) => fd.append(key, file));
      };

      pushFiles(form.image, "image");
      pushFiles(form.insurance_image, "insurance_image");
      pushFiles(form.polution_image, "polution_image");
      pushFiles(form.rc_book_image, "rc_book_image");

      dispatch(setLoading(true));
      const toastId = toast.loading("Saving vehicle...");

      // ⭐ API WRAPPER HANDLES BASE URL + ADMIN TOKEN
      await api.post("/api/admin/addProduct", fd, true); // `true` => multipart mode

      dispatch(setadminAddVehicleSuccess(true));
      toast.dismiss(toastId);
      toast.success("Vehicle added successfully!");
      reset();
    } catch (err) {
      console.error(err);
      dispatch(setadminCrudError(true));
      toast.error("Failed to add vehicle");
    }

    dispatch(setLoading(false));
    dispatch(addVehicleClicked(false));
    navigate("/adminDashboard/allProduct");
  };

  const handleClose = () => {
    dispatch(addVehicleClicked(false));
    navigate("/adminDashboard/allProduct");
  };

  return (
    <>
      <Toaster position="bottom-center" />

      {isAddVehicleClicked && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute -top-4 -right-4 h-9 w-9 flex items-center justify-center rounded-full bg-white border shadow-md hover:bg-red-50 hover:text-red-500 transition"
            >
              <IoMdClose style={{ fontSize: "22px" }} />
            </button>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b bg-slate-50">
                  <span className="inline-flex px-2 py-[2px] text-[11px] font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded-md uppercase tracking-[0.16em]">
                    Vehicle
                  </span>
                  <h2 className="text-lg font-semibold mt-2">Add New Vehicle</h2>
                  <p className="text-xs text-slate-500">Complete the details below.</p>
                </div>

                {/* Scroll content */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  <Box
                    sx={{
                      "& .MuiTextField-root": {
                        m: 1.5,
                        width: "100%",
                      },
                    }}
                  >
                    {/* BASIC FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      <TextField {...register("registeration_number")} required label="Registration Number" />
                      <Controller
                        name="company"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Company">
                            {companyData.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                          </TextField>
                        )}
                      />
                      <TextField {...register("name")} required label="Name" />
                      <Controller
                        name="model"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Model">
                            {modelData.map((m, i) => <MenuItem key={i} value={m}>{m}</MenuItem>)}
                          </TextField>
                        )}
                      />

                      <TextField {...register("title")} label="Title" />
                      <TextField {...register("base_package")} label="Base Package" />
                      <TextField {...register("price")} type="number" label="Price" />
                      <TextField {...register("year_made")} required type="number" label="Year Made" />
                    </div>

                    {/* CONFIG FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      <Controller
                        name="fuelType"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Fuel">
                            <MenuItem value="petrol">Petrol</MenuItem>
                            <MenuItem value="diesel">Diesel</MenuItem>
                            <MenuItem value="electric">Electric</MenuItem>
                            <MenuItem value="hybrid">Hybrid</MenuItem>
                          </TextField>
                        )}
                      />

                      <Controller
                        name="carType"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Car Type">
                            <MenuItem value="sedan">Sedan</MenuItem>
                            <MenuItem value="suv">SUV</MenuItem>
                            <MenuItem value="hatchback">Hatchback</MenuItem>
                          </TextField>
                        )}
                      />

                      <Controller
                        name="Seats"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Seats">
                            <MenuItem value="5">5</MenuItem>
                            <MenuItem value="7">7</MenuItem>
                            <MenuItem value="8">8</MenuItem>
                          </TextField>
                        )}
                      />

                      <Controller
                        name="transmitionType"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Transmission">
                            <MenuItem value="automatic">Automatic</MenuItem>
                            <MenuItem value="manual">Manual</MenuItem>
                          </TextField>
                        )}
                      />

                      {/* Location Fields */}
                      <Controller
                        name="vehicleLocation"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="Location">
                            {locationData.map((l, i) => <MenuItem key={i} value={l}>{l}</MenuItem>)}
                          </TextField>
                        )}
                      />

                      <Controller
                        name="vehicleDistrict"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select required label="District">
                            {districtData.map((d, i) => <MenuItem key={i} value={d}>{d}</MenuItem>)}
                          </TextField>
                        )}
                      />

                      <TextField {...register("description")} multiline rows={4} label="Description" />
                    </div>

                    {/* DATE PICKERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {["insurance_end_date", "Registeration_end_date", "polution_end_date"].map(
                        (fieldName, i) => (
                          <Controller
                            key={i}
                            name={fieldName}
                            control={control}
                            render={({ field }) => (
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  {...field}
                                  label={fieldName.replace(/_/g, " ")}
                                  onChange={(date) => field.onChange(date)}
                                />
                              </LocalizationProvider>
                            )}
                          />
                        )
                      )}
                    </div>

                    {/* FILE UPLOADS */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {[
                        ["insurance_image", "Insurance Images"],
                        ["rc_book_image", "RC Book Images"],
                        ["polution_image", "Pollution Images"],
                        ["image", "Vehicle Images"],
                      ].map(([field, label], i) => (
                        <div key={i}>
                          <label className="text-xs font-medium">{label}</label>
                          <input
                            type="file"
                            multiple
                            {...register(field)}
                            className="block w-full mt-1 p-2 border rounded-lg text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </Box>

                  {/* ACTION BUTTONS */}
                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full border text-sm"
                      onClick={handleClose}
                      disabled={loading}
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
                        px: 4,
                        backgroundColor: "#0071DC",
                        "&:hover": { backgroundColor: "#0654BA" },
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
