import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/billDetailsManagement`;

export class BillDetailsManagementApi {
  static infoBillDetails = (id) => {
    return request({
      method: "GET",
      url: `${baseUrl}/infoBillDetails/${id}`,
    });
  };

  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static updateDeleteFlag = (id) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/updateDeleteFlag/${id}`,
    });
  };

  static updateStatusBill = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/update-status`,
      data: data,
    });
  };

  static getAllSoldProducts = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/sold-products`,
      params: params,
    });
  };
};
