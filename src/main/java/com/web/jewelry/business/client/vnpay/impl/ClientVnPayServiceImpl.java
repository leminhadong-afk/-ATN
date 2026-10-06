package com.web.jewelry.business.client.vnpay.impl;

import com.web.jewelry.business.client.vnpay.request.ClientVnPayRequest;
import com.web.jewelry.business.client.vnpay.response.ClientVnPayResponse;
import com.web.jewelry.business.client.vnpay.service.ClientVnPayService;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillEntity;
import com.web.jewelry.entity.BillHistoryEntity;
import com.web.jewelry.entity.ProductDetailEntity;
import com.web.jewelry.entity.TransactionEntity;
import com.web.jewelry.repository.BillDetailRepository;
import com.web.jewelry.repository.BillHistoryRepository;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import com.web.jewelry.repository.TransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TimeZone;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientVnPayServiceImpl implements ClientVnPayService {

    private final BillRepository billRepository;
    private final TransactionRepository transactionRepository;
    private final BillDetailRepository billDetailRepository;
    private final BillHistoryRepository billHistoryRepository;
    private final ProductDetailRepository productDetailRepository;

    @Value("${vnpay.vnp_TmnCode}")
    private String vnpTmnCode;
    @Value("${vnpay.vnp_HashSecret}")
    private String vnpHashSecret;
    @Value("${vnpay.vnp_Url}")
    private String vnpUrl;

    @Override
    @Transactional
    public ClientVnPayResponse createVnPayPayment(ClientVnPayRequest request, String returnUrl, String notifyUrl) {
        try {
            BillEntity bill = billRepository.findById(request.getBillId()).orElse(null);
            if (bill == null) {
                return new ClientVnPayResponse(null, null, "Bill not found", 1);
            }
            if (bill.getFinalAmount() == null || bill.getFinalAmount().compareTo(request.getAmount()) != 0) {
                return new ClientVnPayResponse(null, null, "Invalid amount", 2);
            }

            // --- Build VNPAY Params ---
            String vnp_TxnRef = UUID.randomUUID().toString().replace("-", "");
            String vnp_OrderInfo = "Thanh toan don hang ROYAL JEWELRY - " + bill.getId();
            String vnp_OrderType = "other";
            String vnp_Locale = "vn";
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_CurrCode = "VND";
            // Sử dụng BigDecimal chính xác, nhân 100 (VNPAY yêu cầu amount tính theo "đồng x100")
            BigDecimal amount = new BigDecimal(bill.getFinalAmount()).multiply(new BigDecimal(100));
            String vnp_Amount = String.valueOf(amount.longValueExact());

            String vnp_IpAddr = "127.0.0.1";
            try {
                ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attr != null) {
                    HttpServletRequest servletRequest = attr.getRequest();
                    String xff = servletRequest.getHeader("X-Forwarded-For");
                    if (xff != null && !xff.isEmpty()) {
                        // X-Forwarded-For có thể chứa nhiều IP => lấy IP đầu tiên (client IP)
                        vnp_IpAddr = xff.split(",")[0].trim();
                    } else {
                        vnp_IpAddr = servletRequest.getRemoteAddr();
                    }
                    if ("0:0:0:0:0:0:0:1".equals(vnp_IpAddr)) {
                        vnp_IpAddr = "127.0.0.1";
                    }
                }
            } catch (Exception ignore) {
            }

            // Thời gian tạo và hết hạn: dùng timezone Asia/Ho_Chi_Minh
            TimeZone vnTZ = TimeZone.getTimeZone(ZoneId.of("Asia/Ho_Chi_Minh"));
            Calendar cld = Calendar.getInstance(vnTZ);
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(vnTZ);
            String vnp_CreateDate = formatter.format(cld.getTime());
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());

            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", vnp_Version);
            params.put("vnp_Command", vnp_Command);
            params.put("vnp_TmnCode", vnpTmnCode);
            params.put("vnp_Amount", vnp_Amount);
            params.put("vnp_CurrCode", vnp_CurrCode);
            params.put("vnp_TxnRef", vnp_TxnRef);
            params.put("vnp_OrderInfo", vnp_OrderInfo);
            params.put("vnp_OrderType", vnp_OrderType);
            params.put("vnp_ReturnUrl", returnUrl);
            params.put("vnp_IpAddr", vnp_IpAddr);
            params.put("vnp_Locale", vnp_Locale);
            params.put("vnp_CreateDate", vnp_CreateDate);
            params.put("vnp_ExpireDate", vnp_ExpireDate);

            // --- Sort param theo A-Z ---
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            // --- Build hashData (encode US-ASCII) + queryString (encode US-ASCII) ---
            StringBuilder hashData = new StringBuilder();
            StringBuilder queryString = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String field = fieldNames.get(i);
                String value = params.get(field);
                if (value != null && !value.isEmpty()) {
                    if (hashData.length() > 0) hashData.append('&');
                    try {
                        hashData.append(field).append("=").append(URLEncoder.encode(value, "US-ASCII"));
                        if (queryString.length() > 0) queryString.append('&');
                        queryString.append(URLEncoder.encode(field, "US-ASCII"))
                                .append('=')
                                .append(URLEncoder.encode(value, "US-ASCII"));
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }
            }

            String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
            queryString.append("&vnp_SecureHash=").append(secureHash);
            String paymentUrl = vnpUrl + "?" + queryString.toString();

            // Save transaction
            TransactionEntity tx = new TransactionEntity();
            tx.setId(UUID.randomUUID().toString());
            tx.setBillId(bill.getId());
            tx.setMoney(bill.getFinalAmount());
            tx.setCode("VNPAY-" + vnp_TxnRef);
            tx.setStatus(0);
            tx.setTypeTransaction(1);
            tx.setTypeMethod(1);
            transactionRepository.save(tx);

            return new ClientVnPayResponse(paymentUrl, vnp_TxnRef, "OK", 0);
        } catch (Exception e) {
            log.error("Error create VNPay payment", e);
            return new ClientVnPayResponse(null, null, e.getMessage(), 99);
        }
    }

    @Override
    @Transactional
    public Map<String, Object> handleVnPayCallback(Map<String, String> params) {
        Map<String, Object> response = new HashMap<>();
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null) {
                log.warn("VNPay callback missing vnp_SecureHash");
                response.put("RspCode", "97");
                response.put("Message", "Invalid Checksum");
                response.put("success", false);
                return response;
            }

            // Clone params và loại bỏ vnp_SecureHash và vnp_SecureHashType trước khi build hash chuỗi
            Map<String, String> paramsForHash = new HashMap<>(params);
            paramsForHash.remove("vnp_SecureHash");
            paramsForHash.remove("vnp_SecureHashType");

            // Sort keys
            List<String> fieldNames = new ArrayList<>(paramsForHash.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashDataEncoded = new StringBuilder();
            StringBuilder hashDataRaw = new StringBuilder();
            for (String name : fieldNames) {
                String value = paramsForHash.get(name);
                if (value == null || value.isEmpty()) continue;
                if (hashDataEncoded.length() > 0) hashDataEncoded.append('&');
                if (hashDataRaw.length() > 0) hashDataRaw.append('&');
                try {
                    hashDataEncoded.append(name).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                } catch (Exception ignored) {}
                hashDataRaw.append(name).append('=').append(value);
            }

            String myHashEncoded = hmacSHA512(vnpHashSecret, hashDataEncoded.toString()).toUpperCase(Locale.ROOT);
            String myHashRaw = hmacSHA512(vnpHashSecret, hashDataRaw.toString()).toUpperCase(Locale.ROOT);

            if (!myHashEncoded.equalsIgnoreCase(vnp_SecureHash) && !myHashRaw.equalsIgnoreCase(vnp_SecureHash)) {
                log.warn("VNPay callback invalid hash. Provided: {}, Encoded: {}, Raw: {}", vnp_SecureHash, myHashEncoded, myHashRaw);
                response.put("RspCode", "97");
                response.put("Message", "Invalid Checksum");
                response.put("success", false);
                return response;
            }

            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");

            String txCode = "VNPAY-" + vnp_TxnRef;
            TransactionEntity tx = transactionRepository.findByCode(txCode);
            if (tx == null) {
                log.warn("Transaction not found for code {}", txCode);
                response.put("RspCode", "01");
                response.put("Message", "Order not found");
                response.put("success", false);
                return response;
            }

            BillEntity bill = null;
            if (tx.getBillId() != null) {
                bill = billRepository.findById(tx.getBillId()).orElse(null);
            }

            boolean isSuccess = "00".equals(vnp_ResponseCode) && ("00".equals(vnp_TransactionStatus) || vnp_TransactionStatus == null);

            if (isSuccess) {
                tx.setStatus(1); // Thành công
                if (bill != null && (bill.getStatus() == 0 || bill.getStatus() == null)) {
                    bill.setStatus(1); // 1: Đã thanh toán / Chờ giao
                    bill.setDatePayment(new Date());
                    billRepository.save(bill);

                    BillHistoryEntity history = new BillHistoryEntity();
                    history.setBillId(bill.getId());
                    history.setStatus(1);
                    history.setNote("Thanh toán thành công qua VNPay" + (vnp_TransactionNo != null ? " (Mã GD: " + vnp_TransactionNo + ")" : ""));
                    billHistoryRepository.save(history);
                }
                transactionRepository.save(tx);

                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
                response.put("success", true);
                response.put("billId", bill != null ? bill.getId() : null);
                response.put("status", "SUCCESS");
                return response;
            } else {
                tx.setStatus(2); // Thất bại
                transactionRepository.save(tx);

                if (bill != null && bill.getStatus() != 4) {
                    bill.setStatus(4); // 4: Đã hủy
                    billRepository.save(bill);

                    // Hoàn lại số lượng tồn kho sản phẩm
                    try {
                        List<BillDetailEntity> billDetails = billDetailRepository.findByBillIdAndDeleteFlag(bill.getId(), 0);
                        if (billDetails != null) {
                            for (BillDetailEntity detail : billDetails) {
                                if (detail.getProductDetailId() != null) {
                                    Optional<ProductDetailEntity> pdOpt = productDetailRepository.findById(detail.getProductDetailId());
                                    if (pdOpt.isPresent()) {
                                        ProductDetailEntity pd = pdOpt.get();
                                        long currentQty = pd.getQuantity() != null ? pd.getQuantity() : 0L;
                                        int returnQty = detail.getQuantity() != null ? detail.getQuantity() : 0;
                                        pd.setQuantity(currentQty + returnQty);
                                        productDetailRepository.save(pd);
                                        log.info("Hoàn lại {} sản phẩm {} vào kho do hủy thanh toán VNPay", returnQty, pd.getId());
                                    }
                                }
                            }
                        }
                    } catch (Exception ex) {
                        log.error("Lỗi khi hoàn lại số lượng tồn kho khi hủy thanh toán VNPay: ", ex);
                    }

                    BillHistoryEntity history = new BillHistoryEntity();
                    history.setBillId(bill.getId());
                    history.setStatus(4);
                    String cancelReason = "24".equals(vnp_ResponseCode)
                            ? "Khách hàng đã hủy giao dịch thanh toán qua VNPay"
                            : "Thanh toán qua cổng VNPay không thành công (Mã phản hồi: " + vnp_ResponseCode + ")";
                    history.setNote(cancelReason);
                    billHistoryRepository.save(history);
                }

                response.put("RspCode", "00");
                response.put("Message", "Payment Cancelled/Failed Processed");
                response.put("success", false);
                response.put("responseCode", vnp_ResponseCode);
                response.put("billId", bill != null ? bill.getId() : null);
                response.put("status", "CANCELLED");
                return response;
            }
        } catch (Exception e) {
            log.error("Error handle VNPay callback", e);
            response.put("RspCode", "99");
            response.put("Message", "Unknown error");
            response.put("success", false);
            return response;
        }
    }

    // Helper ký HMAC SHA512
    private String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hash.append('0');
                hash.append(hex);
            }
            return hash.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }
}