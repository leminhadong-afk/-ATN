package com.web.jewelry.dto.productDetailDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class FindProductOverviewDTO {

    private Integer page = 0;

    private Integer size = 20;

    private String name; // product name like

    private String productCode; // product code like

    private String brandId;

    private String materialId;

    private String typeId;

    private List<String> colors;

    private List<String> sizes;

    // Derived CSVs for native query compatibility with MySQL
    private String colorsCsv;

    private String sizesCsv;

    private Double minPrice;

    private Double maxPrice;

    private List<Integer> status; // product detail statuses
}


