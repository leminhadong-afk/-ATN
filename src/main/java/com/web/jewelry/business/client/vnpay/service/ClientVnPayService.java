package com.web.jewelry.business.client.vnpay.service;

import com.web.jewelry.business.client.vnpay.request.ClientVnPayRequest;
import com.web.jewelry.business.client.vnpay.response.ClientVnPayResponse;

import java.util.Map;

public interface ClientVnPayService {
	ClientVnPayResponse createVnPayPayment(ClientVnPayRequest request, String returnUrl, String notifyUrl);
	Map<String, Object> handleVnPayCallback(Map<String, String> params);
}
