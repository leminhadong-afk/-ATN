package com.web.jewelry.dto.productDetailDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductFiltersResponse {

    private List<SimpleOption> brands;
    private List<SimpleOption> materials;
    private List<SimpleOption> types;
    private List<String> colors; // using name
    private List<String> sizes;  // using name

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimpleOption {
        private String id;
        private String name;
    }
}


