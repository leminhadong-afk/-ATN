import { request } from "../../../util/axios/request.helper";

const baseUrl = `/client/cart`;

export class CartApi {
  static add = (data) => request({ method: "POST", url: `${baseUrl}/add`, data });
  static list = () => request({ method: "GET", url: `${baseUrl}/products` });
  static update = (data) => request({ method: "PUT", url: `${baseUrl}/update`, data });
  static remove = (cartDetailId) => request({ method: "DELETE", url: `${baseUrl}/remove/${cartDetailId}` });
  static count = () => request({ method: "GET", url: `${baseUrl}/count` });
}


