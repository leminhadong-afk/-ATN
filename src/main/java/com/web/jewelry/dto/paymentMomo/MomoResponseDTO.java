package com.web.jewelry.dto.paymentMomo;

import lombok.Data;

@Data
public class MomoResponseDTO {
    private String partnerCode;
    private String orderId;
    private String requestId;
    private String amount;
    private String responseTime;
    private String message;
    private Integer resultCode;
    private String payUrl;
    private String deeplink;
    private String qrCodeUrl;
    private String signature;
    private String transId;
}
