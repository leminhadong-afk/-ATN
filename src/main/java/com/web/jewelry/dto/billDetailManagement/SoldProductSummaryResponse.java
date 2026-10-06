package com.web.jewelry.dto.billDetailManagement;

public interface SoldProductSummaryResponse {

    String getId();

    String getUrlImg();

    String getProductName();

    String getProductCode();

    Double getPrice();

    String getColor();

    String getSize();

    Long getQuantity();

    Long getTotalBills();

    Long getCreatedDate();
}

