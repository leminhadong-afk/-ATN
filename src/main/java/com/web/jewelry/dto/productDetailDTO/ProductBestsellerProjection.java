package com.web.jewelry.dto.productDetailDTO;

public interface ProductBestsellerProjection {

    String getProductId();

    String getProductName();

    String getUrlImg();

    Long getTotalSoldQuantity();

    String getPrice(); // optional: MIN price string
}


