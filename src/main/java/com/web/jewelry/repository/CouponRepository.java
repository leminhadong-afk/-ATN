package com.web.jewelry.repository;

import com.web.jewelry.dto.couponManagement.CouponResponse;
import com.web.jewelry.dto.couponManagement.FindCouponDTO;
import com.web.jewelry.entity.CouponEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<CouponEntity,String> {

    @Query(value = """

            SELECT\s
        ROW_NUMBER() OVER (ORDER BY cp.created_date DESC) AS rowNum,
        cp.id,
        cp.code,
        cp.name,
        cp.type,
        cp.value,
        cp.unit,
        cp.quantity,
        cp.start_date AS startDate,
        cp.end_date AS endDate,
        cp.status,
        cc1.customer_id AS customerId
    FROM
        coupon cp
    LEFT JOIN
        coupon_customer cc1 ON cc1.coupon_id = cp.id
    LEFT JOIN
        customers cs ON cs.id = cc1.customer_id
    WHERE
        (:#{#req.couponId} IS NULL OR :#{#req.couponId} LIKE '' OR cp.id = :#{#req.couponId})
        AND (
            :#{#req.searchTerm} IS NULL OR :#{#req.searchTerm} LIKE '' OR
            cp.code LIKE %:#{#req.searchTerm}% OR
            cp.name LIKE %:#{#req.searchTerm}% 
        )
        AND (:#{#req.type} IS NULL OR :#{#req.type} LIKE '' OR cp.type = :#{#req.type})
        AND (:#{#req.status} IS NULL OR :#{#req.status} LIKE '' OR cp.status = :#{#req.status})
        AND (:#{#req.unit} IS NULL OR :#{#req.unit} LIKE '' OR cp.unit = :#{#req.unit})
        AND ((:#{#req.startDate} IS NULL OR cp.start_date >= :#{#req.startDate})
            AND (:#{#req.endDate} IS NULL OR cp.end_date <= :#{#req.endDate}))
        ORDER BY cp.created_date DESC
        """, countQuery = """
    SELECT 
    COUNT(cp.id)
    FROM
        coupon cp
    LEFT JOIN
        coupon_customer cc1 ON cc1.coupon_id = cp.id
    LEFT JOIN
        customers cs ON cs.id = cc1.customer_id
    WHERE
        (:#{#req.couponId} IS NULL OR :#{#req.couponId} LIKE '' OR cp.id = :#{#req.couponId})
        AND (
            :#{#req.searchTerm} IS NULL OR :#{#req.searchTerm} LIKE '' OR
            cp.code LIKE %:#{#req.searchTerm}% OR
            cp.name LIKE %:#{#req.searchTerm}% 
        )
        AND (:#{#req.type} IS NULL OR :#{#req.type} LIKE '' OR cp.type = :#{#req.type})
        AND (:#{#req.status} IS NULL OR :#{#req.status} LIKE '' OR cp.status = :#{#req.status})
        AND (:#{#req.unit} IS NULL OR :#{#req.unit} LIKE '' OR cp.unit = :#{#req.unit})
        AND ((:#{#req.startDate} IS NULL OR cp.start_date >= :#{#req.startDate})
            AND (:#{#req.endDate} IS NULL OR cp.end_date <= :#{#req.endDate}))
""", nativeQuery = true)
    Page<CouponResponse> getCouponManagementRespone (Pageable pageable, @Param("req")FindCouponDTO req);

    Optional<CouponEntity> findByCode(String code);
}
