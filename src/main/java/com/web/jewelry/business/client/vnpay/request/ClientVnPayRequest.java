package com.web.jewelry.business.client.vnpay.request;

import lombok.Data;

@Data
public class ClientVnPayRequest {
	private String billId;
	private Double amount;
}
