package com.web.jewelry.dto.analystManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class AnalystManagementDTO {
    private String productDetailId;
    private String color;
    private String productName;
    private Integer totalQuantity; // Đổi tên thành totalQuantity để khớp với alias trong truy vấn
}