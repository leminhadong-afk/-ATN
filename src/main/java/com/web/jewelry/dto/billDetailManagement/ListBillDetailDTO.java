package com.web.jewelry.dto.billDetailManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListBillDetailDTO {

    private String id;

    private String urlImg;

    private String productName;

    private Double price;

    private String color;

    private Integer quantity;

    private String size;

    private String productDetailId;

    private Integer productDetailQuantity;

    private String productCode;

    private String billCode;

    private Long createdDate;

}
