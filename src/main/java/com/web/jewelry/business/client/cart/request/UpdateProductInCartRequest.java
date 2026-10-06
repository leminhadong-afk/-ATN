package com.web.jewelry.business.client.cart.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductInCartRequest {

    private String productDetailId;

    private Integer quantity;

}
