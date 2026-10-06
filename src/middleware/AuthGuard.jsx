import jwt_decode from "jwt-decode";
import { Navigate } from "react-router";
import { useAppDispatch } from "../app/hook";
import { SetUserCurrent } from "../app/reducer/common/UserCurrent.reducer";
import { useEffect } from "react";

const clearUserInfo = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
  localStorage.removeItem("userCode");
  localStorage.removeItem("theme");
};

const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    clearUserInfo();
    return false;
  }
  try {
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp > currentTime) {
      return true;
    } else {
      clearUserInfo();
      return false;
    }
  } catch {
    clearUserInfo();
    return false;
  }
};

const MiddlewareRouter = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = checkAuth();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwt_decode(token);
        dispatch(SetUserCurrent(decodedToken));
      }
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated || role !== "ADMIN") {
    clearUserInfo();
    return <Navigate to="/" replace />; // Chuyển hướng về trang chủ
  }

  // Nếu xác thực thành công và role là ADMIN, render children
  return children;
};

export default MiddlewareRouter;
