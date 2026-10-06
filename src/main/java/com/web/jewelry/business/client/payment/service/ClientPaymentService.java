package com.web.jewelry.business.client.payment.service;

import com.web.jewelry.business.client.payment.request.ClientPaymentRequest;

import java.util.Map;

public interface ClientPaymentService {
	Map<String, Object> createPayment(ClientPaymentRequest request);

	// Hủy đơn hàng thanh toán khi nhận hàng (COD)
	Map<String, Object> cancelCashPaymentBill(String billId);
}
