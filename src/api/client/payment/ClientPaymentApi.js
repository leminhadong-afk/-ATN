import { request } from "../../../util/axios/request.helper";

const baseUrl = "/client/payment";

export class ClientPaymentApi {
  static createPayment = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data,
    });
  };
}
