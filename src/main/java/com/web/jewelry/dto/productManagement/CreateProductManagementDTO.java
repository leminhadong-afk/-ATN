package com.web.jewelry.dto.productManagement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateProductManagementDTO {
    @NotBlank(message = "Không được để trống")
    private String name;

    @NotBlank(message = "Không được để trống")
    private String description;

    @NotBlank(message = "Không được để trống")
    private Integer status = 1;

    @NotNull(message = "Không được để trống")
    private String brandId;

    @NotNull (message = "Không được để trống")
    private String materialId;

    @NotNull (message = "Không được để trống")
    private String typeId;

    private List<CreateProductDetailManagementDTO> details;

}
