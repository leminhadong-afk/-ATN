import { request } from "../../../util/axios/request.helper";

const baseUrl = `/client/user`;

export class UserApi {
  static getInfo = () => request({ method: "GET", url: `${baseUrl}/info` });
  static updateInfo = (data) => request({ method: "PUT", url: `${baseUrl}/update`, data });
  static changePassword = (data) => request({ method: "PUT", url: `${baseUrl}/change-password`, data });
}

