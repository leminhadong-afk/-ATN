package com.web.jewelry.repository;

import com.web.jewelry.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, String> {

    Page<ReviewEntity> findByProductIdAndStatusAndDeleteFlagOrderByCreatedDateDesc(
            String productId, Integer status, Integer deleteFlag, Pageable pageable);

    Page<ReviewEntity> findByProductIdAndStarAndStatusAndDeleteFlagOrderByCreatedDateDesc(
            String productId, Integer star, Integer status, Integer deleteFlag, Pageable pageable);

    List<ReviewEntity> findByProductIdAndStatusAndDeleteFlag(String productId, Integer status, Integer deleteFlag);

    boolean existsByCustomerIdAndBillIdAndProductIdAndDeleteFlag(
            String customerId, String billId, String productId, Integer deleteFlag);

    Page<ReviewEntity> findByDeleteFlagOrderByCreatedDateDesc(Integer deleteFlag, Pageable pageable);

    @Query("SELECT r FROM ReviewEntity r WHERE r.deleteFlag = 0 " +
           "AND (:productId IS NULL OR r.productId = :productId) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.createdDate DESC")
    Page<ReviewEntity> filterReviewsForAdmin(
            @Param("productId") String productId,
            @Param("status") Integer status,
            Pageable pageable);
}
