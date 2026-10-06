import { request } from "../../helper/axios/request.helper";

const baseUrl = `/auth`;

export class AuthenticationApi {
  static login = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/login`,
      data: data,
    });
  };
}
