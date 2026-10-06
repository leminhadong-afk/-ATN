import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/productManagement`;

export class ProductManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static getProducts = (filter) => {
    return request({
      method: "GET",
      url: `${baseUrl}/search`,
      params: filter,
    });
  };

  static updateStatusProduct = (id, status) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/updateStatus?id=${id}&status=${status}`,
    });
  };

  static updateNameAndStatusProduct = (id, name, status) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/updateNameAndStatus?id=${id}&name=${name}&status=${status}`,
    });
  };

  static getProductStatistics = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/statistics`,
      params: params,
    });
  };

  static getBestSaleProduct = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/top-sold-products`,
      params: params,
    });
  };
}
