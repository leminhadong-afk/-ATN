import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/customerManagement`;

export class CustomerManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static search = (filter) => {
    return request({
      method: "GET",
      url: `${baseUrl}/search`,
      params: filter,
    });
  };

  static update = (data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/update`,
      data: data,
    });
  };

  static updateDeleteFlagCustomer = (id, deleteFlag) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/updateStatus`,
      params: { id, deleteFlag },
    });
  };

  static getLoyalCustomer = (params = {}) => {
    return request({
      method: "GET",
      url: `${baseUrl}/statistics`,
      params: params,
    });
  };
}
