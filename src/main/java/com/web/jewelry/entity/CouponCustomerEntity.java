package com.web.jewelry.entity;

import com.web.jewelry.entity.base.PrimaryEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupon_customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponCustomerEntity extends PrimaryEntity {

    @Column(name = "coupon_id")
    private String couponId;

    @Column(name = "customer_id")
    private String customerId;
}
