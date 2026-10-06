package com.web.jewelry.business.client.cart.service;

import com.web.jewelry.business.client.cart.request.AddProductToCartRequest;
import com.web.jewelry.business.client.cart.request.UpdateProductInCartRequest;
import com.web.jewelry.business.client.cart.response.ProductInCartResponse;

import java.util.List;

public interface ClientCartService {

    boolean addProductToCart(AddProductToCartRequest request);

    List<ProductInCartResponse> getProductsInCart();

    boolean updateProductInCart(UpdateProductInCartRequest request);

    boolean removeProductFromCart(String cartDetailId);

    int countProductsInCart();
}
