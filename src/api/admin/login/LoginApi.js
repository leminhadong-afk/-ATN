import axios from "axios";
import { AppConfig } from "../../../AppConfig";
import { request } from "../../../util/axios/request.helper";

const baseUrl = `/auth`;

// Tạo axios riêng cho login, không interceptor
const loginAxios = axios.create({
  baseURL: AppConfig.apiUrl,
  withCredentials: true,
});

export class LoginApi {
  static login = (data) => {
    return loginAxios({
      method: "POST",
      url: `${baseUrl}/login`,
      data: data,
    });
  };

  static changePassword = (data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/change-password`,
      data: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  };
}
