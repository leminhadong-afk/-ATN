package com.web.jewelry.dto.productDetailDTO;

public interface ProductDetailManagementResponse {

    Long getRowNum();

    String getProductCode();

    String getProductId();

    String getProductDetailId();

    String getProductName();

    String getBrandName();

    String getTypeName();

    String getMaterialName();

    String getColorName();

    String getSizeName();

    String getDescription();

    Double getPrice();

    Integer getStatus();

    Long getCreatedDate();

    Long getQuantity();

    String getUrlImg();
}
