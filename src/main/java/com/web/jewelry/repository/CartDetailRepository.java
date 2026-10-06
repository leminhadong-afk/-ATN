package com.web.jewelry.repository;

import com.web.jewelry.entity.CartDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetailEntity, String> {
    Optional<CartDetailEntity> findByCartIdAndProductDetailId(String cartId, String productDetailId);
    List<CartDetailEntity> findByCartId(String cartId);
    void deleteByCartIdAndProductDetailIdIn(String cartId, List<String> productDetailIds);
}
