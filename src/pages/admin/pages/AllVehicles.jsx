import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setEditData } from "../../../redux/adminSlices/actions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { showVehicles } from "../../../redux/user/listAllVehicleSlice";
import { clearAdminVehicleToast } from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

// local fallback image
import noCars from "../../../assets/My team1.png";

/* ============================================================
   Helper: build image src from whatever backend sends
   -> always returns something usable by React
============================================================ */
const buildVehicleImageSrc = (raw) => {
  if (!raw) return noCars;

  let value = raw;

  // if backend sent object, try common fields
  if (typeof value === "object") {
    const maybe =
      value.url ||
      value.path ||
      value.filename ||
      value.fileName ||
      value.name ||
      (Array.isArray(value) ? value[0] : null);
    value = maybe || "";
  }

  if (typeof value !== "string") return noCars;

  const trimmed = value.trim();
  if (!trimmed) return noCars;

  // already a full URL (CDN, etc)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // if already like "/vehicles/xyz.jpg"
  if (trimmed.startsWith("/vehicles/")) {
    return trimmed;
  }

  // take just the filename in case "uploads/vehicles/xyz.jpg"
  let fileName = trimmed.split(/[/\\]/).pop() || trimmed;

  // strip leading "vehicles/"
  fileName = fileName.replace(/^\/?vehicles\//, "");

  // if no extension, assume .jpg (your folder is JPG)
  if (!fileName.includes(".")) {
    fileName = `${fileName}.jpg`;
  }

  return `/vehicles/${fileName}`;
};

function AllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);

  const [allVehicles, setVehicles] = useState([]);
  const [deletingId, setDeletingId] = useState(null); // which row is being deleted (disable)

  const {
    adminEditVehicleSuccess,
    adminAddVehicleSuccess,
    adminCrudError,
  } = useSelector((state) => state.statusSlice);

  /* ============================================================
      FETCH ADMIN VEHICLES (Normalize result)
  ============================================================ */
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/admin/showVehicles");
        if (res.ok) {
          const data = await res.json();

          // backend might return { success, vehicles: [] } or array directly
          const normalized = Array.isArray(data)
            ? data
            : Array.isArray(data?.vehicles)
            ? data.vehicles
            : [];

          setVehicles(normalized);
          dispatch(showVehicles(normalized));
        } else {
          console.warn("Failed to fetch admin vehicles", res.status);
        }
      } catch (error) {
        console.error("fetchVehicles error:", error);
      }
    };

    fetchVehicles();
  }, [isAddVehicleClicked, dispatch]);

  /* ============================================================
      DELETE VEHICLE (confirm + optimistic UI + rollback on failure)
  ============================================================ */
  const handleDelete = async (vehicle_id) => {
    const ok = window.confirm("Are you sure you want to delete this vehicle?");
    if (!ok) return;

    const previous = allVehicles;
    setVehicles((prev) => prev.filter((cur) => cur._id !== vehicle_id));
    setDeletingId(vehicle_id);

    try {
      const res = await fetch(`/api/admin/deleteVehicle/${vehicle_id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Vehicle deleted", {
          duration: 1500,
          style: {
            color: "white",
            background: "#c48080",
          },
        });
      } else {
        setVehicles(previous);
        console.warn("delete failed", res.status);
        toast.error("Delete failed — restored list");
      }
    } catch (error) {
      setVehicles(previous);
      console.error("delete error:", error);
      toast.error("Delete failed due to network error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================================
      EDIT VEHICLE
  ============================================================ */
  const handleEditVehicle = (vehicle_id) => {
    dispatch(setEditData({ _id: vehicle_id }));
    navigate(`/adminDashboard/editProducts?vehicle_id=${vehicle_id}`);
  };

  /* ============================================================
      DATAGRID COLUMNS (image cell uses onError fallback)
  ============================================================ */
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 120,
      renderCell: (params) => {
        const imgSrc = params.value || noCars;
        return (
          <img
            src={imgSrc}
            style={{
              width: "50px",
              height: "40px",
              borderRadius: "6px",
              objectFit: "cover",
            }}
            alt="vehicle"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = noCars;
            }}
          />
        );
      },
    },
    {
      field: "registeration_number",
      headerName: "Register Number",
      width: 160,
    },
    { field: "company", headerName: "Company", width: 150 },
    { field: "name", headerName: "Name", width: 150 },

    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleEditVehicle(params.row.id)}
          size="small"
          sx={{
            minWidth: 0,
            padding: 0.5,
          }}
        >
          <ModeEditOutlineIcon fontSize="small" />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleDelete(params.row.id)}
          disabled={deletingId === params.row.id}
          size="small"
          sx={{
            minWidth: 0,
            padding: 0.5,
            color: "#DC2626",
          }}
        >
          <DeleteForeverIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  /* ============================================================
      DATAGRID ROWS (build public/vehicles/* src)
  ============================================================ */
  const truthy = (val) => val === true || val === "true";

  const rows = (allVehicles || [])
    .filter((v) => {
      if (!v) return false;
      const notDeleted = !(v.isDeleted === true || v.isDeleted === "true");
      const isApproved = truthy(v.isAdminApproved);
      return notDeleted && isApproved;
    })
    .map((v) => {
      // raw value from backend (array or string)
      const rawImage =
        Array.isArray(v.image) && v.image.length > 0 ? v.image[0] : v.image;

      const imageSrc = buildVehicleImageSrc(rawImage);

      return {
        id: v._id,
        image: imageSrc,
        registeration_number: v.registeration_number,
        company: v.company,
        name: v.name,
      };
    });

  /* ============================================================
      TOAST HANDLING
  ============================================================ */
  useEffect(() => {
    if (adminEditVehicleSuccess) toast.success("Edited successfully");
    else if (adminAddVehicleSuccess) toast.success("Added successfully");
    else if (adminCrudError) toast.error("Operation failed");
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(clearAdminVehicleToast());
    }, 3000);

    return () => clearTimeout(timeout);
  }, [
    adminEditVehicleSuccess,
    adminAddVehicleSuccess,
    adminCrudError,
    dispatch,
  ]);

  return (
    <>
      {(adminEditVehicleSuccess ||
        adminAddVehicleSuccess ||
        adminCrudError) && <Toaster />}

      <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none w-full">
        {/* Page header */}
        <Header category="Fleet" title="All Vehicles" />

        {/* Card wrapper for table */}
        <div
          className="
            bg-white
            rounded-2xl
            border border-gray-200
            shadow-sm
            p-3 sm:p-4
          "
        >
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 8 },
                },
              }}
              pageSizeOptions={[5, 8, 10]}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{
                border: "none",
                fontSize: "0.875rem",
                ".MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "&.MuiDataGrid-root": {
                  borderRadius: "0.75rem",
                  backgroundColor: "#FFFFFF",
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
                  backgroundColor: "#F5F7FF",
                },
                "& .MuiDataGrid-cell": {
                  paddingInline: "10px",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #E5E7EB",
                  backgroundColor: "#F9FAFB",
                },
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
}

export default AllVehicles;
