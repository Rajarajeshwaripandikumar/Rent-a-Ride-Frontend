// src/components/Filter.jsx
import React, { useRef, useState, useCallback, useMemo } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setFilteredData } from "../redux/user/sortfilterSlice";

/**
 * Robust Filter component
 * - Derives car types & transmissions from actual data (userAllVehicles / allVariants)
 * - Debounced API call + loading state
 * - Sends payload: { car_type: [...], transmission: [...] }
 * - Client-side fallback filtering when backend fails
 */

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "" // use relative path (configure Vite proxy) in dev
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

// fallback lists (kept as suggestions)
const FALLBACK_CAR_TYPES = [
  "hypercar",
  "supercar",
  "speedster",
  "coupe",
  "roadster",
  "convertible",
  "sportscar",
  "tuner",
  "speedster",
];
const FALLBACK_TRANSMISSIONS = ["automatic", "manual"];

const normalizeString = (v = "") =>
  String(v || "").toString().trim().toLowerCase();

const uniqueArray = (arr) =>
  Array.from(new Set((arr || []).map((x) => String(x).trim()).filter(Boolean)));

const Filter = () => {
  const { control, handleSubmit, reset } = useForm();
  const { userAllVehicles, allVariants } = useSelector(
    (state) => state.userListVehicles || {}
  );
  const { variantMode } = useSelector((state) => state.sortfilterSlice || {});

  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const debounceRef = useRef(null);

  // Helper: choose the best source array (prefer allVariants when present)
  const sourceData = Array.isArray(allVariants) && allVariants.length
    ? allVariants
    : Array.isArray(userAllVehicles) && userAllVehicles.length
    ? userAllVehicles
    : [];

  // DERIVE car types & transmissions from sourceData (fallback to constants)
  const derivedCarTypes = useMemo(() => {
    if (!Array.isArray(sourceData) || sourceData.length === 0) return FALLBACK_CAR_TYPES;
    const types = sourceData.map((it) => normalizeString(it?.car_type ?? it?.__raw?.car_type ?? ""));
    const uniq = uniqueArray(types).filter(Boolean);
    return uniq.length ? uniq : FALLBACK_CAR_TYPES;
  }, [sourceData]);

  const derivedTransmissions = useMemo(() => {
    if (!Array.isArray(sourceData) || sourceData.length === 0) return FALLBACK_TRANSMISSIONS;
    const tr = sourceData.map((it) =>
      normalizeString(it?.transmission ?? it?.transmition ?? it?.__raw?.transmission ?? "")
    );
    const uniq = uniqueArray(tr).filter(Boolean);
    return uniq.length ? uniq : FALLBACK_TRANSMISSIONS;
  }, [sourceData]);

  // Local client-side filter fallback
  const localFilter = useCallback(
    (items, selectedTypes = [], selectedTrans = []) => {
      if (!Array.isArray(items)) return [];
      let list = items;

      if (Array.isArray(selectedTypes) && selectedTypes.length) {
        const setTypes = new Set(selectedTypes.map((s) => normalizeString(s)));
        list = list.filter((it) => {
          const ct = normalizeString(it?.car_type ?? it?.__raw?.car_type ?? "");
          return setTypes.has(ct);
        });
      }

      if (Array.isArray(selectedTrans) && selectedTrans.length) {
        const setTrans = new Set(selectedTrans.map((s) => normalizeString(s)));
        list = list.filter((it) => {
          const tr = normalizeString(it?.transmission ?? it?.transmition ?? it?.__raw?.transmission ?? "");
          return setTrans.has(tr);
        });
      }

      return list;
    },
    []
  );

  // Debounced submit handler
  const handleData = useCallback(
    (formData) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        // derive selected values based on derived lists
        const keys = Object.keys(formData || {}).filter((k) => formData[k] === true);

        const selectedTypes = keys.filter((k) =>
          derivedCarTypes.includes(normalizeString(k))
        ).map((k) => normalizeString(k));

        const selectedTrans = keys.filter((k) =>
          derivedTransmissions.includes(normalizeString(k))
        ).map((k) => normalizeString(k));

        console.log("[Filter] selectedTypes:", selectedTypes, "selectedTrans:", selectedTrans);

        // Reset if nothing selected and not variantMode
        if (!selectedTypes.length && !selectedTrans.length && !variantMode) {
          dispatch(setFilteredData(userAllVehicles || []));
          return;
        }

        setIsLoading(true);

        // request payload easy for backend
        const body = {};
        if (selectedTypes.length) body.car_type = selectedTypes;
        if (selectedTrans.length) body.transmission = selectedTrans;
        if (variantMode) body.variantMode = true;

        try {
          const res = await fetch(`${API_BASE_URL}/api/user/filterVehicles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          console.log("[Filter] API status:", res.status);

          const text = await res.text().catch(() => null);
          let json = null;
          if (text) {
            try {
              json = JSON.parse(text);
            } catch (err) {
              console.warn("[Filter] failed to parse JSON:", err);
            }
          }

          if (!res.ok) {
            console.warn("[Filter] server returned non-OK:", res.status, json);
            const fallback = localFilter(sourceData, selectedTypes, selectedTrans);
            dispatch(setFilteredData(fallback));
            return;
          }

          // accept multiple shapes from backend
          let filtData = null;
          if (Array.isArray(json)) filtData = json;
          else if (Array.isArray(json?.data?.filteredVehicles)) filtData = json.data.filteredVehicles;
          else if (Array.isArray(json?.filteredVehicles)) filtData = json.filteredVehicles;
          else if (Array.isArray(json?.data)) filtData = json.data;
          else if (Array.isArray(json?.vehicles)) filtData = json.vehicles;

          if (!Array.isArray(filtData)) {
            console.warn("[Filter] unexpected server response shape, falling back to client filter:", json);
            const fallback = localFilter(sourceData, selectedTypes, selectedTrans);
            dispatch(setFilteredData(fallback));
            return;
          }

          // If allVariants exist, intersect on _id
          if (Array.isArray(allVariants) && allVariants.length > 0) {
            const filteredData = filtData.filter((item) =>
              allVariants.some((variant) => String(variant._id) === String(item._id))
            );
            dispatch(setFilteredData(filteredData));
            return;
          }

          dispatch(setFilteredData(filtData));
        } catch (err) {
          console.error("[Filter] fetch error:", err);
          const fallback = localFilter(sourceData, selectedTypes, selectedTrans);
          dispatch(setFilteredData(fallback));
        } finally {
          setIsLoading(false);
        }
      }, 250);
    },
    [API_BASE_URL, allVariants, derivedCarTypes, derivedTransmissions, dispatch, localFilter, sourceData, userAllVehicles, variantMode]
  );

  const handleToggle = () => setFilterOpen((s) => !s);
  const handleReset = () => {
    reset();
    dispatch(setFilteredData(userAllVehicles || []));
  };

  return (
    <aside className="sticky top-24 w-full">
      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-md px-4 py-4 sm:px-5 sm:py-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            
            <p className="text-[11px] text-slate-500 hidden sm:block">Refine vehicles by type & transmission</p>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-lg shadow-sm hover:bg-slate-100 transition"
            aria-label="Toggle filters"
          >
            <span className={`transition-transform duration-200 ${filterOpen ? "rotate-45" : "rotate-0"}`}>+</span>
          </button>
        </div>

        {/* Content wrapper: make scrollable when open to avoid clipping */}
        <div
          className={`transition-all duration-300 ${filterOpen ? "max-h-[520px] mt-4" : "max-h-0"}`}
          style={{ overflow: filterOpen ? "auto" : "hidden", paddingRight: filterOpen ? 8 : 0 }}
        >
          <form onSubmit={handleSubmit(handleData)} className="space-y-6">
            {/* Car Type */}
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-[0.14em]">Type</h3>
              <FormGroup>
                {derivedCarTypes.map((type) => {
                  const label = String(type).charAt(0).toUpperCase() + String(type).slice(1);
                  return (
                    <FormControlLabel
                      key={`type-${type}`}
                      control={
                        <Controller
                          name={type}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              {...field}
                              checked={field.value ?? false}
                              sx={{ "&.Mui-checked": { color: "#0071DC" }, "&:hover": { backgroundColor: "transparent" } }}
                            />
                          )}
                        />
                      }
                      label={<span className="text-sm text-slate-700">{label}</span>}
                    />
                  );
                })}
              </FormGroup>
            </div>

            {/* Transmission */}
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-[0.14em]">Transmission</h3>
              <FormGroup>
                {derivedTransmissions.map((t) => {
                  const label = String(t).charAt(0).toUpperCase() + String(t).slice(1);
                  return (
                    <FormControlLabel
                      key={`tr-${t}`}
                      control={
                        <Controller
                          name={t}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              {...field}
                              checked={field.value ?? false}
                              sx={{ "&.Mui-checked": { color: "#0071DC" }, "&:hover": { backgroundColor: "transparent" } }}
                            />
                          )}
                        />
                      }
                      label={<span className="text-sm text-slate-700">{label}</span>}
                    />
                  );
                })}
              </FormGroup>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 mt-2 rounded-xl text-white text-sm font-semibold py-2.5 shadow-sm transition ${isLoading ? "bg-[#7FB0FF] cursor-wait" : "bg-[#0071DC] hover:bg-[#0654BA]"}`}
              >
                {isLoading ? "Applying..." : "Apply Filters"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="mt-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold py-2.5 px-4 hover:bg-slate-50 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  );
};

export default Filter;
