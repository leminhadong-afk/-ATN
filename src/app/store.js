import { configureStore } from "@reduxjs/toolkit";
import AdCollapsedSliceReducer from "./reducer/admin/AdCollapsedSlice.reducer";
import LoadingSliceReducer from "./reducer/common/LoadingSlice.reducer";
import UserCurrentReducer from "./reducer/common/UserCurrent.reducer";

export const store = configureStore({
  reducer: {
    adCollapsed: AdCollapsedSliceReducer,
    loading: LoadingSliceReducer,
    userCurrent: UserCurrentReducer,
  },
});

export const dispatch = store.dispatch;
export const getState = store.getState;
