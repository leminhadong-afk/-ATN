package com.web.jewelry.repository;

import com.web.jewelry.dto.transactionManagement.TransactionResponse;
import com.web.jewelry.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity,String> {

    TransactionEntity findByCode(String code);

    @Query(value = """
        SELECT
            t.id AS id,
            t.bill_id AS billId,
            t.money AS money,
            t.status ,
            t.created_date AS createdDate,
            e.name as employeeName,
            t.type_transaction AS typeTransaction
        FROM
            transactions t
        LEFT JOIN
            bills b on b.id = t.bill_id
        LEFT JOIN
            employees e on e.id = b.employee_id
        WHERE
            t.bill_id = :billId

        """, nativeQuery = true)
    List<TransactionResponse> getTransaction(@Param("billId") String billId);

    Optional<TransactionEntity> findById(String id);


}
