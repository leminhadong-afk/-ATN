package com.web.jewelry.business.client.vnpay.web;

import com.web.jewelry.business.client.vnpay.request.ClientVnPayRequest;
import com.web.jewelry.business.client.vnpay.response.ClientVnPayResponse;
import com.web.jewelry.business.client.vnpay.service.ClientVnPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/client/payment/vnpay")
@RequiredArgsConstructor
public class ClientVnPayController {

	private final ClientVnPayService clientVnPayService;

	@Value("${vnpay.return-url}")
	private String returnUrl;

	@Value("${vnpay.notify-url}")
	private String notifyUrl;

	@PostMapping("/create")
	public ResponseEntity<ClientVnPayResponse> createPayment(@RequestBody ClientVnPayRequest request) {
		ClientVnPayResponse res = clientVnPayService.createVnPayPayment(request, returnUrl, notifyUrl);
		return ResponseEntity.ok(res);
	}

	@RequestMapping(value = "/callback", method = {RequestMethod.GET, RequestMethod.POST})
	public ResponseEntity<Map<String, Object>> handleCallback(@RequestParam Map<String, String> params) {
		Map<String, Object> result = clientVnPayService.handleVnPayCallback(params);
		return ResponseEntity.ok(result);
	}
}
