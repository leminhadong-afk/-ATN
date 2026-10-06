import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/materialManagement`;

export class MaterialManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static getMaterial = () => {
    return request({
      method: "GET",
      url: `${baseUrl}/get-all-materials`,
    });
  };

  static updateMaterial = (id, data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/update`,
      data: data,
    });
  };

  static updateStatusMaterial = (id, status) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/updateStatus`,
      params: { id, status },
    });
  };
  

  static deleteMaterial = (id) => {
    return request({
      method: "DELETE",
      url: `${baseUrl}/delete/${id}`,
    });
  };
}
