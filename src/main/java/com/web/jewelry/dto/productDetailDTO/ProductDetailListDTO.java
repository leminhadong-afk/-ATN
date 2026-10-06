package com.web.jewelry.dto.productDetailDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDetailListDTO {

    private Long rowNum;

    private String productCode;

    private String productId;

    private String productDetailId;

    private String productName;

    private String sizeName;

    private String brandName;

    private String typeName;

    private String materialName;

    private String colorName;

    private Double price;

    private Long createdDate;

    private Integer status;

    private Long quantity;

    private String urlImg;

}
