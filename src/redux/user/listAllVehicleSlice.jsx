import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userAllVehicles: [],
    singleVehicleDetail: '',
    allVariants: []  // ✅ FIXED (must be array)
};

const listAllVehicles = createSlice({
    name: "userListVehicles",
    initialState,
    reducers: {
        showVehicles: (state, action) => {
            state.userAllVehicles = action.payload;
        },
        setVehicleDetail: (state, action) => {
            state.singleVehicleDetail = action.payload;
        },
        setVariants: (state, action) => {
            // ALWAYS store array
            state.allVariants = Array.isArray(action.payload) ? action.payload : [];
        },
    },
});

export const { showVehicles, setVehicleDetail, setVariants } = listAllVehicles.actions;
export default listAllVehicles.reducer;
