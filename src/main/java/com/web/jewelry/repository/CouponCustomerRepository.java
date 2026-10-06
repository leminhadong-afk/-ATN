package com.web.jewelry.repository;

import com.web.jewelry.entity.CouponCustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponCustomerRepository extends JpaRepository<CouponCustomerEntity, String> {
    List<CouponCustomerEntity> findByCouponId(String couponId);
}
