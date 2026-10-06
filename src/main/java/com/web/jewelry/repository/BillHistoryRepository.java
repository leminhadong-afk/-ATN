package com.web.jewelry.repository;

import com.web.jewelry.dto.billHistoryManagement.BillHistoryResponse;
import com.web.jewelry.entity.BillHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillHistoryRepository extends JpaRepository<BillHistoryEntity,String> {
    @Query(value = """
        SELECT 
            bh.id AS id,
            bh.status AS status,
            bh.note AS note,
            bh.bill_id AS billId,
            bh.created_date AS createdDate
        FROM
            bill_history bh
        WHERE
            bh.bill_id = :billId
            
        """, nativeQuery = true)
    List<BillHistoryResponse> getBillHistory(@Param("billId") String billId);

    List<BillHistoryEntity> findByBillIdOrderByCreatedDateAsc(String billId);
}
