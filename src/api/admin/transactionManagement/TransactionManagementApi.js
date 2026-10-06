import { request } from "../../../util/axios/request.helper";

const baseUrl = `/admin/transactionManagement`;

export class TransactionManagementApi {
  static getTransaction = (id) => {
    return request({
      method: "GET",
      url: `${baseUrl}/transaction/${id}`,
    });
  };

  static create = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data: data,
    });
  };

  static deleteTransaction = (id) => {
    return request({
      method: "DELETE",
      url: `${baseUrl}/delete/${id}`,
    });
  };
}
