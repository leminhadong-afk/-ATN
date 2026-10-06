package com.web.jewelry.dto.productDetailDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


public class ProductDetailDTO {
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDetailRes{
        private String productId;
        private String productCode;
        private String productName;
        private String productDescription;
        private String price;
        private String brand;
        private String color;
        private String size;
        private String quantitySold;
        private String material;
        private String typeOfShoel;
        private String status;
    }
}
