import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

/* -----------------------------------------------------------
   Resolve image path safely
   Ensures images in public/vehicles/ load without blinking
------------------------------------------------------------ */
const PLACEHOLDER_IMG = "/vehicles/home.webp"; // make sure this exists

const resolveVehicleImage = (img) => {
  if (!img) return PLACEHOLDER_IMG;

  let value = img;

  // If backend sends object/array instead of plain string
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

  if (typeof value !== "string") return PLACEHOLDER_IMG;

  const trimmed = value.trim();
  if (!trimmed) return PLACEHOLDER_IMG;

  // Full URL (CDN)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Already a /vehicles/... path
  if (trimmed.startsWith("/vehicles/")) {
    return trimmed;
  }

  // Take last segment: handles "uploads/vehicles/foo.jpg"
  let fileName = trimmed.split(/[/\\]/).pop() || trimmed;

  // Strip "vehicles/" if present inside
  fileName = fileName.replace(/^\/?vehicles\//, "");

  // If no extension, assume .jpg (your images are JPG)
  if (!fileName.includes(".")) {
    fileName = `${fileName}.jpg`;
  }

  return `/vehicles/${fileName}`;
};

const BookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  /* -----------------------------------------------------------
     Fetch Admin Bookings
  ------------------------------------------------------------ */
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/allBookings", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("[BookingsTable] allBookings failed:", txt);
        setErrorMsg("Failed to load bookings.");
        setBookings([]);
        return;
      }

      const raw = await res.json();

      console.log("[BookingsTable] raw API response:", raw);

      let list = [];

      if (Array.isArray(raw)) list = raw;
      else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) list = raw.data;
        else if (Array.isArray(raw.bookings)) list = raw.bookings;
        else if (Array.isArray(raw.allBookings)) list = raw.allBookings;
        else {
          const firstArrayProp = Object.values(raw).find((v) =>
            Array.isArray(v)
          );
          list = firstArrayProp || [];
        }
      }

      console.log("[BookingsTable] parsed list:", list);
      setBookings(list);
      setErrorMsg(null);
    } catch (error) {
      console.error("[BookingsTable] fetch error:", error);
      setErrorMsg("Error loading bookings.");
      setBookings([]);
    }
  };

  /* -----------------------------------------------------------
     Change Status Handler
  ------------------------------------------------------------ */
  const handleStatusChange = (e, params) => {
    const newStatus = e.target.value;
    const bookingId = params.id;

    const changeVehicleStatus = async () => {
      try {
        const res = await fetch("/api/admin/changeStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookingId, status: newStatus }),
        });

        if (!res.ok) {
          console.warn("[BookingsTable] changeStatus failed");
          return;
        }

        fetchBookings();
      } catch (error) {
        console.log(error);
      }
    };

    changeVehicleStatus();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* -----------------------------------------------------------
     Helpers
  ------------------------------------------------------------ */
  const formatDate = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "—";

    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  /* -----------------------------------------------------------
     DataGrid Columns
  ------------------------------------------------------------ */
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="vehicle"
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
          onError={(e) => {
            // one-time fallback so it can't loop
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      ),
    },
    { field: "Pickup_Location", headerName: "Pickup Location", width: 160 },

    {
      field: "Pickup_Date",
      headerName: "Pickup Date",
      width: 150,
      renderCell: (params) => formatDate(params.value),
    },

    {
      field: "Dropoff_Location",
      headerName: "Dropoff Location",
      width: 160,
    },
    {
      field: "Dropoff_Date",
      headerName: "Dropoff Date",
      width: 150,
      renderCell: (params) => formatDate(params.value),
    },

    {
      field: "Vehicle_Status",
      headerName: "Vehicle Status",
      width: 150,
      renderCell: (params) => (
        <span className="inline-flex items-center justify-center px-3 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          {params.value}
        </span>
      ),
    },

    {
      field: "Change_Status",
      headerName: "Change Status",
      width: 180,
      renderCell: (params) => (
        <select
          className="
            px-3 py-1.5 text-xs sm:text-sm rounded-lg
            border border-gray-300 bg-white text-gray-700
            focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 focus:border-[#1D4ED8]
          "
          value={params.value}
          onChange={(e) => handleStatusChange(e, params)}
        >
          {[
            "notBooked",
            "booked",
            "onTrip",
            "notPicked",
            "canceled",
            "overDue",
            "tripCompleted",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
  ];

  /* -----------------------------------------------------------
     Convert bookings → rows safely (better image picking)
  ------------------------------------------------------------ */
  const rows = Array.isArray(bookings)
    ? bookings.map((cur) => {
        const vd =
          cur.vehicleDetails ||
          cur.vehicle ||
          cur.car ||
          {}; // fallbacks if backend uses different key

        let rawImage = null;

        if (Array.isArray(vd.image) && vd.image.length) {
          rawImage = vd.image[0];
        } else if (Array.isArray(vd.images) && vd.images.length) {
          rawImage = vd.images[0];
        } else if (typeof vd.image === "string" && vd.image) {
          rawImage = vd.image;
        } else if (typeof vd.img === "string" && vd.img) {
          rawImage = vd.img;
        } else if (typeof vd.photo === "string" && vd.photo) {
          rawImage = vd.photo;
        } else if (typeof cur.image === "string" && cur.image) {
          rawImage = cur.image;
        } else if (
          typeof cur.vehicleImage === "string" &&
          cur.vehicleImage
        ) {
          rawImage = cur.vehicleImage;
        }

        // Debug: see what we actually picked
        console.log(
          "[BookingsTable] booking",
          cur._id,
          "rawImage:",
          rawImage
        );

        return {
          id: cur._id,
          image: resolveVehicleImage(rawImage),

          Pickup_Location:
            cur.pickUpLocation ||
            cur.pickupLocation ||
            cur.pickup_location ||
            cur.fromLocation ||
            cur.from_location,

          Pickup_Date:
            cur.pickupDate ||
            cur.pickUpDate ||
            cur.startDate ||
            cur.fromDate ||
            cur.start_date,

          Dropoff_Location:
            cur.dropOffLocation ||
            cur.dropoffLocation ||
            cur.dropoff_location ||
            cur.toLocation ||
            cur.to_location,

          Dropoff_Date:
            cur.dropOffDate ||
            cur.dropoffDate ||
            cur.endDate ||
            cur.toDate ||
            cur.end_date,

          Vehicle_Status: cur.status,
          Change_Status: cur.status,
        };
      })
    : [];

  /* -----------------------------------------------------------
     UI
  ------------------------------------------------------------ */
  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Bookings
            </p>
            <p className="text-sm md:text-base font-semibold text-slate-800">
              Active & past vehicle bookings
            </p>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
            )}
          </div>
        </div>

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

              ".MuiDataGrid-columnSeparator": { display: "none" },

              "&.MuiDataGrid-root": {
                borderRadius: "0.75rem",
                backgroundColor: "#FFFFFF",
              },

              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                fontWeight: 600,
                fontSize: "0.78rem",
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
  );
};

export default BookingsTable;
