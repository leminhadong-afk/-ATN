import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/colorManagement`;

export class ColorManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static getColor = () => {
    return request({
      method: "GET",
      url: `${baseUrl}/get-all-color`
    });
  };

  static updateColor = (id, data) => {
    return request({
        method: "PUT",
        url: `${baseUrl}/update`, 
        data: data,
    });
};

static deleteColor = (id) => {
  return request({
    method: "DELETE",
    url: `${baseUrl}/delete/${id}`,
  });
};


}
