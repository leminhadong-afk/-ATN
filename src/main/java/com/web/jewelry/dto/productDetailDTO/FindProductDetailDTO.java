package com.web.jewelry.dto.productDetailDTO;

import com.web.jewelry.business.common.base.PageableRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindProductDetailDTO extends PageableRequest {
    private String id;

    private String productCode;

    private Integer status;

    private String brandId;

    private String materialId;

    private String typeId;

    private String colorId;

    private String sizeId;

    private Double price;

    private Double minPrice;

    private Double maxPrice;

}
