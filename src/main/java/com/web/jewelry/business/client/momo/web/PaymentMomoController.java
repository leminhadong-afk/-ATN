package com.web.jewelry.business.client.momo.web;

import com.web.jewelry.business.client.momo.request.CreatePaymentMomoDTO;
import com.web.jewelry.business.client.momo.service.PaymentMomoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/client/payment/momo")
@RequiredArgsConstructor
public class PaymentMomoController {

    private final PaymentMomoService paymentMomoService;

    @Value("${momo.return-url}")
    private String returnUrl;

    @Value("${momo.notify-url}")
    private String notifyUrl;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentMomoDTO createPaymentMomoDTO) {
        return ResponseEntity.ok(paymentMomoService.createMomoPayment(createPaymentMomoDTO.getBillId(),
                createPaymentMomoDTO.getAmount(), returnUrl, notifyUrl));
    }

    @PostMapping("/callback")
    public ResponseEntity<String> handleCallback(HttpServletRequest request) {
        return ResponseEntity.ok(paymentMomoService.handleMomoCallback(request));
    }

}

