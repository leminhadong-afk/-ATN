package com.web.jewelry.dto.transactionManagement;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateTransactionDTO {
    private String billId; // Hóa đơn cần thanh toán
    private List<PaymentDetail> payments; // Danh sách thanh toán (tiền mặt, chuyển khoản)

    @Getter
    @Setter
    public static class PaymentDetail {
        private Double money; // Số tiền của phương thức thanh toán này
        private Integer type; // 0: Tiền mặt, 1: Chuyển khoản
        private Integer status;
    }
}