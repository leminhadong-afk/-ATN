package com.web.jewelry.business.client.cart.web;

import com.web.jewelry.business.client.cart.request.AddProductToCartRequest;
import com.web.jewelry.business.client.cart.request.UpdateProductInCartRequest;
import com.web.jewelry.business.client.cart.response.ProductInCartResponse;
import com.web.jewelry.business.client.cart.service.ClientCartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/client/cart")
@Slf4j
@RequiredArgsConstructor
public class ClientCartController {

    private final ClientCartService clientCartService;

    @PostMapping("/add")
    public ResponseEntity<String> addProductToCart(@RequestBody AddProductToCartRequest request) {
        log.info("Received request to add product to cart: {}", request);
        boolean success = clientCartService.addProductToCart(request);
        if (success) {
            return ResponseEntity.ok("Product added to cart successfully");
        } else {
            return ResponseEntity.badRequest().body("Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn kho hiện có!");
        }
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductInCartResponse>> getProductsInCart() {
        List<ProductInCartResponse> products = clientCartService.getProductsInCart();
        return ResponseEntity.ok(products);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateProductInCart(@RequestBody UpdateProductInCartRequest request) {
        boolean success = clientCartService.updateProductInCart(request);
        if (success) {
            return ResponseEntity.ok("Cart updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to update cart");
        }
    }

    @DeleteMapping("/remove/{cartDetailId}")
    public ResponseEntity<String> removeProductFromCart(@PathVariable String cartDetailId) {
        boolean success = clientCartService.removeProductFromCart(cartDetailId);
        if (success) {
            return ResponseEntity.ok("Product removed from cart successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to remove product from cart");
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> countProductsInCart() {
        int count = clientCartService.countProductsInCart();
        return ResponseEntity.ok(count);
    }

}
