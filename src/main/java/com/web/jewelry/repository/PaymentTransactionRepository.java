package com.web.jewelry.repository;

import com.web.jewelry.entity.PaymentTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransactionEntity, String> {
    PaymentTransactionEntity findByOrderId(String orderId);
}

