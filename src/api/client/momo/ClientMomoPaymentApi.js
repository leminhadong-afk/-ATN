import { request } from "../../../util/axios/request.helper";

const baseUrl = `/client/payment/momo`;

export class ClientMomoPaymentApi {
  static createPayment = (data) => {
    return request({
      method: "POST",
      url: `${baseUrl}/create`,
      data,
    });
  };
}
