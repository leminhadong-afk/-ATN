import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/couponManagement`;

export class CouponManagementApi {
  static searchCoupon = (filter) => {
    return request({
      method: "GET",
      url: `${baseUrl}/search`,
      params: filter,
    });
  };

  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static update = (data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/update`,
      data: data,
    });
  };
}
