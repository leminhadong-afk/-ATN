package com.web.jewelry.business.client.cart.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddProductToCartRequest {

    private String productDetailId;
    private int quantity;

}
