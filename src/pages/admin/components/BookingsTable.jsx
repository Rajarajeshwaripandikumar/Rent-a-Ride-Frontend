import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { api } from "../../../api"; // ⭐ USE CENTRAL API WRAPPER

/* -----------------------------------------------------------
   Image resolver
------------------------------------------------------------ */
const PLACEHOLDER_IMG = "/vehicles/home.webp";

const resolveVehicleImage = (img) => {
  if (!img) return PLACEHOLDER_IMG;

  let v = img;

  if (typeof v === "object") {
    v =
      v.url ||
      v.path ||
      v.filename ||
      v.fileName ||
      v.name ||
      (Array.isArray(v) ? v[0] : "");
  }

  if (typeof v !== "string") return PLACEHOLDER_IMG;

  const t = v.trim();
  if (!t) return PLACEHOLDER_IMG;

  if (t.startsWith("http")) return t;
  if (t.startsWith("/vehicles/")) return t;

  let fileName = t.split(/[/\\]/).pop() || t;
  fileName = fileName.replace(/^\/?vehicles\//, "");
  if (!fileName.includes(".")) fileName += ".jpg";

  return `/vehicles/${fileName}`;
};

const BookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  /* -----------------------------------------------------------
     FETCH BOOKINGS (FIXED — uses api.get)
  ------------------------------------------------------------ */
  const fetchBookings = async () => {
    try {
      const raw = await api.get("/api/admin/allBookings"); // ⭐ auto token

      let list = [];

      if (Array.isArray(raw)) list = raw;
      else if (raw?.bookings) list = raw.bookings;
      else if (raw?.allBookings) list = raw.allBookings;
      else if (raw?.data) list = raw.data;
      else {
        const firstArray = Object.values(raw).find((v) => Array.isArray(v));
        list = firstArray || [];
      }

      setBookings(list);
      setErrorMsg(null);
    } catch (err) {
      console.error("[BookingsTable] error:", err);
      setErrorMsg("Failed to load bookings");
      setBookings([]);
    }
  };

  /* -----------------------------------------------------------
     CHANGE STATUS (FIXED — uses api.post)
  ------------------------------------------------------------ */
  const handleStatusChange = async (e, params) => {
    const newStatus = e.target.value;
    const bookingId = params.id;

    try {
      await api.post("/api/admin/changeStatus", {
        id: bookingId,
        status: newStatus,
      });

      fetchBookings();
    } catch (err) {
      console.error("[BookingsTable] changeStatus failed:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* -----------------------------------------------------------
     Formatting
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
     Build DataGrid rows
  ------------------------------------------------------------ */
  const rows = bookings.map((cur) => {
    const vd =
      cur.vehicleDetails ||
      cur.vehicle ||
      cur.car ||
      {};

    let rawImage = null;

    if (Array.isArray(vd.image) && vd.image.length) rawImage = vd.image[0];
    else if (Array.isArray(vd.images) && vd.images.length) rawImage = vd.images[0];
    else if (typeof vd.image === "string") rawImage = vd.image;
    else if (typeof vd.img === "string") rawImage = vd.img;
    else if (typeof vd.photo === "string") rawImage = vd.photo;
    else if (typeof cur.image === "string") rawImage = cur.image;

    return {
      id: cur._id,
      image: resolveVehicleImage(rawImage),

      Pickup_Location:
        cur.pickUpLocation ||
        cur.pickupLocation ||
        cur.fromLocation ||
        cur.from_location,

      Pickup_Date:
        cur.pickupDate ||
        cur.startDate ||
        cur.fromDate,

      Dropoff_Location:
        cur.dropOffLocation ||
        cur.dropoffLocation ||
        cur.toLocation,

      Dropoff_Date:
        cur.dropoffDate ||
        cur.endDate ||
        cur.toDate,

      Vehicle_Status: cur.status,
      Change_Status: cur.status,
    };
  });

  /* -----------------------------------------------------------
     Columns
  ------------------------------------------------------------ */
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 100,
      renderCell: (p) => (
        <img
          src={p.value}
          alt="vehicle"
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
          onError={(e) => {
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
      renderCell: (p) => formatDate(p.value),
    },

    { field: "Dropoff_Location", headerName: "Dropoff Location", width: 160 },

    {
      field: "Dropoff_Date",
      headerName: "Dropoff Date",
      width: 150,
      renderCell: (p) => formatDate(p.value),
    },

    {
      field: "Vehicle_Status",
      headerName: "Vehicle Status",
      width: 150,
      renderCell: (p) => (
        <span className="inline-flex items-center px-3 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          {p.value}
        </span>
      ),
    },

    {
      field: "Change_Status",
      headerName: "Change Status",
      width: 180,
      renderCell: (params) => (
        <select
          value={params.value}
          onChange={(e) => handleStatusChange(e, params)}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700"
        >
          {[
            "notBooked",
            "booked",
            "onTrip",
            "notPicked",
            "canceled",
            "overDue",
            "tripCompleted",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
          Bookings
        </p>
        <p className="text-sm font-semibold text-slate-800 mb-2">
          Active & Past Vehicle Bookings
        </p>
        {errorMsg && (
          <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
        )}

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
          />
        </Box>
      </div>
    </div>
  );
};

export default BookingsTable;
