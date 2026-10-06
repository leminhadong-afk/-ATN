package com.web.jewelry.dto.brandManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeleteBrandRequestDTO {
    private String id;
    private String name;
    private Integer status;
}
