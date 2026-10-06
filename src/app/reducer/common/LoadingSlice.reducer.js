import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const LoadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    SetLoading: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

export const { SetLoading } = LoadingSlice.actions;

export const GetLoading = (state) => state.loading;

export default LoadingSlice.reducer;
