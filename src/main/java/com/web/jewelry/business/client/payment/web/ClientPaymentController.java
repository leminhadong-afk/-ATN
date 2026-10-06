package com.web.jewelry.business.client.payment.web;

import com.web.jewelry.business.client.payment.service.ClientPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.jewelry.business.client.payment.request.ClientPaymentRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@RestController
@RequestMapping("/client/payment")
@RequiredArgsConstructor
public class ClientPaymentController {

    private final ClientPaymentService clientPaymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody ClientPaymentRequest request) {
        return ResponseEntity.ok(clientPaymentService.createPayment(request));
    }

    @PostMapping("/cancel-cash-bill")
    public ResponseEntity<?> cancelCashPaymentBill(@RequestBody Map<String, String> request) {
        String billId = request.get("billId");
        return ResponseEntity.ok(clientPaymentService.cancelCashPaymentBill(billId));
    }
}

