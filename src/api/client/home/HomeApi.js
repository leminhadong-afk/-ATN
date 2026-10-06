import { request } from "../../../util/axios/request.helper";

const baseUrl = `/client/home`;

export class HomeApi {
  static getProductOverview = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/products/overview`,
      params,
    });
  };

  static getProductFilters = () => {
    return request({
      method: "GET",
      url: `/client/meta/product-filters`,
    });
  };

  static getNewArrivals = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/products/new`,
      params,
    });
  };

  static getBestSellers = (params) => {
    return request({
      method: "GET",
      url: `${baseUrl}/products/bestseller`,
      params,
    });
  };
}


