
package com.web.jewelry.repository;

import com.web.jewelry.dto.productManagement.FindProductManagementDTO;
import com.web.jewelry.dto.productManagement.ProductManagementResponse;
import com.web.jewelry.dto.productManagement.ProductStatisticsResponse;
import com.web.jewelry.dto.productDetailDTO.ProductDetailOverviewProjection;
import com.web.jewelry.dto.productDetailDTO.FindProductOverviewDTO;
import com.web.jewelry.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity,String> {
    @Query(value = """
    SELECT
        ROW_NUMBER() OVER (ORDER BY p.created_date DESC) AS rowNum,
        p.id AS productId,
        p.code AS productCode,
        p.name AS productName,
        COALESCE(SUM(pd.quantity), 0) AS totalQuantity,
        p.status AS status,
        p.created_date AS createdDate,
        MIN(pd.url_image) AS urlImg
    FROM
        products p
    LEFT JOIN
        product_details pd ON p.id = pd.product_id
    WHERE 
        (:#{#req.name} IS NULL OR :#{#req.name} = '' OR p.name LIKE %:#{#req.name}%)
        AND (:#{#req.status} IS NULL OR :#{#req.status} LIKE '' OR p.status = :#{#req.status})
    GROUP BY
        p.id, p.name, p.status, p.created_date
    ORDER BY p.created_date DESC
    """,
            countQuery = """
    SELECT COUNT(p.id)
    FROM
        products p
    LEFT JOIN
        product_details pd ON p.id = pd.product_id
    WHERE 
        (:#{#req.name} IS NULL OR :#{#req.name} = '' OR p.name LIKE %:#{#req.name}%)
        AND (:#{#req.status} IS NULL OR :#{#req.status} LIKE '' OR p.status = :#{#req.status})
    GROUP BY p.id, p.name, p.status, p.created_date
    """,
            nativeQuery = true)
    Page<ProductManagementResponse> getProductManagementResponse(Pageable pageable, @Param("req") FindProductManagementDTO req);
    @Query(value = "SELECT MAX(CAST(SUBSTRING(code, 3) AS UNSIGNED)) FROM products WHERE code LIKE 'SP%';", nativeQuery = true)
    Integer findMaxProductCodeNumber();
    Optional<ProductEntity> getProductEntitiesByName(String name);

    Long countByDeleteFlag(Integer deleteFlag);

    @Query(value = """
    SELECT 
        p.id AS productId,
        p.name AS productName,
        pd.url_image as urlImg,
        SUM(bd.quantity) AS totalSoldQuantity
    FROM 
        products p
    JOIN 
        product_details pd ON p.id = pd.product_id
    JOIN 
        bill_details bd ON pd.id = bd.product_detail_id
    JOIN 
        bills b ON bd.bill_id = b.id
    WHERE 
        b.status = 1 
        AND bd.delete_flag = 0
    GROUP BY 
        p.id, p.name, pd.url_image
    ORDER BY 
        totalSoldQuantity DESC
    LIMIT 3
    """, nativeQuery = true)
    List<ProductStatisticsResponse> getTopMostSoldProducts();

    @Query(value = """
    SELECT
        p.id AS productId,
        GROUP_CONCAT(DISTINCT pd.product_code ORDER BY pd.product_code SEPARATOR ', ') AS productCode,
        p.name AS productName,
        p.description AS productDescription,
        GROUP_CONCAT(DISTINCT pd.price ORDER BY pd.price SEPARATOR ', ') AS price,
        b.name AS brand,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS colors,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS sizes,
        COALESCE(SUM(bd_agg.total_quantity), 0) AS totalSoldQuantity,
        m.name AS material,
        ts.name AS typeOfShoe,
        GROUP_CONCAT(DISTINCT pd.status ORDER BY pd.status SEPARATOR ', ') AS status,
        MIN(pd.url_image) AS urlImg
    FROM products p
    JOIN product_details pd ON p.id = pd.product_id
    JOIN sizes s ON pd.size_id = s.id
    JOIN colors c ON pd.color_id = c.id
    JOIN materials m ON m.id = p.material_id
    JOIN types_product ts ON ts.id = p.type_id
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN (
        SELECT
            product_detail_id,
            SUM(quantity) AS total_quantity
        FROM
            bill_details
        WHERE
            delete_flag = 0 OR delete_flag IS NULL
        GROUP BY
            product_detail_id
    ) bd_agg ON pd.id = bd_agg.product_detail_id
    WHERE
        ((:#{#req.name} IS NULL OR :#{#req.name} = '') AND (:#{#req.productCode} IS NULL OR :#{#req.productCode} = '') 
         OR (:#{#req.name} IS NOT NULL AND :#{#req.name} != '' AND p.name LIKE CONCAT('%', :#{#req.name}, '%'))
         OR (:#{#req.productCode} IS NOT NULL AND :#{#req.productCode} != '' AND pd.product_code LIKE CONCAT('%', :#{#req.productCode}, '%')))
        AND (:#{#req.brandId} IS NULL OR :#{#req.brandId} = '' OR p.brand_id = :#{#req.brandId})
        AND (:#{#req.materialId} IS NULL OR :#{#req.materialId} = '' OR p.material_id = :#{#req.materialId})
        AND (:#{#req.typeId} IS NULL OR :#{#req.typeId} = '' OR p.type_id = :#{#req.typeId})
        AND (:#{#req.minPrice} IS NULL OR pd.price >= :#{#req.minPrice})
        AND (:#{#req.maxPrice} IS NULL OR pd.price <= :#{#req.maxPrice})
        AND ((:#{#req.colorsCsv} IS NULL OR :#{#req.colorsCsv} = '') OR FIND_IN_SET(TRIM(c.name), :#{#req.colorsCsv}))
        AND ((:#{#req.sizesCsv} IS NULL OR :#{#req.sizesCsv} = '') OR FIND_IN_SET(TRIM(s.name), :#{#req.sizesCsv}))
        AND ((:#{#req.status} IS NULL) OR pd.status IN (:#{#req.status}))
    GROUP BY
        p.id,
        p.name,
        p.description,
        m.name,
        ts.name,
        b.name
    ORDER BY
        p.created_date DESC
    """,
            countQuery = """
    SELECT COUNT(DISTINCT p.id)
    FROM products p
    JOIN product_details pd ON p.id = pd.product_id
    JOIN sizes s ON pd.size_id = s.id
    JOIN colors c ON pd.color_id = c.id
    JOIN materials m ON m.id = p.material_id
    JOIN types_product ts ON ts.id = p.type_id
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN (
        SELECT
            product_detail_id,
            SUM(quantity) AS total_quantity
        FROM
            bill_details
        WHERE
            delete_flag = 0 OR delete_flag IS NULL
        GROUP BY
            product_detail_id
    ) bd_agg ON pd.id = bd_agg.product_detail_id
    WHERE
        ((:#{#req.name} IS NULL OR :#{#req.name} = '') AND (:#{#req.productCode} IS NULL OR :#{#req.productCode} = '') 
         OR (:#{#req.name} IS NOT NULL AND :#{#req.name} != '' AND p.name LIKE CONCAT('%', :#{#req.name}, '%'))
         OR (:#{#req.productCode} IS NOT NULL AND :#{#req.productCode} != '' AND pd.product_code LIKE CONCAT('%', :#{#req.productCode}, '%')))
        AND (:#{#req.brandId} IS NULL OR :#{#req.brandId} = '' OR p.brand_id = :#{#req.brandId})
        AND (:#{#req.materialId} IS NULL OR :#{#req.materialId} = '' OR p.material_id = :#{#req.materialId})
        AND (:#{#req.typeId} IS NULL OR :#{#req.typeId} = '' OR p.type_id = :#{#req.typeId})
        AND (:#{#req.minPrice} IS NULL OR pd.price >= :#{#req.minPrice})
        AND (:#{#req.maxPrice} IS NULL OR pd.price <= :#{#req.maxPrice})
        AND ((:#{#req.colorsCsv} IS NULL OR :#{#req.colorsCsv} = '') OR FIND_IN_SET(TRIM(c.name), :#{#req.colorsCsv}))
        AND ((:#{#req.sizesCsv} IS NULL OR :#{#req.sizesCsv} = '') OR FIND_IN_SET(TRIM(s.name), :#{#req.sizesCsv}))
        AND ((:#{#req.status} IS NULL) OR pd.status IN (:#{#req.status}))
    """,
            nativeQuery = true)
    Page<ProductDetailOverviewProjection> getProductOverviewForClient(org.springframework.data.domain.Pageable pageable, @Param("req") FindProductOverviewDTO req);

    @Query(value = """
    SELECT
        p.id AS productId,
        GROUP_CONCAT(DISTINCT pd.product_code ORDER BY pd.product_code SEPARATOR ', ') AS productCode,
        p.name AS productName,
        p.description AS productDescription,
        GROUP_CONCAT(DISTINCT pd.price ORDER BY pd.price SEPARATOR ', ') AS price,
        b.name AS brand,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS colors,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS sizes,
        COALESCE(SUM(bd_agg.total_quantity), 0) AS totalSoldQuantity,
        m.name AS material,
        ts.name AS typeOfShoe,
        GROUP_CONCAT(DISTINCT pd.status ORDER BY pd.status SEPARATOR ', ') AS status,
        MIN(pd.url_image) AS urlImg
    FROM products p
    JOIN product_details pd ON p.id = pd.product_id
    JOIN sizes s ON pd.size_id = s.id
    JOIN colors c ON pd.color_id = c.id
    JOIN materials m ON m.id = p.material_id
    JOIN types_product ts ON ts.id = p.type_id
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN (
        SELECT product_detail_id, SUM(quantity) AS total_quantity
        FROM bill_details
        WHERE delete_flag = 0 OR delete_flag IS NULL
        GROUP BY product_detail_id
    ) bd_agg ON pd.id = bd_agg.product_detail_id
    WHERE p.created_date >= :minCreatedDate
    GROUP BY p.id, p.name, p.description, m.name, ts.name, b.name
    ORDER BY p.created_date DESC
    """,
            countQuery = """
    SELECT COUNT(DISTINCT p.id)
    FROM products p
    JOIN product_details pd ON p.id = pd.product_id
    WHERE p.created_date >= :minCreatedDate
    """,
            nativeQuery = true)
    Page<ProductDetailOverviewProjection> getNewArrivals(org.springframework.data.domain.Pageable pageable, @Param("minCreatedDate") Long minCreatedDate);

    @Query(value = """
    SELECT 
        p.id AS productId,
        p.name AS productName,
        MIN(pd.url_image) AS urlImg,
        SUM(bd.quantity) AS totalSoldQuantity,
        MIN(pd.price) AS price
    FROM 
        products p
    JOIN 
        product_details pd ON p.id = pd.product_id
    JOIN 
        bill_details bd ON pd.id = bd.product_detail_id
    JOIN 
        bills b ON bd.bill_id = b.id
    WHERE 
        b.status = 1 
        AND (bd.delete_flag = 0 OR bd.delete_flag IS NULL)
    GROUP BY 
        p.id, p.name
    HAVING 
        SUM(bd.quantity) > :minSold
    ORDER BY 
        totalSoldQuantity DESC
    """, nativeQuery = true)
    java.util.List<com.web.jewelry.dto.productDetailDTO.ProductBestsellerProjection> getBestSellers(@Param("minSold") long minSold);
}
