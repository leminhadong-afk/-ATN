import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/billHistoryManagement`;

export class BillHistoryManagementApi {

  static infoBillHistory = (id) => {
    return request({
      method: "GET",
      url: `${baseUrl}/infoBillHistory/${id}`,
    });
  };

};
