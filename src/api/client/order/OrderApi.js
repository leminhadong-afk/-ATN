import { request } from "../../../util/axios/request.helper";

const baseUrl = `/client/orders`;

export class OrderApi {
  // Lấy danh sách đơn hàng của khách hàng hiện tại
  static getMyOrders = () => {
    return request({
      method: "GET",
      url: `${baseUrl}`,
    });
  };

  // Lấy chi tiết đơn hàng theo ID
  static getOrderDetail = (billId) => {
    return request({
      method: "GET",
      url: `${baseUrl}/${billId}`,
    });
  };

  static cancelOrder = (billId, data) => {
    return request({
      method: "PUT",
      url: `${baseUrl}/${billId}/cancel`,
      data,
    });
  };

  // Hủy đơn hàng thanh toán khi nhận hàng (COD)
  static cancelCashBill = (data) => {
    return request({
      method: "POST",
      url: `/client/payment/cancel-cash-bill`,
      data,
    });
  };

  // Tải xuống hóa đơn PDF
  static downloadOrderPDF = (billId) => {
    return request({
      method: "GET",
      url: `${baseUrl}/${billId}/pdf`,
      responseType: "blob", // Important for binary data
    });
  };
}

