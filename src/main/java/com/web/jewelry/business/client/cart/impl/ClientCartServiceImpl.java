package com.web.jewelry.business.client.cart.impl;

import com.web.jewelry.business.client.cart.request.AddProductToCartRequest;
import com.web.jewelry.business.client.cart.request.UpdateProductInCartRequest;
import com.web.jewelry.business.client.cart.response.ProductInCartResponse;
import com.web.jewelry.business.client.cart.service.ClientCartService;
import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.entity.CartDetailEntity;
import com.web.jewelry.entity.CartEntity;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.entity.ProductDetailEntity;
import com.web.jewelry.entity.ProductEntity;
import com.web.jewelry.repository.CartDetailRepository;
import com.web.jewelry.repository.CartRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import com.web.jewelry.repository.ProductRepository;
import com.web.jewelry.repository.ColorRepository;
import com.web.jewelry.repository.SizeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientCartServiceImpl implements ClientCartService {

    private final CommonService commonService;
    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;

    @Override
    public boolean addProductToCart(AddProductToCartRequest request) {
        log.info("Adding product to cart: {}", request.getProductDetailId());
        if (request.getQuantity() <= 0) {
            log.error("Invalid quantity: {}", request.getQuantity());
            return false;
        }

        // Lấy thông tin khách hàng hiện tại
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            log.error("No current customer found");
            return false;
        }

        // Tìm giỏ hàng của khách hàng, nếu chưa có thì tạo mới
        CartEntity cart = cartRepository.findByCustomerId(customer.getId());
        if (cart == null) {
            cart = new CartEntity();
            cart.setCustomerId(customer.getId());
            cart = cartRepository.save(cart);
        }

        // Kiểm tra tồn kho sản phẩm
        Optional<ProductDetailEntity> productDetailOpt = productDetailRepository.findById(request.getProductDetailId());
        if (productDetailOpt.isEmpty()) {
            log.error("Product detail not found: {}", request.getProductDetailId());
            return false;
        }
        ProductDetailEntity productDetail = productDetailOpt.get();
        Long availableStock = productDetail.getQuantity() != null ? productDetail.getQuantity() : 0L;

        if (availableStock <= 0) {
            log.warn("Product out of stock: {}", request.getProductDetailId());
            return false;
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        Optional<CartDetailEntity> cartDetailOpt = cartDetailRepository.findByCartIdAndProductDetailId(cart.getId(), request.getProductDetailId());
        if (cartDetailOpt.isPresent()) {
            CartDetailEntity cartDetail = cartDetailOpt.get();
            int newQuantity = cartDetail.getQuantity() + request.getQuantity();
            if (newQuantity > availableStock) {
                log.warn("Total cart quantity ({}) exceeds available stock ({}) for product detail {}", 
                        newQuantity, availableStock, request.getProductDetailId());
                return false;
            }
            cartDetail.setQuantity(newQuantity);
            cartDetailRepository.save(cartDetail);
        } else {
            if (request.getQuantity() > availableStock) {
                log.warn("Requested quantity ({}) exceeds available stock ({}) for product detail {}", 
                        request.getQuantity(), availableStock, request.getProductDetailId());
                return false;
            }
            if (request.getQuantity() <= 0) {
                return false;
            }
            // Thêm mới vào giỏ
            CartDetailEntity cartDetail = new CartDetailEntity();
            cartDetail.setCartId(cart.getId());
            cartDetail.setProductDetailId(request.getProductDetailId());
            cartDetail.setQuantity(request.getQuantity());
            cartDetailRepository.save(cartDetail);
        }

        log.info("Product added successfully");
        return true;
    }

    @Override
    public List<ProductInCartResponse> getProductsInCart() {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            return new ArrayList<>();
        }
        CartEntity cart = cartRepository.findByCustomerId(customer.getId());
        if (cart == null) {
            return new ArrayList<>();
        }
        List<CartDetailEntity> cartDetails = cartDetailRepository.findByCartId(cart.getId());
        List<ProductInCartResponse> responses = new ArrayList<>();
        for (CartDetailEntity detail : cartDetails) {
            Optional<ProductDetailEntity> productDetailOpt = productDetailRepository.findById(detail.getProductDetailId());
            if (productDetailOpt.isPresent()) {
                ProductDetailEntity productDetail = productDetailOpt.get();
                Optional<ProductEntity> productOpt = productRepository.findById(productDetail.getProductId());
                String productName = productOpt.map(ProductEntity::getName).orElse("");
                Double price = productDetail.getPrice();
                Long availableStock = productDetail.getQuantity() != null ? productDetail.getQuantity() : 0L;
                Integer quantity = detail.getQuantity();
                
                // Tự động đồng bộ nếu số lượng trong giỏ vượt quá tồn kho thực tế
                if (availableStock > 0 && quantity > availableStock) {
                    quantity = Math.toIntExact(availableStock);
                    detail.setQuantity(quantity);
                    cartDetailRepository.save(detail);
                }

                Double totalPrice = price * quantity;
                String urlImg = productDetail.getUrlImage();
                ProductInCartResponse response = new ProductInCartResponse();
                response.setCartDetailId(detail.getId());
                response.setProductDetailId(productDetail.getId());
                response.setProductId(productDetail.getProductId());
                response.setProductName(productName);
                response.setPrice(price);
                response.setQuantity(quantity);
                response.setMaxQuantity(Math.toIntExact(availableStock));
                
                // Thêm thông tin màu sắc và size
                if (productDetail.getColorId() != null) {
                    colorRepository.findById(productDetail.getColorId())
                            .ifPresent(color -> response.setColor(color.getName()));
                }
                if (productDetail.getSizeId() != null) {
                    sizeRepository.findById(productDetail.getSizeId())
                            .ifPresent(size -> response.setSize(size.getName()));
                }
                
                response.setTotalPrice(totalPrice);
                response.setUrlImg(urlImg);
                responses.add(response);
            }
        }
        return responses;
    }

    @Override
    public boolean updateProductInCart(UpdateProductInCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            log.error("Invalid quantity: {}", request.getQuantity());
            return false;
        }
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            log.error("No current customer found");
            return false;
        }
        CartEntity cart = cartRepository.findByCustomerId(customer.getId());
        if (cart == null) {
            log.error("No cart found for customer");
            return false;
        }
        Optional<CartDetailEntity> cartDetailOpt = cartDetailRepository.findByCartIdAndProductDetailId(cart.getId(), request.getProductDetailId());
        if (cartDetailOpt.isPresent()) {
            CartDetailEntity cartDetail = cartDetailOpt.get();
            
            // Kiểm tra tồn kho sản phẩm khi cập nhật số lượng
            Optional<ProductDetailEntity> productDetailOpt = productDetailRepository.findById(request.getProductDetailId());
            if (productDetailOpt.isPresent()) {
                ProductDetailEntity productDetail = productDetailOpt.get();
                Long availableStock = productDetail.getQuantity() != null ? productDetail.getQuantity() : 0L;
                if (request.getQuantity() > availableStock) {
                    cartDetail.setQuantity(Math.toIntExact(availableStock));
                    cartDetailRepository.save(cartDetail);
                    log.info("Capped quantity for productDetailId {} to max stock {}", request.getProductDetailId(), availableStock);
                    return true;
                }
            }

            cartDetail.setQuantity(request.getQuantity());
            cartDetailRepository.save(cartDetail);
            log.info("Updated quantity for productDetailId {} to {}", request.getProductDetailId(), request.getQuantity());
            return true;
        } else {
            log.error("Product not found in cart: {}", request.getProductDetailId());
            return false;
        }
    }

    @Override
    public boolean removeProductFromCart(String cartDetailId) {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            log.error("No current customer found");
            return false;
        }
        CartEntity cart = cartRepository.findByCustomerId(customer.getId());
        if (cart == null) {
            log.error("No cart found for customer");
            return false;
        }
        Optional<CartDetailEntity> cartDetailOpt = cartDetailRepository.findById(cartDetailId);
        if (cartDetailOpt.isPresent()) {
            cartDetailRepository.delete(cartDetailOpt.get());
            log.info("Removed product from cart: {}", cartDetailId);
            return true;
        }
        return false;
    }

    @Override
    public int countProductsInCart() {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            return 0;
        }
        CartEntity cart = cartRepository.findByCustomerId(customer.getId());
        if (cart == null) {
            return 0;
        }
        List<CartDetailEntity> cartDetails = cartDetailRepository.findByCartId(cart.getId());
        return cartDetails.size();
    }
}
