package com.web.jewelry.dto.productManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductListDTO {

    private Long rowNum;

    private String id;

    private String productCode;

    private String productName;

    private Long createdDate;

    private Integer status;

    private Long totalQuantity;

    private String urlImg;





}
