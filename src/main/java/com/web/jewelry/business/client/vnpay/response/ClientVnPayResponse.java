package com.web.jewelry.business.client.vnpay.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientVnPayResponse {
	private String payUrl;
	private String transactionNo;
	private String message;
	private Integer resultCode;
}
