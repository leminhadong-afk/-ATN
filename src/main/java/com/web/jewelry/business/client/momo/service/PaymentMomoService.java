package com.web.jewelry.business.client.momo.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface PaymentMomoService {
    Map<String, Object> createMomoPayment(String billId, Double amount, String returnUrl, String notifyUrl);
    String handleMomoCallback(HttpServletRequest request);
}
