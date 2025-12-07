import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  setCompanyData,
  setDistrictData,
  setLocationData,
  setModelData,
} from "../redux/adminSlices/adminDashboardSlice/CarModelDataSlice";
import { setWholeData } from "../redux/user/selectRideSlice";

const useFetchLocationsLov = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const fetchLov = useCallback(async () => {
    try {
      setIsLoading(true);

      // ✅ Use Vite proxy in dev: /api → backend
      const res = await fetch("/api/user/getLocationsLov", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error(
          "getLocationsLov failed:",
          res.status,
          text.slice(0, 200)
        );
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error(
          "getLocationsLov JSON parse error:",
          e,
          text.slice(0, 200)
        );
        return;
      }

      if (!Array.isArray(data)) {
        console.error("getLocationsLov: expected array, got:", data);
        return;
      }

      const locationRows = data.filter(
        (cur) => cur.district && cur.location
      );

      // Clear other LOV data
      dispatch(setModelData([]));
      dispatch(setCompanyData([]));

      // All locations
      dispatch(setLocationData(locationRows.map((cur) => cur.location)));

      // Unique districts
      const uniqueDistricts = [
        ...new Set(locationRows.map((cur) => cur.district)),
      ];
      dispatch(setDistrictData(uniqueDistricts));

      // Full rows (district + location)
      dispatch(setWholeData(locationRows));

      console.debug(
        "[useFetchLocationsLov] districts:",
        uniqueDistricts.length,
        "locations:",
        locationRows.length
      );
    } catch (error) {
      console.error("useFetchLocationsLov error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  return { fetchLov, isLoading };
};

export default useFetchLocationsLov;
