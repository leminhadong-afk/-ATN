package com.web.jewelry.repository;

import com.web.jewelry.dto.billDetailManagement.BillDetailResponse;
import com.web.jewelry.dto.billDetailManagement.SoldProductSummaryResponse;
import com.web.jewelry.entity.BillDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillDetailRepository extends JpaRepository<BillDetailEntity,String> {
    @Query(value = """
        SELECT 
            bd.id AS id,
            pd.url_image as urlImg,
            p.name as productName,
            bd.price as price,
            bd.quantity as quantity,
            c.name as color,
            s.name as size,
            bd.product_detail_id as productDetailId,
            pd.quantity as productDetailQuantity
        FROM
            bill_details bd
         LEFT JOIN
            product_details pd on pd.id = bd.product_detail_id
         LEFT JOIN 
            products p on p.id = pd.product_id 
         LEFT JOIN 
            colors c on c.id = pd.color_id 
         LEFT JOIN 
            sizes s on s.id = pd.size_id 
        WHERE
            bd.bill_id = :billId AND bd.delete_flag = :deleteFlag
            
        """, nativeQuery = true)
    List<BillDetailResponse> getBillDetail(@Param("billId") String billId, @Param("deleteFlag") Integer deleteFlag);

    List<BillDetailEntity> findByBillIdAndDeleteFlag(String billId, Integer deleteFlag);

    @Query("SELECT bd FROM BillDetailEntity bd WHERE bd.billId = :billId AND bd.productDetailId = :productDetailId AND bd.deleteFlag = 0")
    Optional<BillDetailEntity> findByBillIdAndProductDetailId(@Param("billId") String billId, @Param("productDetailId") String productDetailId);

    List<BillDetailEntity> findByBillId(String billId);

    @Query(value = """
        SELECT SUM(bd.quantity)
        FROM bill_details bd
        JOIN bills b ON bd.bill_id = b.id
        WHERE b.status = 1  AND bd.delete_flag = 0
        """, nativeQuery = true)
    Long getTotalSoldQuantity();

    @Query(value = """
        SELECT 
            p.id AS id,
            MIN(pd.url_image) as urlImg,
            p.name as productName,
            p.code as productCode,
            AVG(bd.price) as price,
            SUM(bd.quantity) as quantity,
            GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') as color,
            GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') as size,
            COUNT(DISTINCT b.id) as totalBills,
            MAX(b.created_date) as createdDate
        FROM
            bill_details bd
         LEFT JOIN
            product_details pd on pd.id = bd.product_detail_id
         LEFT JOIN 
            products p on p.id = pd.product_id 
         LEFT JOIN 
            colors c on c.id = pd.color_id 
         LEFT JOIN 
            sizes s on s.id = pd.size_id
         LEFT JOIN
            bills b on b.id = bd.bill_id
        WHERE
            b.status = 1 AND bd.delete_flag = 0
            AND (:startDate IS NULL OR b.created_date >= :startDate)
            AND (:endDate IS NULL OR b.created_date <= :endDate)
        GROUP BY p.id, p.name, p.code
        ORDER BY quantity DESC, createdDate DESC
        """, nativeQuery = true)
    List<SoldProductSummaryResponse> getAllSoldProducts(@Param("startDate") Long startDate, @Param("endDate") Long endDate);
}
