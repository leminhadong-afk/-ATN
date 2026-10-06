package com.web.jewelry.repository;

import com.web.jewelry.dto.productDetailDTO.FindProductDetailDTO;
import com.web.jewelry.dto.productDetailDTO.ProductDetailManagementResponse;
import com.web.jewelry.entity.ProductDetailEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetailEntity,String> {
    @Query(value = """
    SELECT
            ROW_NUMBER() OVER (ORDER BY pd.created_date DESC) AS rowNum,
            p.id AS productId,
            pd.id AS productDetailId,
            p.name AS productName,
            pd.product_code AS productCode,
            pd.url_image AS urlImg,
            b.name AS brandName,
            t.name AS typeName,
            m.name AS materialName,
            c.name AS colorName,
            sz.name AS sizeName,
            pd.price AS price,
            pd.status AS status,
            pd.created_date AS createdDate,
            pd.quantity AS quantity
        FROM
            products p
        LEFT JOIN
            product_details pd ON p.id = pd.product_id
        LEFT JOIN
            brands b ON p.brand_id = b.id
        LEFT JOIN
            types_product t ON p.type_id = t.id
        LEFT JOIN
            materials m ON p.material_id = m.id
        LEFT JOIN
            colors c ON pd.color_id = c.id
        LEFT JOIN
            sizes sz ON pd.size_id = sz.id
          
    WHERE
        (:#{#req.productCode} IS NULL OR :#{#req.productCode} LIKE '' OR pd.product_code LIKE %:#{#req.productCode}%)
        AND (:#{#req.id} IS NULL OR :#{#req.id} LIKE '' OR p.id = :#{#req.id})
        AND (:#{#req.brandId} IS NULL OR :#{#req.brandId} LIKE '' OR b.id = :#{#req.brandId})
        AND (:#{#req.typeId} IS NULL OR :#{#req.typeId} LIKE '' OR t.id = :#{#req.typeId})
        AND (:#{#req.materialId} IS NULL OR :#{#req.materialId} LIKE '' OR m.id = :#{#req.materialId})
        AND (:#{#req.status} IS NULL OR :#{#req.status} LIKE '' OR pd.status = :#{#req.status})
        AND (:#{#req.colorId} IS NULL OR :#{#req.colorId} LIKE '' OR pd.color_id = :#{#req.colorId})
        AND (:#{#req.sizeId} IS NULL OR :#{#req.sizeId} LIKE '' OR pd.size_id = :#{#req.sizeId})
        AND ((:#{#req.minPrice} IS NULL OR pd.price >= :#{#req.minPrice})
            AND (:#{#req.maxPrice} IS NULL OR pd.price <= :#{#req.maxPrice}))
        
    ORDER BY
        pd.created_date DESC
    """, countQuery = """
    SELECT COUNT(p.id) 
    FROM
        products p
    LEFT JOIN
        product_details pd ON p.id = pd.product_id
    LEFT JOIN
        brands b ON p.brand_id = b.id
    LEFT JOIN
        types_product t ON p.type_id = t.id
    LEFT JOIN
        materials m ON p.material_id = m.id
    LEFT JOIN
        colors c ON pd.color_id = c.id
    LEFT JOIN
        sizes sz ON pd.size_id = sz.id
    WHERE 
        (:#{#req.productCode} IS NULL OR :#{#req.productCode} LIKE '' OR pd.product_code LIKE %:#{#req.productCode}%)
        AND (:#{#req.id} IS NULL OR :#{#req.id} LIKE '' OR p.id = :#{#req.id})
        AND (:#{#req.brandId} IS NULL OR :#{#req.brandId} LIKE '' OR b.id = :#{#req.brandId})
        AND (:#{#req.typeId} IS NULL OR :#{#req.typeId} LIKE '' OR t.id = :#{#req.typeId})
        AND (:#{#req.materialId} IS NULL OR :#{#req.materialId} LIKE '' OR m.id = :#{#req.materialId})
        AND (:#{#req.status} IS NULL OR :#{#req.status} LIKE '' OR pd.status = :#{#req.status})
        AND (:#{#req.colorId} IS NULL OR :#{#req.colorId} LIKE '' OR pd.color_id = :#{#req.colorId})
        AND (:#{#req.sizeId} IS NULL OR :#{#req.sizeId} LIKE '' OR pd.size_id = :#{#req.sizeId})
        AND ((:#{#req.minPrice} IS NULL OR pd.price >= :#{#req.minPrice})
            AND (:#{#req.maxPrice} IS NULL OR pd.price <= :#{#req.maxPrice}))
                                                                                           
    """, nativeQuery = true)

    Page<ProductDetailManagementResponse> getProductDetailResponse (Pageable pageable, @Param("req") FindProductDetailDTO req);

    List<ProductDetailEntity> findByProductId (String productId);

    @Query(value = """
    SELECT pd.product_code AS productCode 
    FROM product_details pd 
    ORDER BY pd.product_code DESC
    """, nativeQuery = true)
    List<String> findLatestProductCode();

    @Query(value = """
        SELECT SUM(pd.quantity) FROM product_details pd WHERE pd.status = 1
    """, nativeQuery = true)
    Long getTotalRemainingQuantity();



}
