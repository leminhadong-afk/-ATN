package com.web.jewelry.dto.billDetailManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SoldProductSummaryDTO {

    private String id;

    private String urlImg;

    private String productName;

    private String productCode;

    private Double price;

    private String color;

    private String size;

    private Long quantity;

    private Long totalBills;

    private Long createdDate;
}

