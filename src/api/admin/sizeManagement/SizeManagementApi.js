import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/sizeManagement`;

export class SizeManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static getSize = (typeProductId) => {
    return request({
      method: "GET",
      url: `${baseUrl}/get-all-size?typeProductId=${typeProductId}`,
    });
  };

  static updateSizer = (id, data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/update`,
      data: data,
    });
  };

  static deleteSize = (id) => {
    return request({
      method: "DELETE",
      url: `${baseUrl}/delete/${id}`,
    });
  };
}
