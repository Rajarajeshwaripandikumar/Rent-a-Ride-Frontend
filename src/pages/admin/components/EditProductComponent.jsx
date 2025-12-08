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

import { api } from "../../../api"; // ⭐ FIX – now using central API wrapper

export default function EditProductComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {},
  });

  const { userAllVehicles } = useSelector((state) => state.userListVehicles || {});
  const { modelData = [], companyData = [], locationData = [], districtData = [] }
    = useSelector((state) => state.modelDataSlice || {});

  const location = useLocation();
  const vehicle_id = new URLSearchParams(location.search).get("vehicle_id");

  const updateingItem =
    Array.isArray(userAllVehicles) && vehicle_id
      ? userAllVehicles.find((cur) => cur._id === vehicle_id) || null
      : null;

  /* -----------------------------------------------------------
     Load existing data into form
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!updateingItem) return;

    const d = (x) => (x ? dayjs(new Date(x)) : null);

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
      insurance_end_date: d(updateingItem.insurance_end),
      Registeration_end_date: d(updateingItem.registeration_end),
      polution_end_date: d(updateingItem.pollution_end),
    });
  }, [updateingItem, reset]);

  /* -----------------------------------------------------------
     SUBMIT FIX – Uses api.put with Bearer Token
  ----------------------------------------------------------- */
  const onEditSubmit = async (editData) => {
    let toastID;
    try {
      if (!vehicle_id) return;

      setSaving(true);
      toastID = toast.loading("Saving...", { position: "bottom-center" });

      const payload = {
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

      // ⭐ FIX – use api wrapper with automatic adminToken + base URL
      const response = await api.put(`/api/admin/editVehicle/${vehicle_id}`, {
        formData: payload,
      });

      toast.dismiss(toastID);
      toast.success("Vehicle updated successfully!");

      dispatch(setadminEditVehicleSuccess(true));
      dispatch(setEditData(null));

      navigate("/adminDashboard/allProduct");
    } catch (error) {
      console.error("Edit vehicle failed:", error);
      toast.dismiss(toastID);
      toast.error(error?.message || "Error updating vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    dispatch(setEditData(null));
    navigate("/adminDashboard/allProduct");
  };

  /* -----------------------------------------------------------
     UI Render
  ----------------------------------------------------------- */
  return (
    <>
      <Toaster position="bottom-center" />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
        <div className="relative w-full max-w-5xl">

          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={saving}
            className="absolute -top-4 -right-4 flex items-center justify-center h-9 w-9 rounded-full bg-white border border-gray-200 shadow-md hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
          >
            <IoMdClose fontSize={22} />
          </button>

          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

              {/* HEADER */}
              <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                <span className="inline-flex px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                  Vehicle
                </span>

                <h2 className="text-lg font-semibold text-slate-900 mt-2">
                  Edit Vehicle
                </h2>
                <p className="text-[11px] text-slate-500">
                  Update and save changes below.
                </p>
              </div>

              {/* FORM CONTENT */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <Box noValidate autoComplete="off">

                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

                    <TextField label="Registration Number" required {...register("registeration_number")} />

                    <Controller
                      control={control}
                      name="company"
                      render={({ field }) => (
                        <TextField {...field} select required label="Company">
                          {companyData.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <TextField label="Name" required {...register("name")} />

                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <TextField {...field} select required label="Model">
                          {modelData.map((m) => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <TextField label="Title" {...register("title")} />
                    <TextField label="Base Package" {...register("base_package")} />
                    <TextField label="Price" type="number" {...register("price")} />

                    <TextField label="Year Made" type="number" required {...register("year_made")} />

                    <Controller
                      control={control}
                      name="fuelType"
                      render={({ field }) => (
                        <TextField {...field} select required label="Fuel Type">
                          <MenuItem value="petrol">Petrol</MenuItem>
                          <MenuItem value="diesel">Diesel</MenuItem>
                          <MenuItem value="electric">Electric</MenuItem>
                          <MenuItem value="hybrid">Hybrid</MenuItem>
                        </TextField>
                      )}
                    />
                  </div>

                  {/* Config + Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

                    <Controller
                      control={control}
                      name="carType"
                      render={({ field }) => (
                        <TextField {...field} select required label="Car Type">
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
                        <TextField {...field} select required label="Seats">
                          <MenuItem value="5">5</MenuItem>
                          <MenuItem value="7">7</MenuItem>
                          <MenuItem value="8">8</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="transmitionType"
                      render={({ field }) => (
                        <TextField {...field} select required label="Transmission">
                          <MenuItem value="automatic">Automatic</MenuItem>
                          <MenuItem value="manual">Manual</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleLocation"
                      render={({ field }) => (
                        <TextField {...field} select required label="Location">
                          {locationData.map((loc) => (
                            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleDistrict"
                      render={({ field }) => (
                        <TextField {...field} select required label="District">
                          {districtData.map((d) => (
                            <MenuItem key={d} value={d}>{d}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <TextField multiline rows={3} label="Description" {...register("description")} />
                  </div>

                  {/* Date Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

                    <Controller
                      name="insurance_end_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker {...field} label="Insurance End Date" />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      name="Registeration_end_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker {...field} label="Registration End Date" />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      name="polution_end_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker {...field} label="Pollution End Date" />
                        </LocalizationProvider>
                      )}
                    />
                  </div>

                </Box>

                {/* FOOTER BUTTONS */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={saving}
                    className="px-4 py-2 border rounded-full bg-white hover:bg-slate-100"
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
                      px: 3,
                      py: 1,
                      backgroundColor: "#0071DC",
                      "&:hover": { backgroundColor: "#0654BA" },
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
