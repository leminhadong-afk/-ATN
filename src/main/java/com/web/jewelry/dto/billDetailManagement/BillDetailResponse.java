package com.web.jewelry.dto.billDetailManagement;

public interface BillDetailResponse {

    String getId();

    String getUrlImg();

    String getProductName();

    String getProductCode();

    Double getPrice();

    String getColor();

    String getSize();

    Integer getQuantity();

    Integer getProductDetailQuantity();

    String getProductDetailId();

    String getBillCode();

    Long getCreatedDate();
}
