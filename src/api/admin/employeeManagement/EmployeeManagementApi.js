import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/employeeManagement`;

export class EmployeeManagementApi {
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
      data: filter
    });
  };


  static searchByData = (filter) => {
    return request({
      method: "GET",
      url: `${baseUrl}/searchAllInOne`,
      params: filter
    });
  };

  static update = (data) => {
    return request({
        method: "PUT",
        url: `${baseUrl}/update`, 
        data: data,
    });
};

static updateDeleteFlagEmployee = (id, deleteFlag) => {
  return request({
    method: "PUT",
    url: `${baseUrl}/updateStatus`,
    params: {id,deleteFlag},
  });
};

}
