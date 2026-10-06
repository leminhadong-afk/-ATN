// util/auth.js
import { store } from "../app/store";
import { SetUserCurrent } from "../app/reducer/common/UserCurrent.reducer";
import { SetLoading } from "../app/reducer/common/LoadingSlice.reducer";

export const logout = (navigate) => {
  // Xóa thông tin trong localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("name");

  // Xóa trạng thái trong Redux
  store.dispatch(SetUserCurrent(null));
  store.dispatch(SetLoading(false));

  // Chuyển hướng về trang chủ
  navigate("/", { replace: true });
};
