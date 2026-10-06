import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/typeManagement`;

export class TypeProductManagementApi {
  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static getTypeOfJewelry = () => {
    return request({
      method: "GET",
      url: `${baseUrl}/get-all-type`,
    });
  };

  // Phương thức cập nhật loại trang sức
  static updateTypeOfJewelry = (id, data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/update`,
      data: data,
    });
  };

  // Phương thức cập nhật trạng thái loại trang sức
  static updateStatusTypeOfJewelry = (id, status) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/updateStatus`,
      params: { id, status },
    });
  };

  // Phương thức xóa loại trang sức
  static deleteTypeOfJewelry = (id) => {
    return request({
      method: "DELETE",
      url: `${baseUrl}/delete/${id}`,
    });
  };
}
