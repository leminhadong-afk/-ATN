package com.web.jewelry.repository;

import com.web.jewelry.dto.employeeManagement.EmployeeResponse;
import com.web.jewelry.dto.employeeManagement.FindEmployeeDTO;
import com.web.jewelry.entity.EmployeeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, String> {
    @Query(value = """
    SELECT
        ROW_NUMBER() OVER (ORDER BY e.created_date DESC) AS rowNum,
        e.id AS employeeId,
        e.code AS employeeCode,
        e.name AS employeeName,
        e.address AS address,
        e.email AS email,
        e.date_of_birth AS dateOfBirth,
        e.phone AS phoneNumber,
        e.sex AS sex,
        e.role AS role,
        e.delete_flag AS deleteFlag,
        e.password AS password,
        e.avatar AS avatar
    FROM
        employees e
    WHERE
        (:#{#req.code} IS NULL OR :#{#req.code} LIKE '' OR e.code LIKE %:#{#req.code}%)
        AND (:#{#req.name} IS NULL OR :#{#req.name} LIKE '' OR e.name LIKE %:#{#req.name}%)
        AND (:#{#req.phone} IS NULL OR :#{#req.phone} LIKE '' OR e.phone LIKE %:#{#req.phone}%)
        AND (:#{#req.email} IS NULL OR :#{#req.email} LIKE '' OR e.email LIKE %:#{#req.email}%)
        AND (:#{#req.sex} IS NULL OR :#{#req.sex} LIKE '' OR e.sex = :#{#req.sex})
        AND (:#{#req.role} IS NULL OR :#{#req.role} LIKE '' OR e.role = :#{#req.role})
        AND (:#{#req.deleteFlag} IS NULL OR :#{#req.deleteFlag} LIKE '' OR e.delete_flag = :#{#req.deleteFlag})
    ORDER BY e.created_date DESC
""", countQuery = """
    SELECT COUNT(e.id)
    FROM employees e
    WHERE
        (:#{#req.code} IS NULL OR :#{#req.code} LIKE '' OR e.code LIKE %:#{#req.code}%)
        AND (:#{#req.name} IS NULL OR :#{#req.name} LIKE '' OR e.name LIKE %:#{#req.name}% )
        AND (:#{#req.phone} IS NULL OR :#{#req.phone} LIKE '' OR e.phone LIKE %:#{#req.phone}%)
        AND (:#{#req.email} IS NULL OR :#{#req.email} LIKE '' OR e.email LIKE %:#{#req.email}%)
        AND (:#{#req.sex} IS NULL OR :#{#req.sex} LIKE '' OR e.sex = :#{#req.sex})
        AND (:#{#req.role} IS NULL OR :#{#req.role} LIKE '' OR e.role = :#{#req.role})
        AND (:#{#req.deleteFlag} IS NULL OR :#{#req.deleteFlag} LIKE '' OR e.delete_flag = :#{#req.deleteFlag})
""", nativeQuery = true)
    Page<EmployeeResponse> getEmployeeResponse(Pageable pageable, @Param("req") FindEmployeeDTO req);


    @Query(value = """
    SELECT
        ROW_NUMBER() OVER (ORDER BY e.created_date DESC) AS rowNum,
        e.id AS employeeId,
        e.code AS employeeCode,
        e.name AS employeeName,
        e.address AS address,
        e.email AS email,
        e.date_of_birth AS dateOfBirth,
        e.phone AS phoneNumber,
        e.sex AS sex,
        e.role AS role,
        e.delete_flag AS deleteFlag,
        e.password AS password,
        e.avatar AS avatar
    FROM
        employees e
    WHERE
        (
            :#{#req.searchTerm} IS NULL OR :#{#req.searchTerm} LIKE '' OR
            e.code LIKE %:#{#req.searchTerm}% OR
            e.name LIKE %:#{#req.searchTerm}% OR
            e.phone LIKE %:#{#req.searchTerm}% OR
            e.email LIKE %:#{#req.searchTerm}%
        )
        AND (:#{#req.sex} IS NULL OR e.sex = :#{#req.sex})
        AND (:#{#req.role} IS NULL OR e.role = :#{#req.role})
        AND (:#{#req.deleteFlag} IS NULL OR e.delete_flag = :#{#req.deleteFlag})
    ORDER BY e.created_date DESC
""", countQuery = """
    SELECT COUNT(e.id)
    FROM employees e
    WHERE
       (
           :#{#req.searchTerm} IS NULL OR :#{#req.searchTerm} LIKE '' OR
           e.code LIKE %:#{#req.searchTerm}% OR
           e.name LIKE %:#{#req.searchTerm}% OR
           e.phone LIKE %:#{#req.searchTerm}% OR
           e.email LIKE %:#{#req.searchTerm}%
       )
       AND (:#{#req.sex} IS NULL OR e.sex = :#{#req.sex})
       AND (:#{#req.role} IS NULL OR e.role = :#{#req.role})
       AND (:#{#req.deleteFlag} IS NULL OR e.delete_flag = :#{#req.deleteFlag})
""", nativeQuery = true)
    Page<EmployeeResponse> searchEmployee(Pageable pageable, @Param("req") FindEmployeeDTO req);


    EmployeeEntity findByEmailAndDeleteFlagFalse(String email);

    Optional<EmployeeEntity> findEmployeeEntityByCode(String code);

    boolean existsByEmail(String email);

    Optional<EmployeeEntity> findByEmailAndIdNot(String email, String id);


    Optional<EmployeeEntity> findByCode(String code);

    @Query("SELECT MAX(e.code) FROM EmployeeEntity e")
    String findMaxCode();

}
