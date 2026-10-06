package com.web.jewelry.dto.productManagement;

public interface ProductManagementResponse {

    Long getRowNum();

    String getProductId();

    String getProductCode();

    String getProductName();

    Integer getStatus();

    Long getCreatedDate();

    Long getTotalQuantity();

    String getUrlImg();

}
