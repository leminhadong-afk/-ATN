package com.web.jewelry.business.client.cart.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductInCartResponse {
    private String cartDetailId;
    private String productDetailId;
    private String productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double totalPrice;
    private String urlImg;
    private Integer maxQuantity;
    private String color;
    private String size;
}
