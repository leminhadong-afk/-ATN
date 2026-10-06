package com.web.jewelry.repository;

import com.web.jewelry.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, String> {
    CartEntity findByCustomerId(String customerId);
}
