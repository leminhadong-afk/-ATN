package com.web.jewelry.dto.productManagement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductManagementDTO {
    @NotBlank(message = "Không được để trống")
    private String id;

    @NotBlank(message = "Không được để trống")
    private String name;

    @NotBlank(message = "Không được để trống")
    private String description;

    @NotBlank(message = "Không được để trống")
    private Integer status;

    @NotNull(message = "Không được để trống")
    private String brandId;

    @NotNull (message = "Không được để trống")
    private String materialId;

    @NotNull (message = "Không được để trống")
    private String typeId;

    @NotNull (message = "Không được để trống")
    private Integer deleteFlag;


}
