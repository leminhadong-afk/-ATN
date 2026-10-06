package com.web.jewelry.repository;

import com.web.jewelry.dto.billManagement.BillResponse;
import com.web.jewelry.dto.billManagement.FindBillDTO;
import com.web.jewelry.entity.BillEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<BillEntity,String> {
    @Query(value = """
    SELECT
       ROW_NUMBER() OVER (ORDER BY b.created_date DESC) AS rowNum,
       b.id,
       b.code AS billCode,
       b.total_amount AS totalAmount,
       b.date_payment AS datePayment,
       b.type AS type,
       b.address AS address,
       c.id AS customerId,
       c.name AS customerName,
       e.id AS employeeId,
       e.name AS employeeName,
       b.created_date AS createdDate,
       b.status AS status,
       COALESCE(SUM(bd.quantity), 0) AS totalQuantity,
       CASE WHEN COUNT(t.id) > 0 THEN 1 ELSE 0 END AS isPaid
    FROM
       bills b
    LEFT JOIN
       customers c ON c.id = b.customer_id
    LEFT JOIN
       employees e ON e.id = b.employee_id
    LEFT JOIN
       bill_details bd ON bd.bill_id = b.id AND bd.delete_flag = 0
    LEFT JOIN
       transactions t ON t.bill_id = b.id AND t.status = 1
    WHERE
       (b.delete_flag = 0 OR b.delete_flag IS NULL)
       AND (:#{#req.searchTerm} IS NULL OR :#{#req.searchTerm} = '' OR
            b.code LIKE %:#{#req.searchTerm}% OR
            c.name LIKE %:#{#req.searchTerm}%)
       AND (:#{#req.datePaymentStart} IS NULL OR :#{#req.datePaymentStart} = '' OR b.created_date >= :#{#req.datePaymentStart})
       AND (:#{#req.datePaymentEnd} IS NULL OR :#{#req.datePaymentEnd} = '' OR b.created_date <= :#{#req.datePaymentEnd})
       AND (:#{#req.status} IS NULL OR b.status = :#{#req.status})
       AND (:#{#req.type} IS NULL OR :#{#req.type} = '' OR b.type = :#{#req.type})
    GROUP BY
       b.id, b.code, b.total_amount, b.date_payment, b.type, b.address,
       c.id, c.name, e.id, e.name, b.created_date, b.status
    ORDER BY b.created_date DESC
""",
            countQuery = """
    SELECT COUNT(*)
    FROM (
        SELECT b.id
        FROM bills b
        LEFT JOIN customers c ON c.id = b.customer_id
        LEFT JOIN employees e ON e.id = b.employee_id
        LEFT JOIN bill_details bd ON bd.bill_id = b.id AND bd.delete_flag = 0
        WHERE
           (b.delete_flag = 0 OR b.delete_flag IS NULL)
            AND (:#{#req.searchTerm} IS NULL OR :#{#req.searchTerm} = '' OR
               b.code LIKE %:#{#req.searchTerm}% OR
               c.name LIKE %:#{#req.searchTerm}%)
           AND (:#{#req.datePaymentStart} IS NULL OR :#{#req.datePaymentStart} = '' OR b.created_date >= :#{#req.datePaymentStart})
           AND (:#{#req.datePaymentEnd} IS NULL OR :#{#req.datePaymentEnd} = '' OR b.created_date <= :#{#req.datePaymentEnd})
           AND (:#{#req.status} IS NULL OR b.status = :#{#req.status})
           AND (:#{#req.type} IS NULL OR :#{#req.type} = '' OR b.type = :#{#req.type})
        GROUP BY
           b.id
    ) AS tmp
""",
            nativeQuery = true)
    Page<BillResponse> getBillResponse(Pageable pageable, @Param("req") FindBillDTO req);



    @Query(value = """
    SELECT
       ROW_NUMBER() OVER (ORDER BY b.created_date DESC) AS rowNum,
       b.id,
       b.code AS billCode,
       b.total_amount AS totalAmount,
       b.date_payment AS datePayment,
       b.type AS type,
       b.phone_number AS phoneNumber,
       b.recipient,
       b.address AS address,
       c.id AS customerId,
       c.name AS customerName,
       e.id AS employeeId,
       e.name AS employeeName, 
       b.created_date AS createdDate,
       b.status AS status,
       CASE WHEN COUNT(t.id) > 0 THEN 1 ELSE 0 END AS isPaid
    FROM
       bills b
    LEFT JOIN
       customers c ON c.id = b.customer_id
    LEFT JOIN
       employees e ON e.id = b.employee_id
    LEFT JOIN transactions t ON t.bill_id = b.id AND t.status = 1
    WHERE b.id = :id
""", nativeQuery = true)
    Optional<BillResponse> getInfoBill(@Param("id") String id);

    Optional<BillEntity> getBillEntityByCode(String code);

    Optional<BillEntity> findBillById(String id);


    @Query(value = """
    SELECT
       ROW_NUMBER() OVER (ORDER BY b.created_date DESC) AS rowNum,
       b.id,
       b.code AS billCode,
       b.total_amount AS totalAmount,
       b.date_payment AS datePayment,
       b.type AS type,
       b.address AS address,
       c.id AS customerId,
       c.name AS customerName,
       e.id AS employeeId,
       e.name AS employeeName,
       b.created_date AS createdDate,
       b.status AS status,
       COALESCE(SUM(bd.quantity), 0) AS totalQuantity,
       CASE WHEN COUNT(t.id) > 0 THEN 1 ELSE 0 END AS isPaid
    FROM
       bills b
    LEFT JOIN customers c ON c.id = b.customer_id
    LEFT JOIN employees e ON e.id = b.employee_id
    LEFT JOIN bill_details bd ON bd.bill_id = b.id AND bd.delete_flag = 0
    LEFT JOIN transactions t ON t.bill_id = b.id AND t.status = 1
    WHERE
       b.customer_id = :customerId
    GROUP BY
       b.id, b.code, b.total_amount, b.date_payment, b.type,
       b.address, c.id, c.name, e.id, e.name,
       b.created_date, b.status
    ORDER BY b.created_date DESC
""", nativeQuery = true)
    List<BillResponse> findAllByCustomerIdOrderByCreatedDateDesc(@Param("customerId") String customerId);

    @Query("SELECT MAX(b.code) FROM BillEntity b")
    String findMaxBillCode();

    // Truy vấn tìm hóa đơn theo trạng thái
    List<BillEntity> findByStatus(Integer status);

    List<BillEntity> findByDeleteFlag(Integer deleteFlag);

    @Query("SELECT b FROM BillEntity b WHERE b.status = :status AND b.deleteFlag = :deleteFlag AND b.type = :type")
    List<BillEntity> findByStatusAndDeleteFlag(@Param("status") Integer status,
                                               @Param("deleteFlag") Integer deleteFlag,
                                               @Param("type") String type);


}
