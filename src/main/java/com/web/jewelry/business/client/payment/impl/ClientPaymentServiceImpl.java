package com.web.jewelry.business.client.payment.impl;

import com.web.jewelry.business.client.payment.request.ClientPaymentRequest;
import com.web.jewelry.business.client.payment.service.ClientPaymentService;
import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillEntity;
import com.web.jewelry.entity.BillHistoryEntity;
import com.web.jewelry.entity.CartDetailEntity;
import com.web.jewelry.entity.CartEntity;
import com.web.jewelry.entity.ProductDetailEntity;
import com.web.jewelry.repository.BillDetailRepository;
import com.web.jewelry.repository.BillHistoryRepository;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.CartDetailRepository;
import com.web.jewelry.repository.CartRepository;
import com.web.jewelry.repository.TransactionRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor

@Slf4j
public class ClientPaymentServiceImpl implements ClientPaymentService {
    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository;
    private final TransactionRepository transactionRepository;
    private final CartDetailRepository cartDetailRepository;
    private final CartRepository cartRepository;
    private final CommonService commonService;
    private final ProductDetailRepository productDetailRepository;
    private final BillHistoryRepository  billHistoryRepository;

    @Override
    public Map<String, Object> createPayment(ClientPaymentRequest request) {
        // 1. Tạo BillEntity
        BillEntity bill = new BillEntity();
        bill.setCustomerId(commonService.getCurrentCustomer().getId());
        bill.setId(UUID.randomUUID().toString());
        bill.setCode(generateBillCode());
        bill.setType("ONLINE");
        bill.setTotalAmount(request.getAmount() != null ? request.getAmount().doubleValue() : 0d);
        bill.setDatePayment(new Date());
        bill.setPhoneNumber(request.getPhone());
        bill.setAddress(request.getAddress());
        bill.setRecipient(request.getFullName());
        bill.setStatus(0); // 0: Chờ xác nhận
        bill.setDeleteFlag(0);
        bill.setDiscountAmount(request.getDiscount() != null ? request.getDiscount().doubleValue() : 0d);
        bill.setFinalAmount((request.getAmount() != null ? request.getAmount().doubleValue() : 0d)
                - (request.getDiscount() != null ? request.getDiscount().doubleValue() : 0d));
        // Có thể set promotionId, customerId nếu có

        bill = billRepository.save(bill);

        // 2. Lưu từng BillDetailEntity
        if (request.getItems() != null) {
            for (ClientPaymentRequest.Item item : request.getItems()) {
                BillDetailEntity detail = new BillDetailEntity();
                detail.setId(UUID.randomUUID().toString());
                detail.setBillId(bill.getId());
                detail.setProductDetailId(item.getProductDetailId());
                detail.setQuantity(item.getQuantity() != null ? item.getQuantity() : 1);
                detail.setPrice(item.getPrice() != null ? item.getPrice() : 0d);
                detail.setDeleteFlag(0);
                detail.setDiscountAmount(0d);
                detail.setFinalPrice(item.getPrice() != null ? item.getPrice() : 0d);
                billDetailRepository.save(detail);
            }
        }

        // 2.5. Xóa các sản phẩm đã đặt khỏi giỏ hàng (chuẩn: theo cartId)
        try {
            if (commonService.getCurrentCustomer() != null && request.getItems() != null && !request.getItems().isEmpty()) {
                String customerId = commonService.getCurrentCustomer().getId();
                CartEntity cart = cartRepository.findByCustomerId(customerId);
                if (cart != null) {
                    List<CartDetailEntity> listCartDetailEntity = cartDetailRepository.findByCartId(cart.getId());
                    cartDetailRepository.deleteAll(listCartDetailEntity);

                    // Trừ số lượng tồn kho sản phẩm
                    for (ClientPaymentRequest.Item item : request.getItems()) {
                        ProductDetailEntity productDetail = productDetailRepository.findById(item.getProductDetailId()).orElse(null);
                        if (productDetail != null && item.getQuantity() != null) {
                            long newQuantity = (productDetail.getQuantity() != null ? productDetail.getQuantity() : 0L) - item.getQuantity();
                            productDetail.setQuantity(Math.max(newQuantity, 0L));
                            productDetailRepository.save(productDetail);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Không thể xóa sản phẩm khỏi giỏ hàng sau khi đặt hàng: {}", e.getMessage());
        }

        BillHistoryEntity billHistoryEntity = new BillHistoryEntity();
        billHistoryEntity.setBillId(bill.getId());
        billHistoryEntity.setStatus(0);
        billHistoryEntity.setNote("Đơn online mới tạo, đang chờ xác nhận");
        billHistoryRepository.save(billHistoryEntity);

        Map<String, Object> result = new HashMap<>();
        result.put("billId", bill.getId());
        result.put("amount", bill.getFinalAmount());
        return result;
    }

    private String generateBillCode() {
        // Sinh mã đơn hàng dạng BILLyyyyMMddHHmmss
        return "BILL" + System.currentTimeMillis();
    }

    @Override
    public Map<String, Object> cancelCashPaymentBill(String billId) {
        Map<String, Object> result = new HashMap<>();
        BillEntity bill = billRepository.findById(billId).orElse(null);
        if (bill == null) {
            result.put("success", false);
            result.put("message", "Không tìm thấy đơn hàng.");
            return result;
        }
        // Chỉ cho hủy nếu là đơn thanh toán khi nhận hàng và trạng thái là 0
        if ("ONLINE".equals(bill.getType()) && bill.getStatus() == 0) {
            bill.setStatus(4); // 4: Đã hủy
            billRepository.save(bill);

            // Hoàn lại số lượng sản phẩm vào kho
            try {
                List<BillDetailEntity> billDetails = billDetailRepository.findByBillIdAndDeleteFlag(bill.getId(), 0);
                if (billDetails != null) {
                    for (BillDetailEntity detail : billDetails) {
                        if (detail.getProductDetailId() != null) {
                            ProductDetailEntity pd = productDetailRepository.findById(detail.getProductDetailId()).orElse(null);
                            if (pd != null) {
                                long currentQty = pd.getQuantity() != null ? pd.getQuantity() : 0L;
                                int returnQty = detail.getQuantity() != null ? detail.getQuantity() : 0;
                                pd.setQuantity(currentQty + returnQty);
                                productDetailRepository.save(pd);
                            }
                        }
                    }
                }
            } catch (Exception ex) {
                log.error("Lỗi khi hoàn tồn kho khi hủy đơn COD: ", ex);
            }

            BillHistoryEntity history = new BillHistoryEntity();
            history.setBillId(bill.getId());
            history.setStatus(4);
            history.setNote("Khách hàng đã hủy đơn hàng thanh toán khi nhận hàng.");
            billHistoryRepository.save(history);

            result.put("success", true);
            result.put("message", "Đã hủy đơn hàng thành công.");
        } else {
            result.put("success", false);
            result.put("message", "Chỉ có thể hủy đơn hàng thanh toán khi nhận hàng và trạng thái đang chờ xác nhận.");
        }
        return result;
    }
}
