import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/productDetail`;

export class ProductDetailManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };
  
  static getProductDetails = (filter) => {
    return request({
      method: "GET",
      url: `${baseUrl}/search`,
      params: filter
    });
  };

  static getAllProductDetails = () => {
    return request({
      method: "GET",
      url: `${baseUrl}/getAll`
    });
  };

  static saveListProductDetail = (data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/saveList`,
      data: data
    });
  }

  

}