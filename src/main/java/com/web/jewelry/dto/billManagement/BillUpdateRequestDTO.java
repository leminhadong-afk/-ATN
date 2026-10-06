package com.web.jewelry.dto.billManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class BillUpdateRequestDTO {
    @NotBlank
    private String id;
    private Double totalAmount;
    private String customerId;
    private String employeeId;
    private Integer status;
    private String address;
    private String phoneNumber;
    private String recipient;
    private Date datePayment;
    private List<BillDetailDTO> billDetails; // Danh sách chi tiết hóa đơn

    @Getter
    @Setter
    public static class BillDetailDTO {
        private String id;
        private String productDetailId;
        private int quantity;
        private double price;
        private Integer deleteFlag;
    }
}
