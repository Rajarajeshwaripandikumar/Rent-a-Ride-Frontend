// Sort.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { setFilteredData } from "../redux/user/sortfilterSlice";

const Sort = () => {
  const dispatch = useDispatch();
  const { userAllVehicles, allVariants } = useSelector(
    (state) => state.userListVehicles || {}
  );

  const { control, watch } = useForm({
    defaultValues: {
      price: "",
      year: "",
    },
  });

  const watchedPrice = watch("price");
  const watchedYear = watch("year");

  const baseList =
    Array.isArray(allVariants) && allVariants.length > 0
      ? allVariants
      : Array.isArray(userAllVehicles)
      ? userAllVehicles
      : [];

  useEffect(() => {
    let list = Array.isArray(baseList) ? [...baseList] : [];

    if (watchedPrice === "lowtohigh") {
      list.sort((a, b) => {
        const pa = Number(a?.pricePerDay ?? a?.price ?? 0);
        const pb = Number(b?.pricePerDay ?? b?.price ?? 0);
        return pa - pb;
      });
    } else if (watchedPrice === "hightolow") {
      list.sort((a, b) => {
        const pa = Number(a?.pricePerDay ?? a?.price ?? 0);
        const pb = Number(b?.pricePerDay ?? b?.price ?? 0);
        return pb - pa;
      });
    }

    if (watchedYear === "yearAscending") {
      list.sort((a, b) => {
        const ya = Number(a?.year ?? 0);
        const yb = Number(b?.year ?? 0);
        return ya - yb;
      });
    } else if (watchedYear === "yearDecending") {
      list.sort((a, b) => {
        const ya = Number(a?.year ?? 0);
        const yb = Number(b?.year ?? 0);
        return yb - ya;
      });
    }

    dispatch(setFilteredData(list));
  }, [watchedPrice, watchedYear, allVariants, userAllVehicles, dispatch]);

  return (
    // 🔧 was: "w-full flex justify-center lg:justify-start mb-2"
    <div className="w-full mb-2">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="
          w-full
          flex flex-wrap items-center gap-3
          rounded-2xl
          border border-gray-200
          bg-white
          shadow-md
          px-4 py-3
        "
      >
        

        {/* Price Sort */}
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <TextField
              {...field}
              id="price"
              select
              label="Price"
              size="small"
              value={field.value ?? ""}
              sx={{
                minWidth: 140,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  backgroundColor: "#F9FAFB",
                  fontSize: "0.8rem",
                  "& fieldset": {
                    borderColor: "#D1D5DB",
                  },
                  "&:hover fieldset": {
                    borderColor: "#0071DC",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0071DC",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.8rem",
                },
              }}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="lowtohigh">Price: Low to High</MenuItem>
              <MenuItem value="hightolow">Price: High to Low</MenuItem>
            </TextField>
          )}
        />

        {/* Year Sort */}
        <Controller
          control={control}
          name="year"
          render={({ field }) => (
            <TextField
              {...field}
              id="year"
              select
              label="Year"
              size="small"
              value={field.value ?? ""}
              sx={{
                minWidth: 140,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  backgroundColor: "#F9FAFB",
                  fontSize: "0.8rem",
                  "& fieldset": {
                    borderColor: "#D1D5DB",
                  },
                  "&:hover fieldset": {
                    borderColor: "#0071DC",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0071DC",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.8rem",
                },
              }}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="yearAscending">Year: Low to High</MenuItem>
              <MenuItem value="yearDecending">Year: High to Low</MenuItem>
            </TextField>
          )}
        />
      </form>
    </div>
  );
};

export default Sort;
