package com.web.jewelry.business.client.momo.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.jewelry.business.client.momo.service.PaymentMomoService;
import com.web.jewelry.dto.paymentMomo.MomoResponseDTO;
import com.web.jewelry.entity.BillEntity;
import com.web.jewelry.entity.PaymentTransactionEntity;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.PaymentTransactionRepository;
import com.web.jewelry.util.MomoUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentMomoServiceImpl implements PaymentMomoService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BillRepository billRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${momo.partner.code}")
    private String partnerCode;

    @Value("${momo.access.key}")
    private String accessKey;

    @Value("${momo.secret.key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String momoEndpoint;

    @Override
    public Map<String, Object> createMomoPayment(String billId, Double amount, String returnUrl, String notifyUrl) {
        try {
            BillEntity bill = billRepository.findById(billId).orElse(null);
            if (bill == null) {
                return Map.of("error", "Bill not found");
            }
            if (bill.getFinalAmount() == null || !bill.getFinalAmount().equals(amount)) {
                return Map.of("error", "Invalid amount");
            }

            amount = 1000D;

            String orderId = UUID.randomUUID().toString();
            String requestId = UUID.randomUUID().toString();

            String orderInfo = "Thanh toán đơn hàng ROYAL JEWELRY - " + billId;
            String rawSignature = String.format(
                    "accessKey=%s&amount=%s&extraData=&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=captureWallet",
                    accessKey, amount.longValue(), notifyUrl, orderId, orderInfo, partnerCode, returnUrl, requestId
            );

            String signature = MomoUtils.signHmacSHA256(rawSignature, secretKey);

            Map<String, Object> requestBody = new java.util.HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "ROYAL JEWELRY");
            requestBody.put("storeId", "RoyalJewelryStore");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", String.valueOf(amount.longValue()));
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", returnUrl);
            requestBody.put("ipnUrl", notifyUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", "");
            requestBody.put("requestType", "captureWallet");
            requestBody.put("signature", signature);

            RestTemplate restTemplate = new RestTemplate();
            MomoResponseDTO momoResponse = restTemplate.postForObject(momoEndpoint, requestBody, MomoResponseDTO.class);

            PaymentTransactionEntity tx = new PaymentTransactionEntity();
            tx.setBillId(billId);
            tx.setProvider("MOMO");
            tx.setOrderId(orderId);
            tx.setRequestId(requestId);
            tx.setAmount(amount);
            tx.setSignature(signature);
            tx.setStatus("CREATED");
            tx.setRawResponse(objectMapper.writeValueAsString(momoResponse));
            tx.setResultCode(momoResponse.getResultCode());
            tx.setMessage(momoResponse.getMessage());
            tx.setNotifyTime(new Date());
            paymentTransactionRepository.save(tx);

            return Map.of(
                    "payUrl", momoResponse.getPayUrl(),
                    "qrCodeUrl", momoResponse.getQrCodeUrl(),
                    "resultCode", momoResponse.getResultCode(),
                    "message", momoResponse.getMessage()
            );
        } catch (Exception e) {
            log.error("Error creating MoMo payment: ", e);
            return Map.of("error", e.getMessage());
        }
    }

    @Override
    public String handleMomoCallback(HttpServletRequest request) {
        try {
            String json = request.getReader().lines().reduce("", (acc, line) -> acc + line);
            Map<String, Object> data = objectMapper.readValue(json, Map.class);
            log.info("📥 Momo Callback: {}", json);

            String orderId = (String) data.get("orderId");
            Integer resultCode = (Integer) data.get("resultCode");
            String signature = (String) data.get("signature");

            PaymentTransactionEntity tx = paymentTransactionRepository.findByOrderId(orderId);
            if (tx == null) return "Transaction not found";

            tx.setRawResponse(json);
            tx.setResultCode(resultCode);
            tx.setSignature(signature);
            tx.setNotifyTime(new Date());

            BillEntity bill = null;
            if (tx.getBillId() != null) {
                bill = billRepository.findById(tx.getBillId()).orElse(null);
            }

            if (resultCode != null && resultCode == 0) {
                tx.setStatus("SUCCESS");
                if (bill != null) {
                    bill.setStatus(1);
                    bill.setDatePayment(new Date());
                    billRepository.save(bill);
                }
            } else {
                tx.setStatus("FAILED");
                if (bill != null) {
                    bill.setStatus(4); // 4: Đã hủy
                    billRepository.save(bill);
                }
            }

            paymentTransactionRepository.save(tx);
            return "success";
        } catch (Exception e) {
            log.error("Error handling Momo callback: ", e);
            return "fail";
        }
    }
}
