package com.web.jewelry.dto.productManagement;

public interface ProductStatisticsResponse {
    String getProductId();
    String getProductName();
    Long getTotalSoldQuantity();
    String getUrlImg();
}
