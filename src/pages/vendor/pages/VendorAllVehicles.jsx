import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import toast, { Toaster } from "react-hot-toast";

import Box from "@mui/material/Box";
import {
  setVendorDeleteSuccess,
  setVendorEditSuccess,
  setVendorError,
  setVendorVehicles,
} from "../../../redux/vendor/vendorDashboardSlice";

import { signOut } from "../../../redux/user/userSlice";

import { GrStatusGood } from "react-icons/gr";
import { MdOutlinePending } from "react-icons/md";
import VendorHeader from "../Components/VendorHeader";

const VendorAllVehicles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);

  const {
    vendorVehicles: vendorVehiclesFromStore,
    vendorEditSuccess,
    vendorDeleteSuccess,
    vendorError,
  } = useSelector((state) => state.vendorDashboardSlice);

  const { _id } = useSelector((state) => state.user.currentUser || {});

  // Local copy
  const [vendorVehicles, setVendorVehiclesLocal] = useState(
    vendorVehiclesFromStore || []
  );

  useEffect(() => {
    setVendorVehiclesLocal(vendorVehiclesFromStore || []);
  }, [vendorVehiclesFromStore]);

  /* ======================================================
        IMAGE SRC HELPER
        - handles:
          • filenames in public/vehicles
          • values like "vehicles/xyz.jpg"
          • full URLs (Cloudinary)
  ====================================================== */
  const getVehicleImageSrc = (vehicle) => {
    let raw = Array.isArray(vehicle.image)
      ? vehicle.image[0]
      : vehicle.image;

    if (!raw) return "/placeholder-vehicle.png";

    // already a full URL
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    // already has /vehicles prefix
    if (raw.startsWith("/vehicles/")) return raw;
    if (raw.startsWith("vehicles/")) return `/${raw}`;

    // plain filename in public/vehicles
    return `/vehicles/${raw}`;
  };

  /* ======================================================
        FETCH VENDOR VEHICLES
  ====================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/vendor/showVendorVehilces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ _id }),
        });

        if (!res.ok) {
          console.error("showVendorVehilces failed:", res.statusText);

          if (res.status === 401 || res.status === 403) {
            toast.error("Session expired. Please login again.");
            dispatch(signOut());
            navigate("/vendorSignin");
          }
          return;
        }

        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.vehicles || [];

        dispatch(setVendorVehicles(arr));
        setVendorVehiclesLocal(arr);
      } catch (error) {
        console.error("showVendorVehilces error:", error);
      }
    };

    if (_id) fetchData();
  }, [_id, dispatch, navigate]);

  /* ======================================================
        REFRESH LIST AFTER ADDING A VEHICLE
  ====================================================== */
  useEffect(() => {
    if (!isAddVehicleClicked) return;

    (async () => {
      try {
        const res = await fetch("/api/vendor/showVendorVehilces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ _id }),
        });

        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : data.vehicles || [];
          dispatch(setVendorVehicles(arr));
          setVendorVehiclesLocal(arr);
        }
      } catch (e) {
        console.error("refetch error:", e);
      }
    })();
  }, [isAddVehicleClicked, _id, dispatch]);

  /* ======================================================
        EDIT OR DELETE VEHICLE NAVIGATION
  ====================================================== */
  const handleEditVehicle = (vehicle_id) =>
    navigate(
      `/vendorDashboard/vendorEditProductComponent?vehicle_id=${vehicle_id}`
    );

  const handleDeleteVehicles = (vehicle_id) =>
    navigate(
      `/vendorDashboard/vendorDeleteVehicleModal?vehicle_id=${vehicle_id}`
    );

  /* ======================================================
        DATAGRID COLUMNS
  ====================================================== */
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 100,
      renderCell: (params) => {
        const src = params.value || "/placeholder-vehicle.png";

        return (
          <img
            src={src}
            alt="vehicle"
            style={{
              width: "50px",
              height: "40px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-vehicle.png";
            }}
          />
        );
      },
    },

    { field: "registeration_number", headerName: "Register No", width: 150 },
    { field: "company", headerName: "Company", width: 150 },
    { field: "name", headerName: "Name", width: 150 },

    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const status = params.row.status;

        if (status === "rejected") {
          return (
            <div className="text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
              <span>Rejected</span>
              <MdOutlinePending className="text-sm" />
            </div>
          );
        }

        if (status === "pending") {
          return (
            <div className="text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
              <span>Pending</span>
              <MdOutlinePending className="text-sm" />
            </div>
          );
        }

        return (
          <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
            <span>Approved</span>
            <GrStatusGood className="text-sm" />
          </div>
        );
      },
    },

    {
      field: "edit",
      headerName: "Edit",
      width: 90,
      renderCell: (params) => (
        <Button
          onClick={() => handleEditVehicle(params.row.id)}
          size="small"
          sx={{ minWidth: 0 }}
        >
          <ModeEditOutlineIcon fontSize="small" />
        </Button>
      ),
    },

    {
      field: "delete",
      headerName: "Delete",
      width: 90,
      renderCell: (params) => (
        <Button
          onClick={() => handleDeleteVehicles(params.row.id)}
          size="small"
          sx={{ minWidth: 0 }}
        >
          <DeleteForeverIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  /* ======================================================
        BUILD ROWS
  ====================================================== */
  const rows = (vendorVehicles || [])
    .filter((vehicle) => vehicle.isDeleted !== true)
    .map((vehicle) => {
      let status = "pending";
      if (vehicle.isRejected) status = "rejected";
      else if (vehicle.isAdminApproved) status = "approved";

      return {
        id: vehicle._id,
        image: getVehicleImageSrc(vehicle), // ✅ final src here
        registeration_number: vehicle.registeration_number || "",
        company: vehicle.company,
        name: vehicle.name,
        status,
      };
    });

  const isVendorVehiclesEmpty = rows.length === 0;

  /* ======================================================
        TOAST HANDLING
  ====================================================== */
  useEffect(() => {
    if (vendorEditSuccess) {
      toast.success("Vehicle updated successfully");
      dispatch(setVendorEditSuccess(false));
    }

    if (vendorDeleteSuccess) {
      toast.success("Vehicle deleted");
      dispatch(setVendorDeleteSuccess(false));
    }

    if (vendorError) {
      toast.error("Something went wrong");
      dispatch(setVendorError(false));
    }
  }, [vendorEditSuccess, vendorDeleteSuccess, vendorError, dispatch]);

  /* ======================================================
        UI
  ====================================================== */
  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8">
      <Toaster />

      <VendorHeader title="All Vehicles" category="Vendor · Fleet" />

      <div
        className="
          bg-white
          rounded-2xl
          border border-[#E5E7EB]
          shadow-md
          p-4 sm:p-6 lg:p-8
        "
      >
        {isVendorVehiclesEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-5xl">🚗</div>
            <p className="text-sm font-medium text-slate-800">
              No vehicles added yet
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Once you add vehicles to your fleet, they’ll appear here with
              their approval status and details.
            </p>
          </div>
        ) : (
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              initialState={{
                pagination: { paginationModel: { pageSize: 8 } },
              }}
              pageSizeOptions={[5, 8, 10]}
              disableRowSelectionOnClick
              sx={{
                border: "none",
                fontSize: "0.875rem",
                ".MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "&.MuiDataGrid-root": {
                  borderRadius: "0.75rem",
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#F9FAFB",
                  borderBottom: "1px solid #E5E7EB",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  color: "#4B5563",
                },
                "& .MuiDataGrid-row": {
                  borderBottom: "1px solid #F3F4F6",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#F9FAFF",
                },
                "& .MuiDataGrid-cell": {
                  paddingInline: "10px",
                },
              }}
            />
          </Box>
        )}
      </div>
    </div>
  );
};

export default VendorAllVehicles;
